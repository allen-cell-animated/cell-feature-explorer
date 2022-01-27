import axios, { AxiosResponse } from "axios";

import {
    FILE_INFO_KEYS,
    GROUP_BY_KEY,
    CELL_ID_KEY,
    FILE_INFO_KEY,
    ARRAY_OF_CELL_IDS_KEY,
    CELL_COUNT_KEY,
} from "../../../constants";

import {
    DataForPlot,
    FileInfo,
    MappingOfMeasuredValuesArrays,
} from "../../metadata/types";

import { ImageDataset } from "../types";
import { ViewerChannelSettings } from "@aics/web-3d-viewer/type-declarations";
import { find, indexOf } from "lodash";

interface DatasetInfo {
    name: string;
    version: string;
    id: string;
    image: string;
    description: string;
    userData: { [propName: string]: any };
    featureDefsPath: string;
    featuresDataPath: string;
    viewerSettingsPath: string;
    albumPath: string;
    thumbnailRoot: string;
    downloadRoot: string;
    volumeViewerDataRoot: string;
    xAxis: {
        default: string;
    }
    yAxis: {
        default: string;
    }
    colorBy: {
        default: string;
    }
    groupBy: {
        default: string;
    }
    featuresDisplayOrder: string[];
    featuresDataOrder: string[];
}

class JsonRequest implements ImageDataset {
    private listOfDatasetsDoc: string;
    private fileInfo: { [key: string]: FileInfo } = {};
    private viewerChannelSettings?: ViewerChannelSettings;

    private featureDefsPromise?: Promise<any[]>;

    private dataPromise?: Promise<DataForPlot>;

    private datasetInfo: DatasetInfo;

    constructor() {
        this.datasetInfo = {
            name: "",
            version: "",
            id: "",
            image: "",
            description: "",
            userData: {},
            featureDefsPath: "",
            featuresDataPath: "",
            viewerSettingsPath: "",
            albumPath: "",
            thumbnailRoot: "",
            downloadRoot: "",
            volumeViewerDataRoot: "",
            xAxis: {
                default: "",
            },
            yAxis: {
                default: "",
            },
            colorBy: {
                default: "",
            },
            groupBy: {
                default: "",
            },
            featuresDisplayOrder: [],
            featuresDataOrder: [],
        };

        // for now this particular file must be kept up to date.
        // dev-aics-dtp-001/cfedata is the designated repository of internal cfe data sets
        this.listOfDatasetsDoc =
            "http://dev-aics-dtp-001.corp.alleninstitute.org/cfedata/datasets.json";
    }

    public getAvailableDatasets = () => {
        return axios
            .get(`${this.listOfDatasetsDoc}`)
            .then((metadata: AxiosResponse) => metadata.data);
    };

    public selectDataset = (manifestPath: string) => {
        // clear locally cached data.
        this.viewerChannelSettings = undefined;

        return axios.get(`${manifestPath}`).then((metadata: AxiosResponse) => {
            const { data } = metadata;
            this.datasetInfo = data as DatasetInfo;
            return {
                defaultXAxis: data.xAxis.default,
                defaultYAxis: data.yAxis.default,
                defaultColorBy: data.colorBy.default,
                defaultGroupBy: data.groupBy.default,
                thumbnailRoot: data.thumbnailRoot,
                downloadRoot: data.downloadRoot,
                volumeViewerDataRoot: data.volumeViewerDataRoot,
            };
        });
    };

    private getJson = (docName: string) => {
        return axios.get(`${docName}`).then((metadata: AxiosResponse) => metadata.data);
    };

    public getViewerChannelSettings = () => {
        if (this.viewerChannelSettings) {
            return Promise.resolve(this.viewerChannelSettings);
        }
        return this.getJson(this.datasetInfo.viewerSettingsPath).then((data) => {
            this.viewerChannelSettings = data as ViewerChannelSettings;
            return this.viewerChannelSettings;
        });
    };

    public getMeasuredFeatureDefs = () => {
        if (this.featureDefsPromise) {
            return this.featureDefsPromise;
        }

        // make sure we have the feature defs first.
        this.featureDefsPromise = this.getJson(this.datasetInfo.featureDefsPath).then(
            (featureDefs) => {
                return featureDefs;
            }
        );
        return this.featureDefsPromise;
    };

    public getFeatureData = () => {
        if (this.dataPromise) {
            return this.dataPromise;
        }

        // ASSUME cell line defs AND feature defs are already loaded by the time the feature data arrives

        let featureKeys = [];
        return this.getMeasuredFeatureDefs().then((featureDefs) => {
            featureKeys = featureDefs.map((ele) => ele.key);
            if (
                !this.datasetInfo.featuresDataOrder ||
                this.datasetInfo.featuresDataOrder.length === 0
            ) {
                this.datasetInfo.featuresDataOrder = featureKeys;
            }
            // if display order is not provided, then use data order as display order.
            if (this.datasetInfo.featuresDisplayOrder.length === 0) {
                this.datasetInfo.featuresDisplayOrder = this.datasetInfo.featuresDataOrder.slice();
            }
            const dataMappedByMeasuredFeatures = this.datasetInfo.featuresDisplayOrder.reduce(
                (acc, featureName: string) => {
                    const initArray: number[] = [];
                    acc[featureName] = initArray;
                    return acc;
                },
                {} as MappingOfMeasuredValuesArrays
            );

            const categoryArray: string[] = [];
            const thumbnails: string[] = [];
            const ids: string[] = [];
            this.dataPromise = this.getJson(this.datasetInfo.featuresDataPath).then(
                (featureDataArray) => {
                    featureDataArray.forEach((el: any) => {
                        // FILE INFO
                        // number of file info property names must be same as number of file_info entries in data
                        if (FILE_INFO_KEYS.length !== el.file_info.length) {
                            throw new Error("Bad number of file_info entries in data");
                        }
                        // convert file_info array to obj
                        const fileInfo = {} as FileInfo;
                        el.file_info.forEach((f: string, i: number) => {
                            const key = FILE_INFO_KEYS[i] as FILE_INFO_KEY;

                            fileInfo[key] = f as never;
                        });
                        this.fileInfo[fileInfo[CELL_ID_KEY].toString()] = fileInfo;

                        // FEATURE DATA
                        // number of feature defs must be same as number of features
                        if (featureDefs.length !== el.features.length) {
                            throw new Error("Bad number of feature entries in data");
                        }

                        const groupByFeatureDef = find(featureDefs, {
                            key: this.datasetInfo.groupBy.default,
                        });

            
                        // increment count in feature def
                        if (groupByFeatureDef[CELL_COUNT_KEY] !== undefined) {
                            (groupByFeatureDef[CELL_COUNT_KEY] as number)++;
                        } else {
                            groupByFeatureDef[CELL_COUNT_KEY] = 1;
                        }

                        el.features.forEach((value: number, index: number) => {
                            const arrayOfValues = dataMappedByMeasuredFeatures[
                                this.datasetInfo.featuresDataOrder[index]
                            ] as (number | null)[];
                            if (isNaN(value)) {
                                arrayOfValues.push(null);
                            } else {
                                arrayOfValues.push(Number(value));
                            }
                        }, {});

                        const groupByValueIndex = indexOf(this.datasetInfo.featuresDataOrder, this.datasetInfo.groupBy.default)

                        const categoryValue = el.features[groupByValueIndex];
                        // augment file info with category value
                        this.fileInfo[this.datasetInfo.groupBy.default] = categoryValue;
                        const categoryInfo = groupByFeatureDef.options[categoryValue];

                        categoryArray.push(categoryInfo ? categoryInfo.key || categoryInfo.name : "");
                        thumbnails.push(fileInfo.thumbnailPath);
                        ids.push(fileInfo[CELL_ID_KEY].toString());
                    });
                    return {
                        values: dataMappedByMeasuredFeatures,
                        labels: {
                            [GROUP_BY_KEY]: categoryArray,
                            thumbnailPaths: thumbnails,
                            [ARRAY_OF_CELL_IDS_KEY]: ids,
                        },
                    };
                }
            );
            return this.dataPromise;
        });
    };

    public getFileInfoByCellId = (cellId: string) => {
        const fileInfo = this.fileInfo[cellId];
        // wrapped to match the return type on the database implementation
        // convert ides to string to match front end data structure where all ids are strings
        return Promise.resolve({
            ...fileInfo,
            CellId: fileInfo.CellId.toString(),
            FOVId: fileInfo.FOVId.toString(),
        });
    };

    public getFileInfoByArrayOfCellIds = (cellIds: string[]) => {
        return Promise.all(
            cellIds.map((id) => {
                return this.getFileInfoByCellId(id);
            })
        );
    };

    public getAlbumData = () => {
        if (!this.datasetInfo.albumPath) {
            return Promise.resolve([]);
        }
        return this.getJson(this.datasetInfo.albumPath);
    };
}

export default JsonRequest;

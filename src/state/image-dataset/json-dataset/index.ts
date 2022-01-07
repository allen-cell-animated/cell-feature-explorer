import axios, { AxiosResponse } from "axios";
import { find, map } from "lodash";

import {
    CELL_LINE_DEF_STRUCTURE_KEY,
    FILE_INFO_KEYS,
    CELL_LINE_DEF_NAME_KEY,
    PROTEIN_NAME_KEY,
    CELL_ID_KEY,
    FILE_INFO_KEY,
    ARRAY_OF_CELL_IDS_KEY,
    CELL_LINE_NAME_KEY,
    CELL_COUNT_KEY,
    CELL_LINE_DEF_GENE_KEY,
} from "../../../constants";
import {
    CELL_LINE_DEF_NAME_JSON_KEY,
    CELL_LINE_DEF_PROTEIN_JSON_KEY,
    CELL_LINE_DEF_STRUCTURE_JSON_KEY,
} from "./constants";
import {
    CellLineDef,
    DataForPlot,
    FileInfo,
    MappingOfMeasuredValuesArrays,
    MetadataStateBranch,
} from "../../metadata/types";

import { ImageDataset } from "../types";
import { ViewerChannelSettings } from "@aics/web-3d-viewer/type-declarations";

interface DatasetInfo {
    name: string;
    version: string;
    id: string;
    image: string;
    description: string;
    userData: { [propName: string]: any };
    featureDefsPath: string;
    featuresDataPath: string;
    cellLineDataPath: string;
    viewerSettingsPath: string;
    albumPath: string;
    thumbnailRoot: string;
    downloadRoot: string;
    volumeViewerDataRoot: string;
    defaultXAxis: string;
    defaultYAxis: string;
    defaultColorBy: string;
    featuresDisplayOrder: string[];
    featuresDataOrder: string[];
}

class JsonRequest implements ImageDataset {
    private listOfDatasetsDoc: string;
    private fileInfo: { [key: string]: FileInfo } = {};
    private cellLines: CellLineDef[] = [];
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
            cellLineDataPath: "",
            viewerSettingsPath: "",
            albumPath: "",
            thumbnailRoot: "",
            downloadRoot: "",
            volumeViewerDataRoot: "",
            defaultXAxis: "",
            defaultYAxis: "",
            defaultColorBy: "",
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
        return axios.get(`${manifestPath}`).then((metadata: AxiosResponse) => {
            const { data } = metadata;
            this.datasetInfo = data as DatasetInfo;
            return {
                defaultXAxis: data.defaultXAxis,
                defaultYAxis: data.defaultYAxis,
                defaultColorBy: data.defaultColorBy,
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

    public getCellLineDefs = () => {
        if (this.cellLines && this.cellLines.length > 0) {
            return Promise.resolve(this.cellLines);
        }

        return this.getJson(this.datasetInfo.cellLineDataPath)
            .then((data) => {
                const cellLines = map(data, (datum: MetadataStateBranch) => {
                    return {
                        [CELL_LINE_DEF_NAME_KEY]: datum[CELL_LINE_DEF_NAME_JSON_KEY],
                        [CELL_LINE_DEF_STRUCTURE_KEY]: datum[CELL_LINE_DEF_STRUCTURE_JSON_KEY],
                        [PROTEIN_NAME_KEY]: datum[CELL_LINE_DEF_PROTEIN_JSON_KEY],
                        [CELL_LINE_DEF_GENE_KEY]: datum[CELL_LINE_DEF_GENE_KEY],
                        [CELL_COUNT_KEY]: datum[CELL_COUNT_KEY] || 0,
                    };
                });
                this.cellLines = cellLines;
                return cellLines;
            })
            .then(() => {
                return this.getMeasuredFeatureDefs();
            })
            .then(() => {
                this.dataPromise = this.getFeatureData();
                return this.dataPromise;
            })
            .then(() => {
                // filter cell lines and return subset
                this.cellLines = this.cellLines.filter(
                    (cellLine) => (cellLine[CELL_COUNT_KEY] as number) > 0
                );
                return this.cellLines;
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

            const proteinArray: string[] = [];
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

                        const cellLine = find(this.cellLines, {
                            [CELL_LINE_DEF_NAME_KEY]: fileInfo[CELL_LINE_NAME_KEY],
                        });
                        if (!cellLine) {
                            throw new Error(
                                `Undefined cell line name ${fileInfo[CELL_LINE_NAME_KEY]}`
                            );
                        }
                        // augment file info with protein name
                        fileInfo[PROTEIN_NAME_KEY] = cellLine.structureProteinName;
                        // increment count in cell line
                        if (cellLine[CELL_COUNT_KEY] !== undefined) {
                            (cellLine[CELL_COUNT_KEY] as number)++;
                        } else {
                            cellLine[CELL_COUNT_KEY] = 1;
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

                        proteinArray.push(cellLine ? cellLine[PROTEIN_NAME_KEY] : "");
                        thumbnails.push(fileInfo.thumbnailPath);
                        ids.push(fileInfo[CELL_ID_KEY].toString());
                    });
                    return {
                        values: dataMappedByMeasuredFeatures,
                        labels: {
                            [PROTEIN_NAME_KEY]: proteinArray,
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

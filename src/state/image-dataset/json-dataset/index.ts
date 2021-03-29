import axios, { AxiosResponse } from "axios";
import { find, map } from "lodash";

import {
    CELL_LINE_DEF_STRUCTURE_KEY,
    FILE_INFO_KEYS,
    CELL_LINE_DEF_PROTEIN_KEY,
    CELL_LINE_DEF_NAME_KEY,
    PROTEIN_NAME_KEY,
    CELL_ID_KEY,
    FILE_INFO_KEY,
    ARRAY_OF_CELL_IDS_KEY,
    CELL_LINE_NAME_KEY,
    CELL_COUNT_KEY,
} from "../../../constants";
import {
    CELL_LINE_DEF_NAME_JSON_KEY,
    CELL_LINE_DEF_PROTEIN_JSON_KEY,
    CELL_LINE_DEF_STRUCTURE_JSON_KEY,
} from "./constants";
import {
    CellLineDef,
    FileInfo,
    MappingOfMeasuredValuesArrays,
    MetadataStateBranch,
} from "../../metadata/types";

import { ImageDataset } from "../types";

class JsonRequest implements ImageDataset {
    private albumPath: string;
    private featureDefsPath: string;
    private featuresDataPath: string;
    private cellLineDataPath: string;
    private thumbnailRoot: string;
    private downloadRoot: string;
    private volumeViewerDataRoot: string;
    private featuresDisplayOrder: string[];
    private featuresDataOrder: string[];
    private listOfDatasetsDoc: string;
    private fileInfo: { [key: string]: FileInfo } = {};
    private cellLines: CellLineDef[] = [];

    private featureDefinitions: any[] = [];

    constructor() {
        this.albumPath = "";
        this.featureDefsPath = "";
        this.featuresDataPath = "";
        this.cellLineDataPath = "";
        this.thumbnailRoot = "";
        this.downloadRoot = "";
        this.volumeViewerDataRoot = "";
        this.featuresDisplayOrder = [];
        this.featuresDataOrder = [];
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
            this.featureDefsPath = data.featureDefsPath;
            this.featuresDataPath = data.featuresDataPath;
            this.cellLineDataPath = data.cellLineDataPath;
            this.thumbnailRoot = data.thumbnailRoot;
            this.downloadRoot = data.downloadRoot;
            this.volumeViewerDataRoot = data.volumeViewerDataRoot;
            this.featuresDisplayOrder = data.featuresDisplayOrder;
            this.featuresDataOrder = data.featuresDataOrder;
            this.albumPath = data.albumPath;
            return {
                defaultXAxis: data.defaultXAxis,
                defaultYAxis: data.defaultYAxis,
                thumbnailRoot: data.thumbnailRoot,
                downloadRoot: data.downloadRoot,
                volumeViewerDataRoot: data.volumeViewerDataRoot,
            };
        });
    };

    private getJson = (docName: string) => {
        return axios.get(`${docName}`).then((metadata: AxiosResponse) => metadata.data);
    };

    public getCellLineDefs = () => {
        if (this.cellLines && this.cellLines.length > 0) {
            return Promise.resolve(this.cellLines);
        }

        return this.getJson(this.cellLineDataPath)
            .then((data) => {
                const cellLines = map(data, (datum: MetadataStateBranch) => {
                    return {
                        [CELL_LINE_DEF_NAME_KEY]: datum[CELL_LINE_DEF_NAME_JSON_KEY],
                        [CELL_LINE_DEF_STRUCTURE_KEY]: datum[CELL_LINE_DEF_STRUCTURE_JSON_KEY],
                        [PROTEIN_NAME_KEY]: datum[CELL_LINE_DEF_PROTEIN_JSON_KEY],
                        [CELL_COUNT_KEY]: datum[CELL_COUNT_KEY] || 0,
                    };
                });
                this.cellLines = cellLines;
                return cellLines;
            })
            .then(() => {
                this.getMeasuredFeatureDefs();
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
        if (this.featureDefinitions && this.featureDefinitions.length > 0) {
            return Promise.resolve(this.featureDefinitions);
        }

        // make sure we have the feature defs first.
        return this.getJson(this.featureDefsPath).then((featureDefs) => {
            this.featureDefinitions = featureDefs;
            return featureDefs;
        });
    };

    public getFeatureData = () => {
        // ASSUME cell line defs are already loaded

        const featureKeys = this.featureDefinitions.map((ele) => ele.key);
        if (!this.featuresDataOrder || this.featuresDataOrder.length === 0) {
            this.featuresDataOrder = featureKeys;
        }
        const dataMappedByMeasuredFeatures = featureKeys.reduce((acc, featureName: string) => {
            const initArray: number[] = [];
            acc[featureName] = initArray;
            return acc;
        }, {} as MappingOfMeasuredValuesArrays);
        const proteinArray: string[] = [];
        const thumbnails: string[] = [];
        const ids: string[] = [];
        return this.getJson(this.featuresDataPath).then((featureDataArray) => {
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
                if (this.featureDefinitions.length !== el.features.length) {
                    throw new Error("Bad number of feature entries in data");
                }

                const cellLine = find(this.cellLines, {
                    [CELL_LINE_DEF_NAME_KEY]: fileInfo[CELL_LINE_NAME_KEY],
                });
                if (!cellLine) {
                    throw new Error(`Undefined cell line name ${fileInfo[CELL_LINE_NAME_KEY]}`);
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
                        this.featuresDataOrder[index]
                    ] as number[];
                    arrayOfValues.push(value);
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
        if (!this.albumPath) {
            return Promise.resolve([]);
        }
        return this.getJson(this.albumPath);
    };
}

export default JsonRequest;

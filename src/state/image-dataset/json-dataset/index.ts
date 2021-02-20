import axios, { AxiosResponse } from "axios";
import { map } from "lodash";

import {
    CELL_LINE_DEF_STRUCTURE_KEY,
    FILE_INFO_KEYS,
    CELL_LINE_DEF_PROTEIN_KEY,
    CELL_COUNT_KEY,
    CELL_LINE_DEF_NAME_KEY,
    PROTEIN_NAME_KEY,
} from "../../../constants";
import { CellLineDef, MetadataStateBranch } from "../../metadata/types";
import {
    CELL_FEATURE_ANALYSIS_FILENAME,
    FEATURE_DEFS_FILENAME,
    ALBUMS_FILENAME,
} from "../constants";
import { ImageDataset } from "../types";

class JsonRequest implements ImageDataset {
    databaseDirectory: string;
    private labkeyCellDefName = "CellLineId/Name";
    private labkeyStructureKey = "StructureId/Name";
    private labkeyProteinKey = "ProteinId/DisplayName";
    private featureDefs: string;
    private featuresData: string;
    private cellLineData: string;
    private thumbnailRoot: string;
    private downloadRoot: string;
    private volumeViewerDataRoot: string;
    private featuresDisplayOrder: string;
    private listOfDatasetsDoc: string;

    private featureDefinitions: any[] = [];

    constructor() {
        this.featureDefs = "";
        this.featuresData = "";
        this.cellLineData = "";
        this.thumbnailRoot = "";
        this.downloadRoot = "";
        this.volumeViewerDataRoot = "";
        this.featuresDisplayOrder = "";
        this.databaseDirectory = "data";
        this.listOfDatasetsDoc = ""; // TODO: figure out how and where to initialize this.
    }

    public getAvailableDatasets = () => {
        return axios
            .get(`${this.listOfDatasetsDoc}`)
            .then((metadata: AxiosResponse) => metadata.data);
    };

    public selectDataset = (dir: string) => {
        return axios.get(`${dir}/dataset.json`).then((metadata: AxiosResponse) => {
            const { data } = metadata;
            this.databaseDirectory = dir;
            this.featureDefs = data.featureDefs;
            this.featuresData = data.featuresData;
            this.cellLineData = data.cellLineData;
            this.thumbnailRoot = data.thumbnailRoot;
            this.downloadRoot = data.downloadRoot;
            this.volumeViewerDataRoot = data.volumeViewerDataRoot;
            this.featuresDisplayOrder = data.featuresDisplayOrder;
            return {
                defaultXAxis: data.defaultXAxis,
                defaultYAxis: data.defaultYAxis,
            };
        });
    };

    private getJson = (docName: string) => {
        return axios
            .get(`${this.databaseDirectory}/${docName}.json`)
            .then((metadata: AxiosResponse) => metadata.data);
    };

    public getCellLineDefs = () => {
        return this.getJson(this.cellLineData).then((data) => {
            return map(data, (datum: MetadataStateBranch) => {
                return {
                    [CELL_LINE_DEF_NAME_KEY]: datum[CELL_LINE_DEF_NAME_KEY],
                    [CELL_LINE_DEF_STRUCTURE_KEY]: datum[CELL_LINE_DEF_STRUCTURE_KEY],
                    [PROTEIN_NAME_KEY]: datum[CELL_LINE_DEF_PROTEIN_KEY],
                };
            });
        });
    };

    public getMeasuredFeatureDefs = () => {
   // make sure we have the feature defs first.
        return this.getJson(FEATURE_DEFS_FILENAME)
            .then((featureDefs) => {
                this.featureDefinitions = featureDefs;
                return featureDefs
            })
    };

    public getFeatureData = () => {
        // helper function
        function getFullFeatureName(featureDef: any) {
            return `${featureDef.displayName} (${featureDef.unit})`;
        }
        return this.getJson(CELL_FEATURE_ANALYSIS_FILENAME)
            .then((featureDataArray) => {
                // transform data in place to save memory
                featureDataArray.forEach((el: any) => {
                    // number of feature defs must be same as number of features
                    if (this.featureDefinitions.length !== el.features.length) {
                        throw new Error("Bad number of feature entries in data");
                    }
                    el["measured_features"] = {};
                    el.features.forEach((f: any, i: number) => {
                        el.measured_features[getFullFeatureName(this.featureDefinitions[i])] = f;
                    });
                    // now el.features is totally replaced by el.measured_features
                    delete el.features;

                    // number of file info property names must be same as number of file_info entries in data
                    if (FILE_INFO_KEYS.length !== el.file_info.length) {
                        throw new Error("Bad number of file_info entries in data");
                    }
                    // convert file_info array to obj
                    const fileInfo: Record<string, any> = {};
                    el.file_info.forEach((f: any, i: number) => {
                        fileInfo[FILE_INFO_KEYS[i]] = f;
                    });

                    el["file_info"] = fileInfo;
                });
                return featureDataArray;
            });
    };

    public getAlbumData = () => {
        return this.getJson(ALBUMS_FILENAME);
    };
}

export default JsonRequest;

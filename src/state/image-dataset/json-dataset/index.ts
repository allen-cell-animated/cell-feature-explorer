import axios, { AxiosResponse } from "axios";
import { reduce } from "lodash";

import {
    CELL_LINE_DEF_PROTEIN_KEY,
    CELL_LINE_DEF_STRUCTURE_KEY,
    BASE_API_URL,
    FILE_INFO_KEYS,
} from "../../../constants";
import { CellLineDef, MetadataStateBranch } from "../../metadata/types";
import {
    CELL_LINE_DEF_FILENAME,
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
    public featureDefs: string;
    public featuresData: string;
    public cellLineData: string;
    public thumbnailRoot: string;
    public downloadRoot: string;
    public volumeViewerDataRoot: string;
    public featuresDisplayOrder: string;
    public listOfDatasetsDoc: string;

    private featureDefinitions: any[] = [];

    constructor() {
        this.featureDefs = "";
        this.featuresData = "";
        this.cellLineData = "";
        this.thumbnailRoot = "";
        this.downloadRoot = "";
        this.volumeViewerDataRoot = "";
        this.featuresDisplayOrder = "";
        this.databaseDirectory = "";
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

    public getCellLineData = () => {
        return this.getJson(CELL_LINE_DEF_FILENAME).then((data) => {
            return reduce(
                data,
                (accumulator: CellLineDef, datum: MetadataStateBranch) => {
                    accumulator[datum[this.labkeyCellDefName]] = {
                        [CELL_LINE_DEF_STRUCTURE_KEY]: datum[this.labkeyStructureKey],
                        [CELL_LINE_DEF_PROTEIN_KEY]: datum[this.labkeyProteinKey],
                    };
                    return accumulator;
                },
                {}
            );
        });
    };

    public getFeatureData = () => {
        // helper function
        function getFullFeatureName(featureDef: any) {
            return `${featureDef.displayName} (${featureDef.unit})`;
        }

        // make sure we have the feature defs first.
        return this.getJson(FEATURE_DEFS_FILENAME)
            .then((featureDefs) => {
                this.featureDefinitions = featureDefs;
                return this.getJson(CELL_FEATURE_ANALYSIS_FILENAME);
            })
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

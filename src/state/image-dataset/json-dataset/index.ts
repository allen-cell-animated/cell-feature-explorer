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
    baseUrl: string;
    private labkeyCellDefName = "CellLineId/Name";
    private labkeyStructureKey = "StructureId/Name";
    private labkeyProteinKey = "ProteinId/DisplayName";

    private featureDefs: any[] = [];

    constructor() {
        this.baseUrl = BASE_API_URL;
    }
    private getJson = (docName: string) => {
        return axios
            .get(`${this.baseUrl}/${docName}.json`)
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
                this.featureDefs = featureDefs;
                return this.getJson(CELL_FEATURE_ANALYSIS_FILENAME);
            })
            .then((featureDataArray) => {
                // transform data in place to save memory
                featureDataArray.forEach((el: any) => {
                    // number of feature defs must be same as number of features
                    if (this.featureDefs.length !== el.features.length) {
                        throw new Error("Bad number of feature entries in data");
                    }
                    el["measured_features"] = {};
                    el.features.forEach((f: any, i: number) => {
                        el.measured_features[getFullFeatureName(this.featureDefs[i])] = f;
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

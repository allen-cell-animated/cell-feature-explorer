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
            return `${featureDef.name} (${featureDef.unit})`;
        }
        let outerFeatureDefs: any[] = [];

        // make sure we have the feature defs first.
        return this.getJson(FEATURE_DEFS_FILENAME)
            .then((featureDefs) => {
                outerFeatureDefs = featureDefs;
                return this.getJson(CELL_FEATURE_ANALYSIS_FILENAME);
            })
            .then((featureDataArray) => {
                // transform data in place to save memory
                featureDataArray.forEach((el: any) => {
                    el["measured_features"] = {};
                    el.features.forEach((f: any, i: number) => {
                        el.measured_features[getFullFeatureName(outerFeatureDefs[i])] = f;
                    });
                    // now el.features is totally replaced by el.measured_features
                    delete el.features;

                    // convert file_info array to obj
                    el["file_info"] = {
                        [FILE_INFO_KEYS[0]]: el.file_info[0],
                        [FILE_INFO_KEYS[1]]: el.file_info[1],
                        [FILE_INFO_KEYS[2]]: el.file_info[2],
                        [FILE_INFO_KEYS[3]]: el.file_info[3],
                        [FILE_INFO_KEYS[4]]: el.file_info[4],
                        [FILE_INFO_KEYS[5]]: el.file_info[5],
                        [FILE_INFO_KEYS[6]]: el.file_info[6],
                    };
                });
                return featureDataArray;
            })
            .catch();
        //return this.getJson(CELL_FEATURE_ANALYSIS_FILENAME)
    };

    public getAlbumData = () => {
        return this.getJson(ALBUMS_FILENAME);
    };
}

export default JsonRequest;

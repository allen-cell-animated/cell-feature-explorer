import axios, { AxiosResponse } from "axios";
import { reduce } from "lodash";

import {
    CELL_LINE_DEF_PROTEIN_KEY,
    CELL_LINE_DEF_STRUCTURE_KEY,
    BASE_API_URL,
} from "../../../constants";
import { CellLineDef, MetadataStateBranch } from "../../metadata/types";
import { CELL_LINE_DEF_FILENAME, CELL_FEATURE_ANALYSIS_FILENAME, ALBUMS_FILENAME } from "../constants";
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
        return axios.get(`${this.baseUrl}/${docName}.json`)
            .then((metadata: AxiosResponse) => JSON.parse(metadata.data))

    }

    public getCellLineData = () => {
        return this.getJson(CELL_LINE_DEF_FILENAME)
            .then((data) => {
                return reduce(data, (accumulator: CellLineDef, datum: MetadataStateBranch) => {
                    accumulator[datum[this.labkeyCellDefName]] = {
                        [CELL_LINE_DEF_STRUCTURE_KEY]: datum[this.labkeyStructureKey],
                        [CELL_LINE_DEF_PROTEIN_KEY]: datum[this.labkeyProteinKey],
                    };
                    return accumulator;
                }, {});
            })
    }

    public getFeatureData = () => {
        return this.getJson(CELL_FEATURE_ANALYSIS_FILENAME)
    }

    public getAlbumData = () => {
        return this.getJson(ALBUMS_FILENAME)

    }
}

export default JsonRequest;
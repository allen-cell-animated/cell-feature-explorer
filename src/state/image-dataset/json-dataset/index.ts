import axios, { AxiosResponse } from "axios";
import { map } from "lodash";

import {
    CELL_LINE_DEF_STRUCTURE_KEY,
    BASE_API_URL,
    PROTEIN_NAME_KEY,
    CELL_LINE_DEF_NAME_KEY,
} from "../../../constants";
import { MetadataStateBranch } from "../../metadata/types";
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
            .then((metadata: AxiosResponse) => metadata.data)

    }

    public getCellLineData = () => {
        return this.getJson(CELL_LINE_DEF_FILENAME)
            .then((data) => {
                return map(data, (datum: MetadataStateBranch) => ({
                        [CELL_LINE_DEF_STRUCTURE_KEY]: datum[this.labkeyStructureKey],
                        [CELL_LINE_DEF_NAME_KEY]: datum[this.labkeyCellDefName],
                        [PROTEIN_NAME_KEY]: datum[this.labkeyProteinKey],
                        cellCount: 0,
                    }))
            })
    }

    public getFeatureData = async () => {
        const dataset = await  this.getJson(CELL_FEATURE_ANALYSIS_FILENAME)
        return {dataset}
    }

    public getAlbumData = () => {
        return this.getJson(ALBUMS_FILENAME)

    }
}

export default JsonRequest;
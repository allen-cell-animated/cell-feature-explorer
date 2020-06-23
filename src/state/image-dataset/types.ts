import { CellLineDef, MetadataStateBranch } from "../metadata/types";
import { Album } from "../types";

const GET_CELL_LINE_DATA = "getCellLineData";
const GET_FEATURE_DATA = "getFeatureData";
const GET_ALBUM_DATA = "getAlbumData";

export const requiredKeys = [GET_CELL_LINE_DATA, GET_FEATURE_DATA, GET_ALBUM_DATA];

export interface ImageDataset {
    [GET_CELL_LINE_DATA]: () => Promise<CellLineDef>;
    [GET_FEATURE_DATA]: () => Promise<MetadataStateBranch[]>;
    [GET_ALBUM_DATA]: () => Promise<Album[]>;
}
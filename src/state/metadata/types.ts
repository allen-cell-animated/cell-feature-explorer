import {
    CELL_ID_KEY,
    PROTEIN_NAME_KEY,
    THUMBNAIL_DIR_KEY
} from "../../constants/index";

export interface MetadataStateBranch {
    [key: string]: any;
}

export interface FileInfo {
    [CELL_ID_KEY]: string;
    [THUMBNAIL_DIR_KEY]: string;
    [PROTEIN_NAME_KEY]: string;
}

export interface MeasuredFeatures {
    [key: string]: number;
}

export interface MetaData {
    file_info: FileInfo;
    measured_features: MeasuredFeatures;
}

export interface ReceiveAction {
    payload: MetaData;
    type: string;
}

export interface RequestAction {
    type: string;
}

import {
    CELL_ID_KEY,
    CELL_LINE_DEF_PROTEIN_KEY,
    CELL_LINE_DEF_STRUCTURE_KEY,
    CELL_LINE_NAME_KEY,
    FOV_ID_KEY,
    PROTEIN_NAME_KEY,
} from "../../constants";
import { Album } from "../types";

export interface MetadataStateBranch {
    [key: string]: any;
}

export interface CellLineDef {
    [key: string]: {
        [CELL_LINE_DEF_STRUCTURE_KEY]: string;
        [CELL_LINE_DEF_PROTEIN_KEY]: string;
    };
}

export interface FileInfo {
    [CELL_ID_KEY]: number;
    [CELL_LINE_NAME_KEY]: string;
    [FOV_ID_KEY]: string;
    [PROTEIN_NAME_KEY]: string;
}

export interface MeasuredFeatureDef {
    discrete: boolean;
    displayName: string;
    key: string;
    unit?: string;
}

export interface MeasuredFeatures {
    [key: string]: number;
}

export interface MetaData {
    file_info: FileInfo;
    measured_features: MeasuredFeatures;
    clusters: any;
}

export interface ReceiveMeasuredFeaturesAction {
    payload: MetadataStateBranch[];
    type: string;
}

export interface ReceiveAction {
    payload: MetaData[];
    type: string;
}

export interface ReceiveCellLineAction {
    payload: CellLineDef;
    type: string;
}

export interface ReceiveAlbumDataAction {
    payload: Album[];
    type: string;
}

export interface RequestAction {
    type: string;
}

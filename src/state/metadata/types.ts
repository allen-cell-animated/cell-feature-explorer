import {
    CELL_COUNT_KEY,
    CELL_ID_KEY,
    CELL_LINE_DEF_NAME_KEY,
    CELL_LINE_DEF_STRUCTURE_KEY,
    CELL_LINE_NAME_KEY,
    FOV_ID_KEY,
    FOV_THUMBNAIL_PATH,
    FOV_VOLUME_VIEWER_PATH,
    PROTEIN_NAME_KEY,
    THUMBNAIL_PATH,
    VOLUME_VIEWER_PATH,
} from "../../constants";
import { Album } from "../types";

export interface MetadataStateBranch {
    [key: string]: any;
}

// FROM THE DATABASE TYPINGS

export interface CellLineDef {
    [CELL_LINE_DEF_NAME_KEY]: string;
    [CELL_LINE_DEF_STRUCTURE_KEY]: string;
    [PROTEIN_NAME_KEY]: string;
    [CELL_COUNT_KEY]: number;
}

export interface FileInfo {
    [CELL_ID_KEY]: number;
    [CELL_LINE_NAME_KEY]: string;
    [FOV_ID_KEY]: number;
    [PROTEIN_NAME_KEY]: string;
    [FOV_THUMBNAIL_PATH]?: string;
    [FOV_VOLUME_VIEWER_PATH]?: string;
    [THUMBNAIL_PATH]?: string;
    [VOLUME_VIEWER_PATH]?: string;
}

export interface MeasuredFeaturesOption {
    color: string;
    name: string;
}

export type MeasuredFeaturesOptions = { [key: string]: MeasuredFeaturesOption };

export interface MeasuredFeatureDef {
    discrete: boolean;
    displayName: string;
    key: string;
    unit?: string;
    options: MeasuredFeaturesOptions;
}

// DATA HELD IN STATE TYPINGS
export interface MappingOfCellDataArrays {
    [key: string]: number[]| FileInfo[] | string[];
}

export interface MeasuredFeatures {
    [key: string]: number;
}

// ACTIONS

export interface ReceiveMeasuredFeaturesAction {
    payload: MetadataStateBranch[];
    type: string;
}

export interface ReceiveAction {
    payload: MetadataStateBranch;
    type: string;
}

export interface ReceiveCellLineAction {
    payload: CellLineDef[];
    type: string;
}

export interface ReceiveCellFileInfoAction {
    payload: FileInfo[];
    type: string;
}

export interface ReceiveAlbumDataAction {
    payload: Album[];
    type: string;
}

export interface RequestAction {
    type: string;
}

export interface SetLoadingAction {
    payload: boolean;
    type: string;
}
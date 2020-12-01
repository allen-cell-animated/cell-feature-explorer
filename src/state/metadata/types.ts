import {
    CELL_ID_KEY,
    CELL_LINE_DEF_NAME_KEY,
    CELL_LINE_DEF_PROTEIN_KEY,
    CELL_LINE_DEF_STRUCTURE_KEY,
    CELL_LINE_NAME_KEY,
    FOV_ID_KEY,
    PROTEIN_NAME_KEY,
} from "../../constants";
import { DatasetMetaData } from "../../constants/datasets";
import { Album } from "../types";

export interface MetadataStateBranch {
    [key: string]: any;
}

// FROM THE DATABASE TYPINGS

export interface CellLineDef {
    [CELL_LINE_DEF_NAME_KEY]: string;
    [CELL_LINE_DEF_STRUCTURE_KEY]: string;
    [PROTEIN_NAME_KEY]: string;
    cellCount: number;
}

export interface FileInfo {
    [CELL_ID_KEY]: number;
    [CELL_LINE_NAME_KEY]: string;
    [FOV_ID_KEY]: number;
    [PROTEIN_NAME_KEY]: string;
    fovThumbnailPath?: string;
    fovVolumeviewerPath?: string;
    thumbnailPath?: string;
    volumeviewerPath?: string;
}

export interface MeasuredFeatureDef {
    discrete: boolean;
    displayName: string;
    key: string;
    unit?: string;
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

export interface ReceiveAvailableDatasetsAction {
    payload: DatasetMetaData[];
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
    payload: boolean | string;
    type: string;
}
import {
    CELL_ID_KEY,
    FOV_ID_KEY,
    FOV_THUMBNAIL_PATH,
    FOV_VOLUME_VIEWER_PATH,
    GROUP_BY_KEY,
    THUMBNAIL_PATH,
    VOLUME_VIEWER_PATH,
} from "../../constants";
import { Megaset } from "../image-dataset/types";
import { Album } from "../types";
import { ViewerChannelSettings } from "@aics/web-3d-viewer/type-declarations";

export interface MetadataStateBranch {
    [key: string]: any;
}

// FROM THE DATABASE TYPINGS

export interface FileInfo {
    [CELL_ID_KEY]: string;
    [GROUP_BY_KEY]: string; //
    [FOV_ID_KEY]: string;
    [GROUP_BY_KEY]: string;
    [FOV_THUMBNAIL_PATH]: string;
    [FOV_VOLUME_VIEWER_PATH]: string;
    [THUMBNAIL_PATH]: string;
    [VOLUME_VIEWER_PATH]: string;
    index?: number;
}

export interface MeasuredFeaturesOption {
    color: string;
    name: string;
    key?: string;
    count?: number;
}

export type MeasuredFeaturesOptions = { [key: string]: MeasuredFeaturesOption };

export interface MeasuredFeatureDef {
    discrete: boolean;
    displayName: string;
    key: string;
    unit?: string;
    options: MeasuredFeaturesOptions;
    tooltip: string;
}

// DATA HELD IN STATE TYPINGS
export interface MappingOfMeasuredValuesArrays {
    [key: string]: number[];
}

export interface MappingOfMeasuredValuesArraysWithNulls {
    [key: string]: (number | null)[];
}

export interface MeasuredFeatures {
    [key: string]: number;
}

export interface MeasuredFeaturesWithCategoryNames {
    [key: string]: number[] | string[];
}

export interface PerCellLabels {
    thumbnailPaths: string[];
    cellIds: string[];
    [key: string]: string[];
}

export interface DataForPlot {
    indices: number[];
    values: MappingOfMeasuredValuesArrays;
    labels: PerCellLabels;
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
    payload: Megaset[];
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

export interface ReceiveViewerChannelSettingsAction {
    payload: ViewerChannelSettings;
    type: string;
}

export interface RequestAction {
    type: string;
}

export interface SetLoadingAction {
    payload: boolean | string;
    type: string;
}

export interface SetSmallScreenWarningAction {
    payload: boolean;
    type: string;
}

export interface ClearAction {
    type: string;
}

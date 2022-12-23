import {
    CELL_ID_KEY,
    FOV_ID_KEY,
    FOV_THUMBNAIL_PATH,
    FOV_VOLUME_VIEWER_PATH,
    GROUP_BY_KEY,
    THUMBNAIL_PATH,
    TRANSFORM,
    VOLUME_VIEWER_PATH,
} from "../../constants";
import { Megaset } from "../image-dataset/types";
import { Album } from "../types";
import { ViewerChannelSettings } from "@aics/web-3d-viewer/type-declarations";

export interface MetadataStateBranch {
    albums: Album[];
    cellFileInfo: FileInfo[];
    isLoading: boolean;
    loadingText: string;
    showSmallScreenWarning: boolean;
    megasets: Megaset[];
    featureData: {
        indices: number[];
        values: MappingOfMeasuredValuesArrays;
        labels: PerCellLabels;
    };
    measuredFeaturesDefs: MeasuredFeatureDef[];
    viewerChannelSettings: ViewerChannelSettings;
}

// FROM THE DATABASE TYPINGS

export interface FileInfo {
    [CELL_ID_KEY]: string;
    [FOV_ID_KEY]: string;
    [FOV_THUMBNAIL_PATH]: string;
    [FOV_VOLUME_VIEWER_PATH]: string;
    [THUMBNAIL_PATH]: string;
    [VOLUME_VIEWER_PATH]: string;
    [TRANSFORM]?: {
        translation: [number, number, number];
        rotation: [number, number, number];
    };
    [GROUP_BY_KEY]?: string;
    index?: number; // added to the data after it's loaded for fast lookup into other array
}

export interface MeasuredFeaturesOption {
    color: string;
    name: string;
    key?: string;
    count?: number;
}

export type MeasuredFeaturesOptions = { [key: string]: MeasuredFeaturesOption };

export interface ContinuousMeasuredFeatureDef {
    discrete: false;
    displayName: string;
    description: string;
    key: string;
    unit?: string;
    tooltip: string;
}

export interface DiscreteMeasuredFeatureDef {
    discrete: true;
    displayName: string;
    description: string;
    key: string;
    unit?: string;
    options: MeasuredFeaturesOptions;
    tooltip: string;
}

export type MeasuredFeatureDef = ContinuousMeasuredFeatureDef | DiscreteMeasuredFeatureDef;

// DATA HELD IN STATE TYPINGS
export interface MappingOfMeasuredValuesArrays {
    [key: string]: (number | null)[];
}

export interface PerCellLabels {
    thumbnailPaths: string[];
    cellIds: string[];
    [key: string]: string[];
}

export interface MeasuredFeaturesWithCategoryNames {
    [key: string]: string[] | (number | null)[];
}

export interface DataForPlot {
    indices: number[];
    values: MappingOfMeasuredValuesArrays;
    labels: PerCellLabels;
}

// ACTIONS

export interface ReceiveAction {
    payload: { [key: string]: any };
    type: string;
}

export interface ReceiveMeasuredFeaturesAction {
    payload: MeasuredFeatureDef[];
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

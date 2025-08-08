import { ViewerChannelSettings } from "@aics/vole-app";

import { Megaset } from "../image-dataset/types";
import { Album } from "../types";

import {
    CLEAR_DATASET_VALUES,
    RECEIVE_ALBUM_DATA,
    RECEIVE_AVAILABLE_DATASETS,
    RECEIVE_CELL_FILE_INFO,
    RECEIVE_MEASURED_FEATURE_DEFS,
    RECEIVE_DATA_FOR_PLOT,
    RECEIVE_VIEWER_CHANNEL_SETTINGS,
    REQUEST_ALBUM_DATA,
    REQUEST_AVAILABLE_DATASETS,
    REQUEST_CELL_FILE_INFO,
    REQUEST_FEATURE_DATA,
    REQUEST_VIEWER_CHANNEL_SETTINGS,
    SET_IS_LOADING,
    SET_LOADING_TEXT,
    SET_SHOW_SMALL_SCREEN_WARNING,
} from "./constants";
import {
    DataForPlot,
    FileInfo,
    MeasuredFeatureDef,
    ReceiveAction,
    ReceiveAlbumDataAction,
    ReceiveAvailableDatasetsAction,
    ReceiveCellFileInfoAction,
    ReceiveMeasuredFeaturesAction,
    ReceiveViewerChannelSettingsAction,
    RequestAction,
    SetLoadingAction,
    SetSmallScreenWarningAction,
} from "./types";

export function requestAvailableDatasets() {
    return { type: REQUEST_AVAILABLE_DATASETS };
}
export function receiveAvailableDatasets(
    payload: Megaset[]
): ReceiveAvailableDatasetsAction {
    return {
        payload,
        type: RECEIVE_AVAILABLE_DATASETS,
    };
}

export function clearDatasetValues() {
    return {
        type: CLEAR_DATASET_VALUES,
    };
}

export function receiveFileInfoData(payload: FileInfo[]): ReceiveCellFileInfoAction {
    return {
        payload,
        type: RECEIVE_CELL_FILE_INFO,
    };
}

export function receiveDataForPlot(payload: DataForPlot): ReceiveAction {
    return {
        payload,
        type: RECEIVE_DATA_FOR_PLOT,
    };
}

export function receiveMeasuredFeatureDefs(
    payload: MeasuredFeatureDef[]
): ReceiveMeasuredFeaturesAction {
    return {
        payload,
        type: RECEIVE_MEASURED_FEATURE_DEFS,
    };
}

export function requestCellFileInfoData(): RequestAction {
    return {
        type: REQUEST_CELL_FILE_INFO,
    };
}

export function requestFeatureData(): RequestAction {
    return {
        type: REQUEST_FEATURE_DATA,
    };
}

export function requestAlbumData(): RequestAction {
    return {
        type: REQUEST_ALBUM_DATA,
    };
}

export function receiveAlbumData(payload: Album[]): ReceiveAlbumDataAction {
    return {
        payload,
        type: RECEIVE_ALBUM_DATA,
    };
}

export function requestViewerChannelSettings(): RequestAction {
    return {
        type: REQUEST_VIEWER_CHANNEL_SETTINGS,
    };
}

export function receiveViewerChannelSettings(
    payload: ViewerChannelSettings
): ReceiveViewerChannelSettingsAction {
    return {
        payload,
        type: RECEIVE_VIEWER_CHANNEL_SETTINGS,
    };
}

export function stopLoading(): SetLoadingAction {
    return {
        payload: false,
        type: SET_IS_LOADING,
    };
}

export function setLoadingText(payload: string): SetLoadingAction {
    return {
        payload,
        type: SET_LOADING_TEXT,
    };
}

export function setShowSmallScreenWarning(payload: boolean): SetSmallScreenWarningAction {
    return {
        payload,
        type: SET_SHOW_SMALL_SCREEN_WARNING,
    };
}

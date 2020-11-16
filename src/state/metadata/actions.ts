import { Album } from "../types";

import {
    RECEIVE_ALBUM_DATA,
    RECEIVE_CELL_FILE_INFO,
    RECEIVE_CELL_LINE_DATA,
    RECEIVE_MEASURED_FEATURE_NAMES,
    RECEIVE_METADATA,
    REQUEST_ALBUM_DATA,
    REQUEST_CELL_FILE_INFO,
    REQUEST_CELL_LINE_DATA,
    REQUEST_FEATURE_DATA,
    SET_IS_LOADING,
} from "./constants";
import {
    CellLineDef,
    FileInfo,
    MetadataStateBranch,
    ReceiveAction,
    ReceiveAlbumDataAction,
    ReceiveCellFileInfoAction,
    ReceiveCellLineAction,
    ReceiveMeasuredFeaturesAction,
    RequestAction,
    SetLoadingAction,
} from "./types";

export function receiveCellLineData(payload: CellLineDef[]): ReceiveCellLineAction {
    return {
        payload,
        type: RECEIVE_CELL_LINE_DATA,
    };
}

export function receiveFileInfoData(payload: FileInfo[]): ReceiveCellFileInfoAction {
    return {
        payload,
        type: RECEIVE_CELL_FILE_INFO,
    };
}


export function receiveMetadata(payload:MetadataStateBranch): ReceiveAction {
    return {
        payload,
        type: RECEIVE_METADATA,
    };
}


export function receiveMeasuredFeatureNames(payload: MetadataStateBranch[]): ReceiveMeasuredFeaturesAction {
    return {
        payload,
        type: RECEIVE_MEASURED_FEATURE_NAMES,
    };
}

export function requestCellLineData(): RequestAction {
    return {
        type: REQUEST_CELL_LINE_DATA,
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

export function setIsLoading(payload: boolean): SetLoadingAction {
    return {
        payload,
        type: SET_IS_LOADING
    }
}
import { DatasetMetaData } from "../../constants/datasets";
import { Album } from "../types";

import {
    RECEIVE_ALBUM_DATA,
    RECEIVE_AVAILABLE_DATASETS,
    RECEIVE_CELL_FILE_INFO,
    RECEIVE_CELL_LINE_DATA,
    RECEIVE_MEASURED_FEATURE_NAMES,
    RECEIVE_METADATA,
    REQUEST_ALBUM_DATA,
    REQUEST_AVAILABLE_DATASETS,
    REQUEST_CELL_FILE_INFO,
    REQUEST_CELL_LINE_DATA,
    REQUEST_FEATURE_DATA,
    SET_IS_LOADING,
    SET_LOADING_TEXT,
} from "./constants";
import {
    CellLineDef,
    MetaData,
    MetadataStateBranch,
    ReceiveAction,
    ReceiveAlbumDataAction,
    ReceiveAvailableDatasetsAction,
    ReceiveCellLineAction,
    ReceiveMeasuredFeaturesAction,
    RequestAction,
    SetLoadingAction,
} from "./types";

export function requestAvailableDatasets() {
    return { type: REQUEST_AVAILABLE_DATASETS };
}
export function receiveAvailableDatasets(
           payload: DatasetMetaData[]
       ): ReceiveAvailableDatasetsAction {
           return {
               payload,
               type: RECEIVE_AVAILABLE_DATASETS,
           };
       }

export function receiveCellLineData(payload: CellLineDef): ReceiveCellLineAction {
    return {
        payload,
        type: RECEIVE_CELL_LINE_DATA,
    };
}

export function receiveFileInfoData(payload: CellLineDef): ReceiveCellLineAction {
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

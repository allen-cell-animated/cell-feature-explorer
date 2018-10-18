import {
    RECEIVE_CELL_LINE_DATA,
    RECEIVE_METADATA,
    REQUEST_CELL_LINE_DATA,
    REQUEST_FEATURE_DATA,
} from "./constants";
import {
    CellLineDef,
    MetaData,
    ReceiveAction,
    RequestAction,
    RequestFeatureDataAction
} from "./types";

export function receiveMetadata(payload: MetaData): ReceiveAction {
    return {
        payload,
        type: RECEIVE_METADATA,
    };
}

export function requestCellLineData(): RequestAction {
    return {
        type: REQUEST_CELL_LINE_DATA,
    };
}

export function requestFeatureData(payload: CellLineDef): RequestFeatureDataAction {
    return {
        payload,
        type: REQUEST_FEATURE_DATA,
    };
}

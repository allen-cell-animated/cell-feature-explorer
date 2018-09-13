import {
    RECEIVE_METADATA,
    REQUEST_FEATURE_DATA,
} from "./constants";
import {
    MetaData,
    ReceiveAction,
    RequestAction
} from "./types";

export function receiveMetadata(payload: MetaData): ReceiveAction {
    return {
        payload,
        type: RECEIVE_METADATA,
    };
}

export function requestFeatureData(): RequestAction {
    return {
        type: REQUEST_FEATURE_DATA,
    };
}

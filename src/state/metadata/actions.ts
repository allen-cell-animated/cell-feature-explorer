import {
    RECEIVE_METADATA,
    REQUEST_FEATURE_DATA,
} from "./constants";
import {
    MetadataStateBranch,
    ReceiveAction,
    RequestAction
} from "./types";

export function receiveMetadata(payload: MetadataStateBranch): ReceiveAction {
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

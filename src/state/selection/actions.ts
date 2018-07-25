import {
    CHANGE_AXIS,
    SELECT_METADATA,
} from "./constants";
import {
    DeselectFileAction,
    SelectAxisAction,
    SelectFileAction,
    SelectMetadataAction,
} from "./types";

export function changeAxis(axisId: string, payload: string): SelectAxisAction {
    return {
        axisId,
        payload,
        type: CHANGE_AXIS,
    };
}

export function selectMetadata(key: string, payload: string | number): SelectMetadataAction  {
    return {
        key,
        payload,
        type: SELECT_METADATA,
    };
}

import {
    CHANGE_AXIS,
    DESELECT_POINT,
    SELECT_GROUP,
    SELECT_POINT,
} from "./constants";
import {
    DeselectPointAction,
    SelectAxisAction,
    SelectGroupOfPointsAction,
    SelectPointAction,
} from "./types";

export function changeAxis(axisId: string, payload: string): SelectAxisAction {
    return {
        axisId,
        payload,
        type: CHANGE_AXIS,
    };
}

export function selectGroupOfPoints(key: string | number, payload: number[]): SelectGroupOfPointsAction  {
    return {
        key,
        payload,
        type: SELECT_GROUP,
    };
}

export function deselectPoint(payload: number): DeselectPointAction {
    return {
        payload,
        type: DESELECT_POINT,
    };
}

export function selectPoint(payload: number): SelectPointAction {
    return {
        payload,
        type: SELECT_POINT,
    };
}

import { AnyAction } from "redux";

import { TypeToDescriptionMap } from "../types";
import { makeReducer } from "../util";

import {
    CHANGE_AXIS,
    SELECT_METADATA,
} from "./constants";
import {
    DeselectFileAction,
    SelectAxisAction,
    SelectionStateBranch,
    SelectMetadataAction,
} from "./types";

export const initialState = {
    files: [],
    plotByOnX: "Nuclear volume (fL)",
    plotByOnY: "Cellular volume (fL)",
};

const actionToConfigMap: TypeToDescriptionMap = {
    [CHANGE_AXIS]: {
        accepts: (action: AnyAction): action is DeselectFileAction => action.type === CHANGE_AXIS,
        perform: (state: SelectionStateBranch, action: SelectAxisAction) => ({
            ...state,
            [action.axisId]: action.payload,
        }),
    },
    [SELECT_METADATA]: {
        accepts: (action: AnyAction): action is SelectMetadataAction => action.type === SELECT_METADATA,
        perform: (state: SelectionStateBranch, action: SelectMetadataAction) => ({
            ...state,
            [action.key]: action.payload,
        }),
    },
};

export default makeReducer<SelectionStateBranch>(actionToConfigMap, initialState);

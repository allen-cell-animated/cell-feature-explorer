import { AnyAction } from "redux";

import { TypeToDescriptionMap } from "../types";
import { makeReducer } from "../util";

import { RECEIVE_CELL_LINE_DATA, RECEIVE_METADATA } from "./constants";
import {
    MetadataStateBranch,
    ReceiveAction,
    ReceiveCellLineAction,
} from "./types";

export const initialState = {
    cellLineDefs: {},
    featureData: [],
};

const actionToConfigMap: TypeToDescriptionMap = {
    [RECEIVE_METADATA]: {
        accepts: (action: AnyAction): action is ReceiveAction => action.type === RECEIVE_METADATA,
        perform: (state: MetadataStateBranch, action: ReceiveAction) => ({
            ...state,
            featureData: action.payload,
        }),
    },
    [RECEIVE_CELL_LINE_DATA]: {
        accepts: (action: AnyAction): action is ReceiveCellLineAction => action.type === RECEIVE_CELL_LINE_DATA,
        perform: (state: MetadataStateBranch, action: ReceiveCellLineAction) => ({
            ...state,
            cellLineDefs: action.payload,
        }),
    },
};

export default makeReducer<MetadataStateBranch>(actionToConfigMap, initialState);

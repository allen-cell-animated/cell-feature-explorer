import { AnyAction } from "redux";

import { TypeToDescriptionMap } from "../types";
import { makeReducer } from "../util";

import {
    RECEIVE_ALBUM_DATA,
    RECEIVE_CELL_LINE_DATA,
    RECEIVE_METADATA,
    SET_IS_LOADING,
    SET_LOADING_TEXT,
} from "./constants";
import {
    MetadataStateBranch,
    ReceiveAction, ReceiveAlbumDataAction,
    ReceiveCellLineAction,
    SetLoadingAction,
} from "./types";

export const initialState = {
    albums: [],
    cellLineDefs: {},
    featureData: [],
    isLoading: true,
    loadingText: "",
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
        accepts: (action: AnyAction): action is ReceiveCellLineAction =>
            action.type === RECEIVE_CELL_LINE_DATA,
        perform: (state: MetadataStateBranch, action: ReceiveCellLineAction) => ({
            ...state,
            cellLineDefs: action.payload,
        }),
    },
    [RECEIVE_ALBUM_DATA]: {
        accepts: (action: AnyAction): action is ReceiveAlbumDataAction =>
            action.type === RECEIVE_ALBUM_DATA,
        perform: (state: MetadataStateBranch, action: ReceiveAlbumDataAction) => ({
            ...state,
            albums: action.payload,
        }),
    },
    [SET_IS_LOADING]: {
        accepts: (action: AnyAction): action is SetLoadingAction => action.type === SET_IS_LOADING,
        perform: (state: MetadataStateBranch, action: SetLoadingAction) => ({
            ...state,
            isLoading: action.payload,
            loadingText: !action.payload ? initialState.loadingText : state.loadingText,
        }),
    },
    [SET_LOADING_TEXT]: {
        accepts: (action: AnyAction): action is SetLoadingAction =>
            action.type === SET_LOADING_TEXT,
        perform: (state: MetadataStateBranch, action: SetLoadingAction) => ({
            ...state,
            loadingText: action.payload,
        }),
    },
};

export default makeReducer<MetadataStateBranch>(actionToConfigMap, initialState);

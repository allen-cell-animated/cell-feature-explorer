import { AnyAction } from "redux";

import { TypeToDescriptionMap } from "../types";
import { makeReducer } from "../util";

import {
    RECEIVE_ALBUM_DATA,
    RECEIVE_CELL_FILE_INFO,
    RECEIVE_CELL_LINE_DATA,
    RECEIVE_MEASURED_FEATURE_NAMES,
    RECEIVE_METADATA,
} from "./constants";
import {
    MetadataStateBranch,
    ReceiveAction, ReceiveAlbumDataAction,
    ReceiveCellLineAction,
    ReceiveMeasuredFeaturesAction,
} from "./types";

export const initialState = {
    albums: [],
    cellFileInfo: [],
    cellLineDefs: {},
    featureData: {},
    measuredFeaturesDefs: [],
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
    [RECEIVE_CELL_FILE_INFO]: {
        accepts: (action: AnyAction): action is ReceiveCellLineAction =>
            action.type === RECEIVE_CELL_LINE_DATA,
        perform: (state: MetadataStateBranch, action: ReceiveCellLineAction) => ({
            ...state,
            cellFileInfo: action.payload,
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
    [RECEIVE_MEASURED_FEATURE_NAMES]: {
        accepts: (action: AnyAction): action is ReceiveMeasuredFeaturesAction =>
            action.type === RECEIVE_MEASURED_FEATURE_NAMES,
        perform: (state: MetadataStateBranch, action: ReceiveMeasuredFeaturesAction) => ({
            ...state,
            measuredFeaturesDefs: action.payload,
        }),
    },
};

export default makeReducer<MetadataStateBranch>(actionToConfigMap, initialState);

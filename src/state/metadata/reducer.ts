import { AnyAction } from "redux";

import { TypeToDescriptionMap } from "../types";
import { makeReducer } from "../util";

import {
    RECEIVE_ALBUM_DATA,
    RECEIVE_AVAILABLE_DATASETS,
    RECEIVE_CELL_FILE_INFO,
    RECEIVE_CELL_LINE_DATA,
    RECEIVE_MEASURED_FEATURE_NAMES,
    RECEIVE_METADATA,
    SET_IS_LOADING,
    SET_LOADING_TEXT,
} from "./constants";
import {
    MetadataStateBranch,
    ReceiveAction, ReceiveAlbumDataAction,
    ReceiveAvailableDatasetsAction,
    ReceiveCellLineAction,
    SetLoadingAction,
    ReceiveMeasuredFeaturesAction,
} from "./types";

export const initialState = {
    albums: [],
    cellFileInfo: [],
    cellLineDefs: {},
    isLoading: true,
    loadingText: "",
    datasets: [],
    measuredFeatureNames: [],
    featureData: {
        values: {},
        labels: {},
    },
    measuredFeaturesDefs: [],
    clusterData: [],
};

const actionToConfigMap: TypeToDescriptionMap = {
    [RECEIVE_METADATA]: {
        accepts: (action: AnyAction): action is ReceiveAction => action.type === RECEIVE_METADATA,
        perform: (state: MetadataStateBranch, action: ReceiveAction) => ({
            ...state,
            featureData: action.payload,
        }),
    },
    [RECEIVE_AVAILABLE_DATASETS]: {
        accepts: (action: AnyAction): action is ReceiveAvailableDatasetsAction =>
            action.type === RECEIVE_AVAILABLE_DATASETS,
        perform: (state: MetadataStateBranch, action: ReceiveAction) => ({
            ...state,
            datasets: action.payload,
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
            action.type === RECEIVE_CELL_FILE_INFO,
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

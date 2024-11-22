import { ViewerChannelSettings } from "@aics/web-3d-viewer/type-declarations";
import { AnyAction } from "redux";
import { Megaset } from "../image-dataset/types";
import GetImageDatasetInstance from "../image-dataset";
import { ReceiveCellFileInfoAction } from "../selection/types";

import { TypeToDescriptionMap } from "../types";
import { makeReducer } from "../util";

import {
    CLEAR_DATASET_VALUES,
    RECEIVE_ALBUM_DATA,
    RECEIVE_AVAILABLE_DATASETS,
    RECEIVE_CELL_FILE_INFO,
    RECEIVE_MEASURED_FEATURE_DEFS,
    RECEIVE_DATA_FOR_PLOT,
    RECEIVE_VIEWER_CHANNEL_SETTINGS,
    SET_IS_LOADING,
    SET_LOADING_TEXT,
    SET_SHOW_SMALL_SCREEN_WARNING,
    RECEIVE_IMAGE_DATASET,
} from "./constants";
import {
    MetadataStateBranch,
    ReceiveAction,
    ReceiveAlbumDataAction,
    ReceiveAvailableDatasetsAction,
    ReceiveViewerChannelSettingsAction,
    SetLoadingAction,
    SetSmallScreenWarningAction,
    ReceiveMeasuredFeaturesAction,
    ClearAction,
    PerCellLabels,
    MappingOfMeasuredValuesArrays,
    FileInfo,
} from "./types";

export const initialState: MetadataStateBranch = {
    imageDataset: GetImageDatasetInstance(),
    albums: [],
    cellFileInfo: [] as FileInfo[],
    isLoading: true,
    loadingText: "",
    showSmallScreenWarning: false,
    megasets: [] as Megaset[],
    featureData: {
        indices: [] as number[],
        values: {} as MappingOfMeasuredValuesArrays,
        labels: {} as PerCellLabels,
    },
    measuredFeaturesDefs: [],
    viewerChannelSettings: {} as ViewerChannelSettings,
};

const actionToConfigMap: TypeToDescriptionMap = {
    [RECEIVE_IMAGE_DATASET]: {
        accepts: (action: AnyAction): action is ReceiveAction =>
            action.type === RECEIVE_IMAGE_DATASET,
        perform: (state: MetadataStateBranch, action: ReceiveAction) => ({
            ...state,
            imageDataset: action.payload,
        }),
    },
    [RECEIVE_DATA_FOR_PLOT]: {
        accepts: (action: AnyAction): action is ReceiveAction =>
            action.type === RECEIVE_DATA_FOR_PLOT,
        perform: (state: MetadataStateBranch, action: ReceiveAction) => ({
            ...state,
            featureData: action.payload,
        }),
    },
    [CLEAR_DATASET_VALUES]: {
        accepts: (action: AnyAction): action is ClearAction => action.type === CLEAR_DATASET_VALUES,
        perform: (state: MetadataStateBranch) => ({
            ...state,
            cellFileInfo: initialState.cellFileInfo,
            isLoading: initialState.isLoading,
            featureData: initialState.featureData,
            measuredFeaturesDefs: initialState.measuredFeaturesDefs,
            viewerChannelSettings: initialState.viewerChannelSettings,
        }),
    },
    [RECEIVE_AVAILABLE_DATASETS]: {
        accepts: (action: AnyAction): action is ReceiveAvailableDatasetsAction =>
            action.type === RECEIVE_AVAILABLE_DATASETS,
        perform: (state: MetadataStateBranch, action: ReceiveAction) => ({
            ...state,
            megasets: action.payload,
        }),
    },
    [RECEIVE_CELL_FILE_INFO]: {
        accepts: (action: AnyAction): action is ReceiveCellFileInfoAction =>
            action.type === RECEIVE_CELL_FILE_INFO,
        perform: (state: MetadataStateBranch, action: ReceiveCellFileInfoAction) => ({
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
    [RECEIVE_VIEWER_CHANNEL_SETTINGS]: {
        accepts: (action: AnyAction): action is ReceiveViewerChannelSettingsAction =>
            action.type === RECEIVE_VIEWER_CHANNEL_SETTINGS,
        perform: (state: MetadataStateBranch, action: ReceiveViewerChannelSettingsAction) => ({
            ...state,
            viewerChannelSettings: action.payload,
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
    [SET_SHOW_SMALL_SCREEN_WARNING]: {
        accepts: (action: AnyAction): action is SetSmallScreenWarningAction =>
            action.type === SET_SHOW_SMALL_SCREEN_WARNING,
        perform: (state: MetadataStateBranch, action: SetSmallScreenWarningAction) => ({
            ...state,
            showSmallScreenWarning: action.payload,
        }),
    },
    [RECEIVE_MEASURED_FEATURE_DEFS]: {
        accepts: (action: AnyAction): action is ReceiveMeasuredFeaturesAction =>
            action.type === RECEIVE_MEASURED_FEATURE_DEFS,
        perform: (state: MetadataStateBranch, action: ReceiveMeasuredFeaturesAction) => ({
            ...state,
            measuredFeaturesDefs: action.payload,
        }),
    },
};

export default makeReducer<MetadataStateBranch>(actionToConfigMap, initialState);

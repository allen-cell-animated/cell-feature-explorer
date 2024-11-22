import { makeConstant } from "../util";

export const RECEIVE_IMAGE_DATASET = makeConstant("metadata", "receive-image-dataset");
export const RECEIVE_DATA_FOR_PLOT = makeConstant("metadata", "receive");
export const REQUEST_FEATURE_DATA = makeConstant("metadata", "request");
export const REQUEST_ALBUM_DATA = makeConstant("metadata", "request-album-data");
export const RECEIVE_ALBUM_DATA = makeConstant("metadata", "receive-album-data");
export const SET_IS_LOADING = makeConstant("metadata", "set-is-loading");
export const SET_LOADING_TEXT = makeConstant("metadata", "set-loading-text");
export const SET_SHOW_SMALL_SCREEN_WARNING = makeConstant(
    "metadata",
    "set-show-small-screen-warning"
);
export const RECEIVE_AVAILABLE_DATASETS = makeConstant("metadata", "RECEIVE_AVAILABLE_DATASETS");
export const REQUEST_AVAILABLE_DATASETS = makeConstant("metadata", "REQUEST_AVAILABLE_DATASETS");
export const RECEIVE_MEASURED_FEATURE_DEFS = makeConstant(
    "metadata",
    "receive-measured-feature-names"
);
export const REQUEST_CELL_FILE_INFO = makeConstant("metadata", "request-cell-file-info");
export const RECEIVE_CELL_FILE_INFO = makeConstant("metadata", "receive-cell-file-info");
export const CLEAR_DATASET_VALUES = makeConstant("metadata", "CLEAR_DATASET_VALUES");
export const REQUEST_VIEWER_CHANNEL_SETTINGS = makeConstant(
    "metadata",
    "request-viewer-channel-settings"
);
export const RECEIVE_VIEWER_CHANNEL_SETTINGS = makeConstant(
    "metadata",
    "receive-viewer-channel-settings"
);

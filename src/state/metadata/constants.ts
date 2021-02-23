import { makeConstant } from "../util";

export const RECEIVE_METADATA = makeConstant("metadata", "receive");
export const REQUEST_FEATURE_DATA = makeConstant("metadata", "request");
export const RECEIVE_CELL_LINE_DATA = makeConstant("metadata", "receive-cell-line-data");
export const REQUEST_CELL_LINE_DATA = makeConstant("metadata", "request-cell-line-data");
export const REQUEST_ALBUM_DATA = makeConstant("metadata", "request-album-data");
export const RECEIVE_ALBUM_DATA = makeConstant("metadata", "receive-album-data");
export const SET_IS_LOADING = makeConstant("metadata", "set-is-loading");
export const SET_LOADING_TEXT = makeConstant("metadata", "set-loading-text");
export const RECEIVE_AVAILABLE_DATASETS = makeConstant("metadata", "RECEIVE_AVAILABLE_DATASETS");
export const REQUEST_AVAILABLE_DATASETS = makeConstant("metadata", "REQUEST_AVAILABLE_DATASETS");
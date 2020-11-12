import { makeConstant } from "../util";

export const RECEIVE_METADATA = makeConstant("metadata", "receive");
export const REQUEST_FEATURE_DATA = makeConstant("metadata", "request");
export const RECEIVE_CELL_LINE_DATA = makeConstant("metadata", "receive-cell-line-data");
export const REQUEST_CELL_LINE_DATA = makeConstant("metadata", "request-cell-line-data");
export const REQUEST_ALBUM_DATA = makeConstant("metadata", "request-album-data");
export const RECEIVE_ALBUM_DATA = makeConstant("metadata", "receive-album-data");
export const RECEIVE_MEASURED_FEATURE_NAMES = makeConstant("metadata", "receive-measured-feature-names");
export const REQUEST_CELL_FILE_INFO = makeConstant("metadata", "request-cell-file-info");
export const RECEIVE_CELL_FILE_INFO = makeConstant("metadata", "receive-cell-file-info");
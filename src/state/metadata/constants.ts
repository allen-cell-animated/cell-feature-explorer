import { makeConstant } from "../util";

export const RECEIVE_METADATA = makeConstant("metadata", "receive");
export const REQUEST_FEATURE_DATA = makeConstant("metadata", "request");
export const RECEIVE_CELL_LINE_DATA = makeConstant("celllinedata", "receive");
export const REQUEST_CELL_LINE_DATA = makeConstant("celllinedata", "request");

import FirebaseRequest from "./firebase";
import JsonRequest from "./json-dataset";
import { ImageDataset } from "./types";

// by default will use Firebase for dataset, can be switched to JSON dataset using ENV
// variable
export function GetImageDatasetInstance(): ImageDataset {
    return process.env.USE_JSON_DATASET ? new JsonRequest() : new FirebaseRequest();
}

import * as actions from "./actions";
// import logics from "./logics";
import reducer from "./reducer";
import * as selectors from "./selectors";
import * as types from "./types";

export default {
    actions,
    // logics,
    reducer,
    selectors,
    types,
};

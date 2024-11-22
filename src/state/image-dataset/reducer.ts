import { TypeToDescriptionMap } from "..";
import { AnyAction } from "redux";
import { CHANGE_IMAGE_DATASET_TYPE } from "./constants";
import { ImageDataset, ImageDatasetStateBranch, ReceiveImageDatasetAction } from "./types";
import { makeReducer } from "../util";
import FirebaseRequest from "./firebase";
import JsonRequest from "./json-dataset";

// by default will use Firebase for dataset, can be switched to JSON dataset using ENV
// variable
function getImageDatasetInstance(): ImageDataset {
    return process.env.USE_JSON_DATASET ? new JsonRequest() : new FirebaseRequest();
}

export const initialState: ImageDatasetStateBranch = {
    imageDataset: getImageDatasetInstance(),
};

const actionToConfigMap: TypeToDescriptionMap = {
    [CHANGE_IMAGE_DATASET_TYPE]: {
        accepts: (action: AnyAction): action is ReceiveImageDatasetAction =>
            action.type === CHANGE_IMAGE_DATASET_TYPE,
        perform: (state: ImageDatasetStateBranch, action: ReceiveImageDatasetAction) => {
            console.log("Changing dataset type", action.payload);
            return {
                ...state,
                imageDataset: action.payload,
            };
        },
    },
};

export default makeReducer<ImageDatasetStateBranch>(actionToConfigMap, initialState);

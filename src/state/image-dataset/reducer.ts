import { TypeToDescriptionMap } from "..";
import { AnyAction } from "redux";
import { RECEIVE_IMAGE_DATASET } from "./constants";
import { ImageDatasetStateBranch, ReceiveAction } from "./types";
import { makeReducer } from "../util";
import { GetImageDatasetInstance } from ".";

export const initialState: ImageDatasetStateBranch = {
    imageDataset: GetImageDatasetInstance(),
};

const actionToConfigMap: TypeToDescriptionMap = {
    [RECEIVE_IMAGE_DATASET]: {
        accepts: (action: AnyAction): action is ReceiveAction =>
            action.type === RECEIVE_IMAGE_DATASET,
        perform: (state: ImageDatasetStateBranch, action: ReceiveAction) => ({
            ...state,
            imageDataset: action.payload,
        }),
    },
};

export default makeReducer<ImageDatasetStateBranch>(actionToConfigMap, initialState);

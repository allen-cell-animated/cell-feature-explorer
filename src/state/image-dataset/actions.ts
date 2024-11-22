import { ReceiveImageDatasetAction } from "./types";
import { RECEIVE_IMAGE_DATASET } from "./constants";
import { ImageDataset } from "./types";

export function receiveImageDataset(payload: ImageDataset): ReceiveImageDatasetAction {
    return { payload, type: RECEIVE_IMAGE_DATASET };
}

import { ChangeImageDatasetTypeAction, LoadCsvDatasetAction } from "./types";
import { CHANGE_IMAGE_DATASET_TYPE, LOAD_CSV_DATASET } from "./constants";
import { ImageDataset } from "./types";

export function changeImageDatasetType(payload: ImageDataset): ChangeImageDatasetTypeAction {
    return { payload, type: CHANGE_IMAGE_DATASET_TYPE };
}

export function loadCsvDataset(payload: string): LoadCsvDatasetAction {
    return {
        payload,
        type: LOAD_CSV_DATASET,
    };
}

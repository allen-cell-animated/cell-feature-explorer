import { makeConstant } from "../util";

const makeImageDatasetConstant = (constant: string) => makeConstant("image-dataset", constant);

export const LOAD_CSV_DATASET = makeImageDatasetConstant("load-csv-dataset");

export const CHANGE_IMAGE_DATASET_TYPE = makeImageDatasetConstant("change-image-dataset-type");

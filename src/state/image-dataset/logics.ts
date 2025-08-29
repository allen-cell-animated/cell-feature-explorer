import { createLogic } from "redux-logic";

import { ReduxLogicDeps } from "..";
import { receiveAvailableDatasets } from "../metadata/actions";
import { changeDataset } from "../selection/actions";
import { changeImageDatasetType } from "./actions";
import { LOAD_CSV_DATASET } from "./constants";
import CsvRequest, { DEFAULT_CSV_DATASET_KEY } from "./csv-dataset";
import { LoadCsvDatasetAction } from "./types";

/**
 * Parses a CSV file and opens it as a new image dataset.
 */
const loadCsvDataset = createLogic({
    type: LOAD_CSV_DATASET,
    async process(deps: ReduxLogicDeps<LoadCsvDatasetAction>, dispatch: any, done: any) {
        const { action } = deps;
        const fileContents = action.payload as string;
        const dataset = new CsvRequest(fileContents);
        dispatch(changeImageDatasetType(dataset));

        const megasets = await dataset.getAvailableDatasets();
        dispatch(receiveAvailableDatasets(megasets));
        dispatch(changeDataset(DEFAULT_CSV_DATASET_KEY));
        done();
    },
});

export default [loadCsvDataset];

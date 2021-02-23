import { createLogic } from "redux-logic";
import { find, remove } from "lodash";

import { UrlState } from "../../util";
import { InitialDatasetSelections } from "../image-dataset/types";
import { requestCellLineData } from "../metadata/actions";
import { getDatasets } from "../metadata/selectors";
import {
    ReduxLogicDeps,
} from "../types";
import { batchActions } from "../util";

import { CHANGE_DATASET, SET_DATASET, SYNC_STATE_WITH_URL } from "./constants";

const syncStateWithUrl = createLogic({
    type: SYNC_STATE_WITH_URL,
    process({ action }: ReduxLogicDeps, dispatch: any, done: any) {
        const searchParameterMap = action.payload;
        const actions = UrlState.toReduxActions(searchParameterMap);
        const logicActions = remove(actions, { type: CHANGE_DATASET });
        // batchActions doesn't include logics
        if (logicActions) {
            logicActions.forEach((action) => dispatch(action));
        }
        dispatch(batchActions(UrlState.toReduxActions(searchParameterMap)));
        done();
    },
});

const changeDatasetLogic = createLogic({
    type: CHANGE_DATASET,
    async process(deps: ReduxLogicDeps, dispatch: any, done: any) {
        const { action, imageDataSet, getState } = deps;
        let datasets = getDatasets(getState());
        if (!datasets.length) {
            // if user goes directly to a dataset ie cfe.allencell.org/?dataset=[DATASET], 
            // the datasets may not have been saved in state yet
            datasets = await imageDataSet.getAvailableDatasets();
        }
        const selectedDataset = find(datasets, { id: action.payload });
        if (!action.payload) {
            return dispatch({
                type: SET_DATASET,
                payload: action.payload,
            });
        }
        imageDataSet.selectDataset(selectedDataset.manifest)
            .then((selections: InitialDatasetSelections) => {
                console.log(selections);

                dispatch(requestCellLineData());
                dispatch({
                    type: SET_DATASET,
                    payload: action.payload,
                });
            done();
        });
    },
});

export default [syncStateWithUrl, changeDatasetLogic];

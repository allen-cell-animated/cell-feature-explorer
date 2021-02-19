import { createLogic } from "redux-logic";
import { X_AXIS_ID, Y_AXIS_ID } from "../../constants";

import { UrlState } from "../../util";
import { InitialDatasetSelections } from "../image-dataset/types";
import { requestCellLineData } from "../metadata/actions";
import { getDatasets } from "../metadata/selectors";
import {
    ReduxLogicDeps, ReduxLogicNextCb,
} from "../types";
import { batchActions } from "../util";
import { changeAxis } from "./actions";

import { CHANGE_DATASET, SET_DATASET, SYNC_STATE_WITH_URL } from "./constants";

const syncStateWithUrl = createLogic({
    type: SYNC_STATE_WITH_URL,
    transform({ action }: ReduxLogicDeps, dispatch: any, next: ReduxLogicNextCb) {
        const searchParameterMap = action.payload;
        next(dispatch(batchActions(UrlState.toReduxActions(searchParameterMap))));
    },
});

const changeDatasetLogic = createLogic({
    type: CHANGE_DATASET,
    process(deps: ReduxLogicDeps, dispatch: any, done: any) {
        const { action, imageDataSet, getState } = deps;
        const selectedDataset = getDatasets(getState())[action.payload];

        imageDataSet.selectDataset(selectedDataset.manifest)
            .then((selections: InitialDatasetSelections) => {
                dispatch(changeAxis(X_AXIS_ID, selections.defaultXAxis));
                dispatch(changeAxis(Y_AXIS_ID, selections.defaultYAxis));

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

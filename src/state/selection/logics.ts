import { createLogic } from "redux-logic";

import { UrlState } from "../../util";
import { requestCellLineData } from "../metadata/actions";
import {
    ReduxLogicDeps, ReduxLogicNextCb,
} from "../types";
import { batchActions } from "../util";

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
        const { action } = deps;
        dispatch(requestCellLineData());
        dispatch({
            type: SET_DATASET,
            payload: action.payload
        })
        done();
    },
});

export default [syncStateWithUrl, changeDatasetLogic];

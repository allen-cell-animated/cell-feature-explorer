import { createLogic } from "redux-logic";
import { remove } from "lodash";

import { UrlState } from "../../util";
import { requestCellLineData } from "../metadata/actions";
import {
    ReduxLogicDeps,
} from "../types";
import { batchActions } from "../util";

import { CHANGE_DATASET, SYNC_STATE_WITH_URL } from "./constants";

const syncStateWithUrl = createLogic({
    type: SYNC_STATE_WITH_URL,
    process({ action }: ReduxLogicDeps, dispatch: any, done: any) {
        const searchParameterMap = action.payload;
        const actions = UrlState.toReduxActions(searchParameterMap)
        const logicActions = remove(actions, {type: CHANGE_DATASET})
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
    process(deps: ReduxLogicDeps, dispatch: any) {
        const { action } = deps;
        dispatch(requestCellLineData());
        return action.payload;
    },
});

export default [syncStateWithUrl, changeDatasetLogic];

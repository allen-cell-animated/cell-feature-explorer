import { createLogic } from "redux-logic";

import { UrlState } from "../../util";
import { requestCellLineData } from "../metadata/actions";
import {
    ReduxLogicDeps,
    ReduxLogicNextCb,
} from "../types";
import { batchActions } from "../util";

import { CHANGE_DATASET, SYNC_STATE_WITH_URL } from "./constants";

const syncStateWithUrl = createLogic({
    type: SYNC_STATE_WITH_URL,
    transform({ action }: ReduxLogicDeps, next: ReduxLogicNextCb) {
        const searchParameterMap = action.payload;

        next(batchActions(UrlState.toReduxActions(searchParameterMap)));
    },
});

const changeDatasetLogic = createLogic({
    type: CHANGE_DATASET,
    process(deps: ReduxLogicDeps, dispatch: any) {
        const { action } = deps;
        console.log(action.payload)
        dispatch(requestCellLineData());
        return action.payload;
    },
});

export default [syncStateWithUrl, changeDatasetLogic];

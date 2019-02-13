import { createLogic } from "redux-logic";

import { UrlState } from "../../util";

import {
    ReduxLogicDeps,
    ReduxLogicNextCb,
} from "../types";
import { batchActions } from "../util";

import { SYNC_STATE_WITH_URL } from "./constants";

const syncStateWithUrl = createLogic({
    type: SYNC_STATE_WITH_URL,
    transform({ action }: ReduxLogicDeps, next: ReduxLogicNextCb) {
        const searchParameterMap = action.payload;

        next(batchActions(UrlState.toReduxActions(searchParameterMap)));
    },
});

export default [syncStateWithUrl];

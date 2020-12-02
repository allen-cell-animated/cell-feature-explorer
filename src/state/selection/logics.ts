import { createLogic } from "redux-logic";

import { UrlState } from "../../util";
import { receiveFileInfoDataForCell } from "./actions";
import { RECEIVE_FILE_INFO_FOR_SELECTED_CELL, REQUEST_CELL_FILE_INFO_BY_CELL_ID, SELECT_POINT } from "./constants";
import { FileInfo } from "../metadata/types";
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


const requestCellFileInfoByCellId = createLogic({
    process(deps: ReduxLogicDeps, dispatch: any, done: any) {
        const { action, imageDataSet } = deps;
        if (!imageDataSet.getFileInfoByCellId) {
            return Promise.resolve({});
        }

        return imageDataSet
            .getFileInfoByCellId(action.payload)
            .then((data: FileInfo) => {
                dispatch(receiveFileInfoDataForCell(data));
            })
            .catch((reason: string) => {
                console.log(reason); // tslint:disable-line:no-console
            })
            .then(() => done());
    },
    type: REQUEST_CELL_FILE_INFO_BY_CELL_ID,
});

const requestCellFileInfoForSelectedPoint = createLogic({
    
    process(deps: ReduxLogicDeps) {
        const { action, imageDataSet } = deps;
        if (!imageDataSet.getFileInfoByCellId) {
            return Promise.resolve({});
        }

        return imageDataSet
            .getFileInfoByCellId(action.payload.toString())
            .then((data: FileInfo) => {
                console.log('got data for selected point', data)
                return data;
            })
            .catch((reason: string) => {
                console.log(reason); // tslint:disable-line:no-console
            })
    },
    processOptions: {
        successType: RECEIVE_FILE_INFO_FOR_SELECTED_CELL
    },
    type: SELECT_POINT,
});


export default [syncStateWithUrl, requestCellFileInfoByCellId, requestCellFileInfoForSelectedPoint];

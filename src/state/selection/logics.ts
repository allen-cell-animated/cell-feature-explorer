import { createLogic } from "redux-logic";

import { UrlState } from "../../util";
import { clearHoverPointData, receiveFileInfoDataForCell } from "./actions";
import { CLEAR_FILE_INFO_FOR_HOVERED_CELL, RECEIVE_FILE_INFO_FOR_SELECTED_CELL, REQUEST_CELL_FILE_INFO_BY_CELL_ID, SELECT_POINT } from "./constants";
import { FileInfo } from "../metadata/types";
import {
    ReduxLogicDeps,
    ReduxLogicNextCb,
} from "../types";
import { batchActions } from "../util";

import { SYNC_STATE_WITH_URL } from "./constants";
import { getHoveredPointData, getHoveredPointId } from "./selectors";
import { isEmpty } from "lodash";
import { database } from "firebase";
import { receiveFileInfoData } from "../metadata/actions";

const syncStateWithUrl = createLogic({
    type: SYNC_STATE_WITH_URL,
    transform({ action }: ReduxLogicDeps, next: ReduxLogicNextCb) {
        const searchParameterMap = action.payload;

        next(batchActions(UrlState.toReduxActions(searchParameterMap)));
    },
});


const requestCellFileInfoForHoveredPoint = createLogic({
    process(deps: ReduxLogicDeps, dispatch: any, done: any) {
        const { action, imageDataSet, getState } = deps;
        if (!imageDataSet.getFileInfoByCellId) {
            return Promise.resolve({});
        }
        return imageDataSet
        .getFileInfoByCellId(action.payload)
        .then((data: FileInfo) => {
                const hoveredCellId = getHoveredPointId(getState());

                if (hoveredCellId === -1) {
                    // if plot got unhovered before request returned clear out hovered data
                    return dispatch(clearHoverPointData())
                } else if (hoveredCellId !== data.CellId) {
                    // if new cell got hovered before request returned dont save this data
                    return Promise.resolve()
                } else {

                    dispatch(receiveFileInfoDataForCell(data));
                }
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
        const { action, imageDataSet, getState } = deps;
        if (!imageDataSet.getFileInfoByCellId) {
            return Promise.resolve({});
        }
        const hoveredPoint = getHoveredPointData(getState());
        if (!isEmpty(hoveredPoint)) {
            return hoveredPoint;
        }
        return imageDataSet
            .getFileInfoByCellId(action.payload.toString())
            .then((data: FileInfo) => {
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


export default [syncStateWithUrl, requestCellFileInfoForHoveredPoint, requestCellFileInfoForSelectedPoint];

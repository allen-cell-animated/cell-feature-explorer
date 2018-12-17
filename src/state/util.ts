import { find } from "lodash";
import {
    AnyAction,
    Reducer,
} from "redux";

import {
    APP_ID,
    CELL_ID_KEY,
    CELL_LINE_NAME_KEY,
    FOV_ID_KEY,
} from "../constants";

import { FileInfo } from "./metadata/types";

import {
    BatchedAction,
    TypeToDescriptionMap,
} from "./types";

export function makeConstant(associatedReducer: string, actionType: string) {
    return `${APP_ID}/${associatedReducer.toUpperCase()}/${actionType.toUpperCase()}`;
}

export function makeReducer<S>(typeToDescriptionMap: TypeToDescriptionMap, initialState: S): Reducer<S> {
    return (state: S = initialState, action: AnyAction) => {
        const description = typeToDescriptionMap[action.type];
        if (!description) {
            return state;
        }

        if (description.accepts(action)) {
            return description.perform(state, action);
        }

        return state;
    };
}

const BATCH_ACTIONS = makeConstant("batch", "batch-actions");

export function batchActions(actions: AnyAction[], type: string = BATCH_ACTIONS): BatchedAction {
    return { type, batch: true, payload: actions };
}

function actionIsBatched(action: AnyAction): action is BatchedAction {
    return action && action.batch && Array.isArray(action.payload);
}

export function enableBatching<S>(reducer: Reducer<S>): Reducer<S> {
    return function batchingReducer(state: S, action: AnyAction): S {
        if (actionIsBatched(action)) {
            return action.payload.reduce(batchingReducer, state);
        }
        return reducer(state, action);
    };
}
export function getFileInfoDatumFromCellId(fileInfoArray: FileInfo[], cellId: string | number): FileInfo | undefined {
    return find(fileInfoArray, (datum: FileInfo) => Number(datum[CELL_ID_KEY]) === Number(cellId));
}

export function convertFileInfoToAICSId(datum: FileInfo): string {
    return `C${datum[CELL_ID_KEY]}`;
}

export function convertFileInfoToImgSrc(datum: FileInfo): string {
    return `/${datum[CELL_LINE_NAME_KEY]}/${datum[CELL_LINE_NAME_KEY]}_${datum[FOV_ID_KEY]}_${datum[CELL_ID_KEY]}.png`;
}

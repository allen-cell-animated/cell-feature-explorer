import { mapValues } from "lodash";
import { type Action, compose } from "redux";

import { BATCH_ACTIONS } from "./util";
import { RECEIVE_DATA_FOR_PLOT } from "./metadata/constants";
import type { DataForPlot, ReceiveAction } from "./metadata/types";
import type { BatchedAction, State } from "./types";

// Redux DevTools runs unusably slowly if forced to save large arrays of feature data over and over again
// The point of this file is to ensure it doesn't have to

const SUMMARY_LENGTH = 5;

type SummarizedArray<T> = (T | string)[];
const summarizeLongArray = <T>(arr: T[]): SummarizedArray<T> => {
    const slice: SummarizedArray<T> = arr.slice(0, SUMMARY_LENGTH);
    if (arr.length > SUMMARY_LENGTH) {
        slice.push(`...and ${arr.length - SUMMARY_LENGTH} more`);
    }
    return slice;
};

/** Unions `string` into the element type of every array in a nested record of arrays */
type AddStringsToArrays<T> = {
    [K in keyof T]: T[K] extends (infer El)[] ? (El | string)[] : AddStringsToArrays<T[K]>;
};

type SanitizedReceiveAction = Action & { payload: AddStringsToArrays<DataForPlot> };

const summarizeFeatureData = (data: DataForPlot): AddStringsToArrays<DataForPlot> => ({
    indices: summarizeLongArray(data.indices),
    values: mapValues(data.values, summarizeLongArray),
    labels: mapValues(data.labels, summarizeLongArray),
});

const actionSanitizer = (action: Action): Action | BatchedAction | SanitizedReceiveAction => {
    if (action.type === RECEIVE_DATA_FOR_PLOT) {
        return { ...action, payload: summarizeFeatureData((action as ReceiveAction).payload) };
    } else if (action.type === BATCH_ACTIONS) {
        return { ...action, payload: (action as BatchedAction).payload.map(actionSanitizer) };
    }
    return action;
};

const stateSanitizer = (state: State) => ({
    ...state,
    metadata: {
        ...state.metadata,
        featureData: summarizeFeatureData(state.metadata.featureData),
    },
});

// Extend the Window interface to include __REDUX_DEVTOOLS_EXTENSION_COMPOSE__
declare global {
    interface Window {
        __REDUX_DEVTOOLS_EXTENSION_COMPOSE__?: (opts: any) => typeof compose;
    }
}

type DevtoolsComposeType = ((opts: any) => typeof compose) | undefined;
const devtoolsCompose = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ as DevtoolsComposeType;

export default devtoolsCompose ? devtoolsCompose({ actionSanitizer, stateSanitizer }) : compose;

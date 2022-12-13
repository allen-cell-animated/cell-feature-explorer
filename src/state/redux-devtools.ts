import { mapValues } from "lodash";
import { RECEIVE_DATA_FOR_PLOT } from "./metadata/constants";
import { MetadataStateBranch } from "./metadata/types";
import { AnyAction, compose } from "redux";
import { State } from ".";

// Redux DevTools chugs hard if forced to save large arrays of feature data over and over again
// The point of (most of) this file is to ensure it doesn't have to

const SUMMARY_LENGTH = 5;

type SummarizedArray<T> = (T | string)[];
const summarizeLongArray = <T>(arr: T[]): SummarizedArray<T> => {
    const slice: SummarizedArray<T> = arr.slice(0, SUMMARY_LENGTH);
    if (arr.length > SUMMARY_LENGTH) {
        slice.push(`...and ${arr.length - SUMMARY_LENGTH} more`);
    }
    return slice;
}

const summarizeFeatureData = (data: MetadataStateBranch["featureData"]) => ({
    indices: summarizeLongArray(data.indices),
    values: mapValues(data.values, summarizeLongArray),
    labels: mapValues(data.labels, summarizeLongArray),
});

const actionSanitizer = (action: AnyAction) => (
    action.type === RECEIVE_DATA_FOR_PLOT ? { ...action, payload: summarizeFeatureData(action.payload) } : action
);
const stateSanitizer = (state: State) => ({
    ...state,
    metadata: {
        ...state.metadata,
        featureData: summarizeFeatureData(state.metadata.featureData),
    }
});

const devtoolsCompose = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
    ? (window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ as (opts: any) => typeof compose)({ actionSanitizer, stateSanitizer })
    : compose;

export default devtoolsCompose;

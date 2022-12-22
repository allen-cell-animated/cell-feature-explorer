import { mapValues } from "lodash";
import { BATCH_ACTIONS } from "./util";
import { RECEIVE_DATA_FOR_PLOT } from "./metadata/constants";
import { MetadataStateBranch } from "./metadata/types";
import { AnyAction, compose } from "redux";
import { State } from ".";

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

const summarizeFeatureData = (data: MetadataStateBranch["featureData"]) => ({
    indices: summarizeLongArray(data.indices),
    values: mapValues(data.values, summarizeLongArray),
    labels: mapValues(data.labels, summarizeLongArray),
});

const actionSanitizer = (action: AnyAction) => {
    if (action.type === RECEIVE_DATA_FOR_PLOT) {
        return { ...action, payload: summarizeFeatureData(action.payload) };
    } else if (action.type === BATCH_ACTIONS) {
        return { ...action, payload: action.payload.map(actionSanitizer) };
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

type DevtoolsComposeType = ((opts: any) => typeof compose) | undefined;
const devtoolsCompose = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ as DevtoolsComposeType;

export default devtoolsCompose ? devtoolsCompose({ actionSanitizer, stateSanitizer }) : compose;

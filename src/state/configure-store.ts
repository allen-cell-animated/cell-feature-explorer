import axios from "axios";
import { merge } from "lodash";
import { applyMiddleware, combineReducers, createStore } from "redux";
import { createLogicMiddleware } from "redux-logic";

import { enableBatching, initialState, metadata, selection, State } from "./";
import RequestClassToUse from "./image-dataset";
import devtoolsCompose from "./redux-devtools";

const ENABLE_DEVTOOLS = false;

const reducers = {
    metadata: metadata.reducer,
    selection: selection.reducer,
};

const logics = [...metadata.logics, ...selection.logics];

const reduxLogicDependencies = {
    httpClient: axios,
    imageDataSet: RequestClassToUse(),
};

export default function createReduxStore(preloadedState?: Partial<State>) {
    const logicMiddleware = createLogicMiddleware(logics);
    logicMiddleware.addDeps(reduxLogicDependencies);

    const middleware = ENABLE_DEVTOOLS 
        ? devtoolsCompose(applyMiddleware(logicMiddleware))
        : applyMiddleware(logicMiddleware);
    const rootReducer = enableBatching<State>(combineReducers(reducers), initialState);

    if (preloadedState) {
        const mergedState = merge({}, initialState, preloadedState);
        return createStore(rootReducer, mergedState, middleware);
    }

    return createStore(rootReducer, middleware);
}

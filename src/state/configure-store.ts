import axios from "axios";
import {
    applyMiddleware,
    combineReducers,
    createStore,
} from "redux";
import { createLogicMiddleware } from "redux-logic";

import { BASE_API_URL } from "../constants";

import {
    enableBatching,
    metadata,
    selection,
    State,
} from "./";

const reducers = {
    metadata: metadata.reducer,
    selection: selection.reducer,
};

const logics = [
    ...metadata.logics,
    ...selection.logics,
];

const reduxLogicDependencies = {
    baseApiUrl: BASE_API_URL,
    httpClient: axios,
};

export default function createReduxStore(initialState?: State) {
    const logicMiddleware = createLogicMiddleware(logics, reduxLogicDependencies);
    const middleware = applyMiddleware(logicMiddleware);
    const rootReducer = enableBatching<State>(combineReducers(reducers));

    if (initialState) {
        return createStore(rootReducer, initialState, middleware);
    }

    return createStore(rootReducer, middleware);
}

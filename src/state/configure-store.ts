import axios from "axios";
import { merge } from "lodash";
import {
    applyMiddleware,
    combineReducers,
    createStore,
} from "redux";
import { createLogicMiddleware } from "redux-logic";

import { BASE_API_URL } from "../constants";

import {
    enableBatching,
    initialState,
    metadata,
    selection,
    State,
} from "./";
import firestore from "./image-dataset/firebase/configure-firebase";
import ImageDataSet from "./image-dataset";

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
    firestoreRef: firestore.collection("cfe-datasets").doc("v1"),
    httpClient: axios,
    imageDataSet: new ImageDataSet(),
};

export default function createReduxStore(preloadedState?: Partial<State>) {
    const logicMiddleware = createLogicMiddleware(logics);
    logicMiddleware.addDeps(reduxLogicDependencies);

    const middleware = applyMiddleware(logicMiddleware);
    const rootReducer = enableBatching<State>(combineReducers(reducers), initialState);

    if (preloadedState) {
        const mergedState = merge({}, initialState, preloadedState);
        return createStore(rootReducer, mergedState, middleware);
    }

    return createStore(rootReducer, middleware);
}

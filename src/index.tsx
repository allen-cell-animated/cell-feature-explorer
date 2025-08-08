import "core-js/es6/map";
import "core-js/es6/promise";
import "core-js/es6/set";
import { createBrowserHistory, type History } from "history";
import { parse, stringify } from "qs";
import * as React from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";

import { APP_ID } from "./constants";
import App from "./containers/App";
import {
    createReduxStore,
    metadata,
    selection,
} from "./state";
import { initialState } from "./state/selection/reducer";
import { UrlState } from "./util";
import { URLSearchParam, URLSearchParamMap } from "./util/UrlState";
import "./style.css";

const validateParams = (obj: Record<string, any>): URLSearchParamMap => {
    const result: URLSearchParamMap = {};
    for (const key of Object.keys(obj)) {
        const value = obj[key];
        if (typeof value === "string" || (Array.isArray(value) && typeof value[0] === "string")) {
            result[key] = value;
        }
    }
    return result;
};

class URLParams {
    constructor(private history: History) {}

    getParams(): URLSearchParamMap {
        return validateParams(parse(this.history.location.search, { ignoreQueryPrefix: true }));
    }

    pushParams(params: Record<string, any>) {
        this.history.push({ ...this.history.location, search: stringify(params) });
    }

    pushParam(key: string, value: any) {
        this.pushParams({ ...this.getParams(), [key]: value });
    }

    replaceParams(params: Record<string, any>) {
        this.history.replace({ ...this.history.location, search: stringify(params) });
    }

    onParamRemoved(key: string, callback: () => void) {
        let hasParam = false;
        this.history.listen((location) => {
            const params = parse(location.search, { ignoreQueryPrefix: true });
            if (params[key]) {
                hasParam = true;
            } else if (hasParam) {
                callback();
                hasParam = false;
            }
        })
    }
}

const params = new URLParams(createBrowserHistory());
const initialSelections = {
    ...initialState,
    ...UrlState.toAppState(params.getParams())
}
const store = createReduxStore({ selection: initialSelections });

store.dispatch(selection.actions.syncStateWithURL(params.getParams()));

// when the dataset query param changes, check if it's been removed
params.onParamRemoved("dataset", () => {
    // used the back button to get back to the landing page
    // UrlState doesn't sync actions if a query param doesn't exist, 
    // so clearing it out here 
    // NOTE: order matters, the selections need to be cleared out before the 
    // dataset metadata is cleared
    store.dispatch(selection.actions.clearDataset());
    store.dispatch(metadata.actions.clearDatasetValues());
});

// keep the URL in sync with the state of this app
store.subscribe(function updateURL() {
    const state = store.getState();
    const mapping = UrlState.toUrlSearchParameterMap(state.selection);
    const currentParams = params.getParams();
    const datasetChanged = UrlState.paramChanged(URLSearchParam.dataset, mapping, currentParams);
    if (datasetChanged) {
        // only save in browser history if the dataset is different
        params.pushParam(URLSearchParam.dataset, mapping.dataset);
    }
    
    if (UrlState.paramsChanged(mapping, currentParams)) {
        params.replaceParams(mapping);
    }
});

const container = document.getElementById(APP_ID);
if (container === null) {
    console.error("App container missing!");
} else {
    const root = createRoot(container);
    root.render(
        <Provider store={store}>
            <App />
        </Provider>
    );
}

import "core-js/es6/map";
import "core-js/es6/promise";
import "core-js/es6/set";
import createHistory from "history/createBrowserHistory";
import Pram from "pram";
import * as React from "react";
import { render } from "react-dom";
import { Provider } from "react-redux";

import { APP_ID } from "./constants";
import App from "./containers/App";
import {
    createReduxStore,
    metadata,
    selection,
} from "./state";
import { UrlState } from "./util";
import { URLSearchParam } from "./util/UrlState";

const pram = new Pram(createHistory());
const store = createReduxStore({ selection: UrlState.toAppState(pram.getParams())});

store.dispatch(selection.actions.syncStateWithURL(pram.getParams()));

// when the dataset query param changes, check if it's been removed
pram.onChange("dataset", function notifyHostFrameOfURLChange(dataset) {
    if (!dataset) {
        // used the back button to get back to the landing page
        // UrlState doesn't sync actions if a query param doesn't exist, 
        // so clearing it out here 
        // NOTE: order matters, the selections need to be cleared out before the 
        // dataset metadata is cleared
        store.dispatch(selection.actions.clearDataset());
        store.dispatch(metadata.actions.clearDatasetValues());
    }
});

// keep the URL in sync with the state of this app
store.subscribe(function updateURL() {
    const state = store.getState();
    const mapping = UrlState.toUrlSearchParameterMap(state.selection);
    const currentParams = pram.getParams();
    const datasetChanged = UrlState.paramChanged(URLSearchParam.dataset, mapping, currentParams);
    if (datasetChanged) {
        // only save in browser history if the dataset is different
        pram.pushParam(URLSearchParam.dataset, mapping.dataset);
    }
    
    if (UrlState.paramsChanged(mapping, currentParams)) {
        pram.replaceParams(mapping);
    }
});

render(
    <Provider store={store}>
        <App />
    </Provider>,
    document.getElementById(APP_ID)
);

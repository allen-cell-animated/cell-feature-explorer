import { MessageTarget } from "@aics/browsing-context-messaging";
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
    selection,
} from "./state";
import { UrlState } from "./util";

const pram = new Pram(createHistory());
const store = createReduxStore({ selection: UrlState.toAppState(pram.getParams())});

// in the case that this application is run within an iframe, setup communication between this app
// and it host page to capture any URL search params that are intended to modify the state of this app
const messenger = new MessageTarget(function updateAppState(messageEvent: MessageEvent) {
    store.dispatch(selection.actions.syncStateWithURL(messageEvent.data));
});

// when the URL changes, notify host page if run within iframe
pram.onChange(function notifyHostFrameOfURLChange(urlParams) {
    try {
        messenger.postMessage(urlParams);
    } catch (error) {
        // one common scenario in which this would fail is in dev/staging, in which this application
        // is not being run inside an iframe.
        // swallow error
    }
});

// keep the URL in sync with the state of this app
store.subscribe(function updateURL() {
    const state = store.getState();
    pram.replaceParams(UrlState.toUrlSearchParameterMap(state.selection));
});

render(
    <Provider store={store}>
        <App />
    </Provider>,
    document.getElementById(APP_ID)
);

import "core-js/es6/map";
import "core-js/es6/promise";
import "core-js/es6/set";

import { MessageTarget } from "@aics/browsing-context-messaging";
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

const store = createReduxStore();

// in the case that this application is run within an iframe, setup communication between this app
// and it host page to capture any URL search params that are intended to modify the state of this app
const messenger = new MessageTarget(function updateState(messageEvent: MessageEvent) {
    store.dispatch(selection.actions.syncStateWithURL(messageEvent.data));
});

// keep host page's URL in sync with the state of this app
const urlState = new UrlState();
store.subscribe(function updateURL() {
    const state = store.getState();
    try {
        messenger.postMessage(urlState.toUrlSearchParameterMap(state));
    } catch (error) {
        // one common scenario in which this would fail is in dev/staging, in which this application
        // is not being run inside an iframe.
        // swallow error
    }
});

render(
    <Provider store={store}>
        <App />
    </Provider>,
    document.getElementById(APP_ID)
);

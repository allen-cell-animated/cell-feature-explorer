import "core-js/es6/map";
import "core-js/es6/promise";
import "core-js/es6/set";

import { MessageTarget } from "@aics/browsing-context-messaging";
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
const initialURLParams = pram.getParams();
const urlState = new UrlState();
const store = createReduxStore({ selection: urlState.toAppState(initialURLParams)});

// in the case that this application is run within an iframe, setup communication between this app
// and it host page to capture any URL search params that are intended to modify the state of this app
const messenger = new MessageTarget(function updateLocalFrameURL(messageEvent: MessageEvent) {
    pram.replaceParams(messageEvent.data);
});

// when the URL changes, update app state
let prevParams: any = initialURLParams;
pram.onChange(function updateAppState(urlParams) {
    if (urlState.urlParamsHaveChanged(prevParams, urlParams)) {
        prevParams = urlParams;
        try {
            // if running in an iframe, keep host frame in-the-know about the state of the app
            messenger.postMessage(urlParams);
        } catch (error) {
            // one common scenario in which this would fail is in dev/staging, in which this application
            // is not being run inside an iframe.
            // swallow error
        } finally {
            store.dispatch(selection.actions.syncStateWithURL(urlParams));
        }
    }
});

// keep the URL in sync with the state of this app
store.subscribe(function updateURL() {
    const state = store.getState();

    // setTimeout to force pram.replaceParams to run asynchronously. Otherwise it will call its change
    // handler synchronously, forcing a store.dispatch within the call stack of this store.subscribe
    setTimeout(() =>
        pram.replaceParams(urlState.toUrlSearchParameterMap(state.selection)),
        0
    );
});

render(
    <Provider store={store}>
        <App />
    </Provider>,
    document.getElementById(APP_ID)
);

import { initialState as metadataInitialState } from "./metadata/reducer";
import { initialState as selectionInitialState } from "./selection/reducer";
import { State } from "./types";

export { default as metadata } from "./metadata";
export { default as selection } from "./selection";

export { default as createReduxStore } from "./configure-store";

export { enableBatching } from "./util";

export * from "./types";

export const initialState: State = Object.freeze({
    metadata: metadataInitialState,
    selection: selectionInitialState,
});

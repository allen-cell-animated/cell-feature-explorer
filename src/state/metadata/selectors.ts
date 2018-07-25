import { createSelector } from "reselect";

import { State } from "../types";

import { MetadataStateBranch } from "./types";

// BASIC SELECTORS
export const getFeatureData = (state: State) => state.metadata;

// COMPOSED SELECTORS
export const getKeysOfMetadata = createSelector([getFeatureData], (metadata: MetadataStateBranch): string[] =>
    Object.keys(metadata)
);

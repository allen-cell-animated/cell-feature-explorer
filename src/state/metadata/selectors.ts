import {
    filter,
    keys,
    map,
    reduce,
    uniq,
    values,
} from "lodash";
import { createSelector } from "reselect";

import {
    CELL_ID_KEY,
    THUMBNAIL_DIR_KEY,
} from "../../constants";

import { State } from "../types";

import { MetadataStateBranch } from "./types";

// BASIC SELECTORS
export const getFeatureData = (state: State) => state.metadata.featureData;

export const getFeatureNames = createSelector([getFeatureData], (featureData: MetadataStateBranch) => (
    filter( keys(featureData[0]),
        (ele) => ele !== "structureProteinName" && ele !== CELL_ID_KEY && ele !== THUMBNAIL_DIR_KEY)
    )
);

export const getProteinNames = createSelector([getFeatureData], (featureData: MetadataStateBranch) => {
        return uniq(map( (featureData),  "structureProteinName")).sort((a, b) => {
            if (b > a) {
                return 1;
            } else if (a > b) {
                return -1;
            }
            return 0;
        });
    }
);

export const getProteinTotals = createSelector([getFeatureData, getProteinNames],
    (featureData: MetadataStateBranch, proteinNames: string[]): number[] => {
    const totals =  reduce(featureData, (acc: {[key: number]: number}, cur) => {
        const index = proteinNames.indexOf(cur.structureProteinName);
        if (acc[index]) {
            acc[index] ++;
        } else {
            acc[index] = 1;
        }
        return acc;
    }, {});
    return values(totals);
    }
);

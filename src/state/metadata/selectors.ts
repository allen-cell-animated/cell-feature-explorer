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
    PROTEIN_NAME_KEY,
    THUMBNAIL_DIR_KEY,
} from "../../constants";

import { State } from "../types";

import {
    FileInfo,
    MeasuredFeatures,
    MetadataStateBranch
} from "./types";

// BASIC SELECTORS
export const getFullMetaDataArray = (state: State) => state.metadata.featureData;

export const getFileInfo = createSelector([getFullMetaDataArray], (fullMetaData): FileInfo[] => {
    return map(fullMetaData, "file_info");
});

export const getMeasuredData = createSelector([getFullMetaDataArray], (fullMetaData): MeasuredFeatures[] => {
    return map(fullMetaData, "measured_features");
});

export const getFeatureNames = createSelector([getMeasuredData], (measuredFeatures: MetadataStateBranch): string[] => (
    keys(measuredFeatures[0])
    )
);

export const getProteinLabels = createSelector([getFileInfo], (fullMetaData: MetadataStateBranch): string[] => {
    return map(fullMetaData, PROTEIN_NAME_KEY);
});

export const getProteinNames = createSelector([getFileInfo], (fileInfo: MetadataStateBranch): string[] => {
        return uniq(map((fileInfo),  PROTEIN_NAME_KEY)).sort((a, b) => {
            if (b > a) {
                return 1;
            } else if (a > b) {
                return -1;
            }
            return 0;
        });
    }
);

export const getProteinTotals = createSelector([getFileInfo, getProteinNames],
    (featureData: MetadataStateBranch, proteinNames: string[]): number[] => {
    const totals =  reduce(featureData, (acc: {[key: number]: number}, cur) => {
        const index = proteinNames.indexOf(cur[PROTEIN_NAME_KEY]);
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

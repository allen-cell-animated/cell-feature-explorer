import {
    keys,
    map,
    reduce,
    uniq,
    values,
} from "lodash";
import { createSelector } from "reselect";

import {
    PROTEIN_NAME_KEY,
} from "../../constants";
import { ClusteringDatum } from "../selection/types";
import { State } from "../types";

import {
    FileInfo,
    MeasuredFeatures,
    MetadataStateBranch,
} from "./types";

// BASIC SELECTORS
export const getMeasuredFeatureValues = (state: State) => state.metadata.featureData;
export const getFullCellLineDefs = (state: State) => state.metadata.cellLineDefs;
export const getAllAlbumData = (state: State) => state.metadata.albums;
export const getFeatureNamesAndData = (state: State) => state.metadata.measuredFeatureNames;
export const getFileInfo = (state: State) => state.metadata.cellFileInfo;

export const getMeasuredData = createSelector([getMeasuredFeatureValues], (fullMetaData): MeasuredFeatures[] => {
    return fullMetaData;
});

export const getClusterData = createSelector([getMeasuredFeatureValues], (fullMetaData): ClusteringDatum[] => {
    return map(fullMetaData, "clusters");
});

export const getFeatureNames = createSelector(
           [getFeatureNamesAndData],
           (measuredFeatures: MetadataStateBranch): string[] =>
               map(measuredFeatures, "key")
       );

export const getProteinLabels = createSelector([getFileInfo], (fullMetaData: MetadataStateBranch): string[] => {
    return map(fullMetaData, PROTEIN_NAME_KEY);
});

export const getProteinNames = createSelector([getFileInfo], (fileInfo: MetadataStateBranch): string[] => {
        return uniq(map((fileInfo),  PROTEIN_NAME_KEY)).sort((a, b) => {
            if (b > a) {
                return -1;
            } else if (a > b) {
                return 1;
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

export const getClusterNames = createSelector([getClusterData], (clusterData): string[] => (
    keys(clusterData[0])
));

import { map, filter, sortBy, isEmpty, toInteger } from "lodash";
import { createSelector } from "reselect";

import {
    ARRAY_OF_CELL_IDS_KEY,
    MITOTIC_STAGE_KEY,
    PROTEIN_NAME_KEY,
} from "../../constants";
import { State } from "../types";
import { TOTAL_CELLS } from "./reducer";

import {
    CellLineDef,
    MetadataStateBranch,
} from "./types";

// BASIC SELECTORS
export const getMeasuredFeatureValues = (state: State) => state.metadata.featureData;
export const getCellLineDefs = (state: State) => state.metadata.cellLineDefs;
export const getAllAlbumData = (state: State) => state.metadata.albums;
export const getMeasuredFeaturesDefs = (state: State) => state.metadata.measuredFeaturesDefs;
export const getFileInfo = (state: State) => state.metadata.cellFileInfo;
export const getClusterData = (state: State) => state.metadata.clusterData;
export const getIsLoading = (state: State) => state.metadata.isLoading;

export const getPlotLoadingProgress = createSelector([getMeasuredFeatureValues], (measuredFeatures) => {
    if (isEmpty(measuredFeatures)) {
        return 0;
    }
    return toInteger(measuredFeatures[ARRAY_OF_CELL_IDS_KEY].length/TOTAL_CELLS * 100);
})

export const getSortedCellLineDefs = createSelector([getCellLineDefs], (cellLineDefs: CellLineDef[]): CellLineDef[] =>
    sortBy(cellLineDefs, [PROTEIN_NAME_KEY])
);

export const getMeasuredFeaturesKeys = createSelector([getMeasuredFeaturesDefs], (measuredFeatureDefs): string[] => {
    return map(measuredFeatureDefs,  "key");
});

export const getCategoricalFeatureKeys = createSelector([getMeasuredFeaturesDefs], (measuredFeatureDefs): string[] => {
    return map(filter(measuredFeatureDefs,  "discrete"), "key");
});

export const getProteinLabelsPerCell = createSelector([getFileInfo], (fullMetaData: MetadataStateBranch): string[] => {
    return map(fullMetaData, PROTEIN_NAME_KEY);
});

export const getMitoticKeyPerCell = createSelector([getMeasuredFeatureValues], (measuredFeatures): number[] => {
    if (isEmpty(measuredFeatures)) {
        return [];
    }
    return measuredFeatures[MITOTIC_STAGE_KEY];
})
export const getProteinNames = createSelector([getSortedCellLineDefs], (cellLineDef: CellLineDef[]): string[] => {
    return  map(cellLineDef, PROTEIN_NAME_KEY);
    }
);

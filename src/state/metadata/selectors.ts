import { map, filter, sortBy } from "lodash";
import { createSelector } from "reselect";

import {
    MITOTIC_STAGE_KEY,
    PROTEIN_NAME_KEY,
} from "../../constants";
import { State } from "../types";

import {
    CellLineDef,
    MetadataStateBranch,
} from "./types";

// BASIC SELECTORS
export const getMeasuredFeatureValues = (state: State) => state.metadata.featureData;
export const getCellLineDefs = (state: State) => state.metadata.cellLineDefs;
export const getAllAlbumData = (state: State) => state.metadata.albums;
export const getIsLoading = (state: State) => state.metadata.isLoading;
export const getLoadingText = (state: State) => state.metadata.loadingText;
export const getDatasets = (state: State) => state.metadata.datasets;
export const getFeatureNamesAndData = (state: State) => state.metadata.measuredFeatureNames;
export const getMeasuredFeaturesDefs = (state: State) => state.metadata.measuredFeaturesDefs;
export const getFileInfo = (state: State) => state.metadata.cellFileInfo;
export const getClusterData = (state: State) => state.metadata.clusterData;

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

export const getMitoticKeyPerCell = createSelector([getMeasuredFeatureValues], (measuredFeatures) => {
    return measuredFeatures[MITOTIC_STAGE_KEY];
})
export const getProteinNames = createSelector([getCellLineDefs], (cellLineDef: CellLineDef[]): string[] => {
    const proteinNames: string[] = map(cellLineDef, PROTEIN_NAME_KEY);

        return proteinNames.sort((a, b) => {
            if (b > a) {
                return -1;
            } else if (a > b) {
                return 1;
            }
            return 0;
        });
    }
);

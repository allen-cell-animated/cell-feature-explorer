import { map, filter, sortBy, isEmpty } from "lodash";
import { createSelector } from "reselect";

import {
    MITOTIC_STAGE_KEY,
    PROTEIN_NAME_KEY,
} from "../../constants";
import { State } from "../types";

import {
    CellLineDef,
    DataForPlot,
    MappingOfMeasuredValuesArrays,
    PerCellLabels,
} from "./types";

// BASIC SELECTORS
export const getPerCellDataForPlot = (state: State) => state.metadata.featureData;
export const getCellLineDefs = (state: State) => state.metadata.cellLineDefs;
export const getAllAlbumData = (state: State) => state.metadata.albums;
export const getIsLoading = (state: State) => state.metadata.isLoading;
export const getLoadingText = (state: State) => state.metadata.loadingText;
export const getDatasets = (state: State) => state.metadata.datasets;
export const getFeatureNamesAndData = (state: State) => state.metadata.measuredFeatureNames;
export const getMeasuredFeaturesDefs = (state: State) => state.metadata.measuredFeaturesDefs;
export const getFileInfo = (state: State) => state.metadata.cellFileInfo;
export const getClusterData = (state: State) => state.metadata.clusterData;

export const getMeasuredFeatureArrays = createSelector([getPerCellDataForPlot], (dataForPlot: DataForPlot) => {
    return dataForPlot.values;
});

export const getLabelsPerCell = createSelector([getPerCellDataForPlot], (dataForPlot: DataForPlot) => {
    return dataForPlot.labels;
});

export const getSortedCellLineDefs = createSelector([getCellLineDefs], (cellLineDefs: CellLineDef[]): CellLineDef[] =>
    sortBy(cellLineDefs, [PROTEIN_NAME_KEY])
);

export const getProteinNames = createSelector(
    [getSortedCellLineDefs],
    (cellLineDef: CellLineDef[]): string[] => {
        return map(cellLineDef, PROTEIN_NAME_KEY);
    }
);

export const getMeasuredFeaturesKeys = createSelector([getMeasuredFeaturesDefs], (measuredFeatureDefs): string[] => {
    return map(measuredFeatureDefs,  "key");
});

export const getCategoricalFeatureKeys = createSelector([getMeasuredFeaturesDefs], (measuredFeatureDefs): string[] => {
    return map(filter(measuredFeatureDefs,  "discrete"), "key");
});

export const getProteinLabelsPerCell = createSelector([getLabelsPerCell], (labels: PerCellLabels): string[] => {
    return labels[PROTEIN_NAME_KEY] || [];
});

export const getMitoticKeyPerCell = createSelector([getMeasuredFeatureArrays], (measuredFeatures: MappingOfMeasuredValuesArrays): number[] => {
    return measuredFeatures[MITOTIC_STAGE_KEY] || [];
})


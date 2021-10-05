import { map, filter, sortBy, find } from "lodash";
import { createSelector } from "reselect";

import {
    MITOTIC_STAGE_KEY,
    PROTEIN_NAME_KEY,
} from "../../constants";
import { DatasetMetaData } from "../../constants/datasets";
import { State } from "../types";

import {
    CellLineDef,
    DataForPlot,
    MappingOfMeasuredValuesArrays,
    MeasuredFeatureDef,
    PerCellLabels,
} from "./types";

// BASIC SELECTORS
export const getPerCellDataForPlot = (state: State) => state.metadata.featureData;
export const getCellLineDefs = (state: State) => state.metadata.cellLineDefs;
export const getAllAlbumData = (state: State) => state.metadata.albums;
export const getIsLoading = (state: State) => state.metadata.isLoading;
export const getLoadingText = (state: State) => state.metadata.loadingText;
export const getShowSmallScreenWarning = (state: State) => state.metadata.showSmallScreenWarning;
export const getDatasets = (state: State) => state.metadata.datasets;
export const getFeatureNamesAndData = (state: State) => state.metadata.measuredFeatureNames;
export const getMeasuredFeaturesDefs = (state: State) => state.metadata.measuredFeaturesDefs;
export const getFileInfo = (state: State) => state.metadata.cellFileInfo;
export const getClusterData = (state: State) => state.metadata.clusterData;

export const getDatasetsByNewest = createSelector([getDatasets], (datasets) => {
    return datasets.sort((a: DatasetMetaData, b: DatasetMetaData) => {
        if (a.name === b.name) {
            // if it's the same dataset, return the newest version first
            if (a.version > b.version) {
                return -1;
            } else {
                return 1;
            }
        // else sort by "isNew"
        } else if (a.userData.isNew && !b.userData.isNew) {
            return -1;
        } else if (!a.userData.isNew && b.userData.isNew) {
            return 1;
        } else {
            return 0;
        }
    });
})

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

export const getMitoticStageNames = createSelector([getMeasuredFeaturesDefs], (defs: MeasuredFeatureDef[]) => {
    const mitoticFeature = find(defs, {key: MITOTIC_STAGE_KEY});
    if (mitoticFeature) {
        return mitoticFeature.options;
    }
    else return {};
});

export const getMitoticKeyPerCell = createSelector([getMeasuredFeatureArrays], (measuredFeatures: MappingOfMeasuredValuesArrays): number[] => {
    return measuredFeatures[MITOTIC_STAGE_KEY] || [];
})


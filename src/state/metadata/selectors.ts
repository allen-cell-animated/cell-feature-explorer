import { map, filter, sortBy, find } from "lodash";
import { createSelector } from "reselect";

import { MITOTIC_STAGE_KEY, PROTEIN_NAME_KEY } from "../../constants";
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
export const getViewerChannelSettings = (state: State) => state.metadata.viewerChannelSettings;

export const compareVersions = (versionA: string, versionB: string): number => {
    const [majorA, minorA, patchA] = versionA.split(".");
    const [majorB, minorB, patchB] = versionB.split(".");
    // may not exist (or actually be 0), either way, set to zero for comparison
    const minorANum = Number(minorA) || 0;
    const minorBNum = Number(minorB) || 0;
    const patchANum = Number(patchA) || 0;
    const patchBNum = Number(patchB) || 0;

    if (majorA === majorB) {
        // if the major versions are equal, check the minor and patch numbers
        if (minorANum === minorBNum) {
            // if minor versions are also equal, check patch number
            return patchBNum - patchANum;
        } else {
            return minorBNum - minorANum;
        }
    } else {
        return Number(majorB) - Number(majorA);
    }
};

export const getDatasetsByNewest = createSelector([getDatasets], (datasets) => {
    return datasets.sort((a: DatasetMetaData, b: DatasetMetaData) => {
        // TODO: We need to sort and group datasets by "megasets"
        // and then order those megasets by "newness"
        // plus we have plans to have different versions of the same
        // dataset contained within one card, so this is a temporary
        // sort function to get the newest datasets on top
        if (a.name === b.name) {
            // if it's the same dataset, return the newest version first
            return compareVersions(a.version, b.version);
            // otherwise sort by name
        } else if (a.name > b.name) {
            return -1;
        } else if (a.name < b.name) {
            return 1;
        } else {
            return 0;
        }
    });
});

export const getMeasuredFeatureArrays = createSelector(
    [getPerCellDataForPlot],
    (dataForPlot: DataForPlot) => {
        return dataForPlot.values;
    }
);

export const getLabelsPerCell = createSelector(
    [getPerCellDataForPlot],
    (dataForPlot: DataForPlot) => {
        return dataForPlot.labels;
    }
);

export const getSortedCellLineDefs = createSelector(
    [getCellLineDefs],
    (cellLineDefs: CellLineDef[]): CellLineDef[] => sortBy(cellLineDefs, [PROTEIN_NAME_KEY])
);

export const getProteinNames = createSelector(
    [getSortedCellLineDefs],
    (cellLineDef: CellLineDef[]): string[] => {
        return map(cellLineDef, PROTEIN_NAME_KEY);
    }
);

export const getMeasuredFeaturesKeys = createSelector(
    [getMeasuredFeaturesDefs],
    (measuredFeatureDefs): string[] => {
        return map(measuredFeatureDefs, "key");
    }
);

export const getCategoricalFeatureKeys = createSelector(
    [getMeasuredFeaturesDefs],
    (measuredFeatureDefs): string[] => {
        return map(filter(measuredFeatureDefs, "discrete"), "key");
    }
);

export const getProteinLabelsPerCell = createSelector(
    [getLabelsPerCell],
    (labels: PerCellLabels): string[] => {
        return labels[PROTEIN_NAME_KEY] || [];
    }
);

export const getMitoticStageNames = createSelector(
    [getMeasuredFeaturesDefs],
    (defs: MeasuredFeatureDef[]) => {
        const mitoticFeature = find(defs, { key: MITOTIC_STAGE_KEY });
        if (mitoticFeature) {
            return mitoticFeature.options;
        } else return {};
    }
);

export const getMitoticKeyPerCell = createSelector(
    [getMeasuredFeatureArrays],
    (measuredFeatures: MappingOfMeasuredValuesArrays): number[] => {
        return measuredFeatures[MITOTIC_STAGE_KEY] || [];
    }
);

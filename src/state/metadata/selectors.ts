import { ViewerChannelSettings } from "@aics/web-3d-viewer/type-declarations";
import { map, filter, forEach } from "lodash";
import { createSelector } from "reselect";
import { Album } from "..";

import { MITOTIC_STAGE_KEY } from "../../constants";
import { DatasetMetaData, Megaset } from "../image-dataset/types";
import { State } from "../types";
import { findFeature } from "../util";

import {
    DataForPlot,
    FileInfo,
    MappingOfMeasuredValuesArrays,
    MeasuredFeatureDef,
    MeasuredFeaturesOptions,
    PerCellLabels,
} from "./types";

// BASIC SELECTORS
export const getPerCellDataForPlot = (state: State): DataForPlot => state.metadata.featureData;
export const getAllAlbumData = (state: State): Album[] => state.metadata.albums;
export const getIsLoading = (state: State): boolean => state.metadata.isLoading;
export const getLoadingText = (state: State): string => state.metadata.loadingText;
export const getShowSmallScreenWarning = (state: State): boolean => state.metadata.showSmallScreenWarning;
export const getMegasets = (state: State): Megaset[] => state.metadata.megasets;
export const getMeasuredFeaturesDefs = (state: State): MeasuredFeatureDef[] => state.metadata.measuredFeaturesDefs;
export const getFileInfo = (state: State): FileInfo[] => state.metadata.cellFileInfo;
export const getViewerChannelSettings = (state: State): ViewerChannelSettings => state.metadata.viewerChannelSettings;

// Return individual datasets (unpack any megasets)
export const getDatasets = createSelector([getMegasets], (megasets): DatasetMetaData[] => {
    const datasets: DatasetMetaData[] = []
    megasets.forEach((megaset: Megaset) => {
        forEach(megaset.datasets, (dataset) => {
            datasets.push(dataset)
        })
    })
    return datasets;
})

export const getMegasetsByNewest = createSelector([getMegasets], (megasets): Megaset[] => {
    return megasets.sort((a: Megaset, b: Megaset) => {
        return b.dateCreated - a.dateCreated;
    })
});

export const getMeasuredFeatureArrays = createSelector(
    [getPerCellDataForPlot],
    (dataForPlot: DataForPlot): MappingOfMeasuredValuesArrays => {
        return dataForPlot.values;
    }
);

export const getLabelsPerCell = createSelector(
    [getPerCellDataForPlot],
    (dataForPlot: DataForPlot): PerCellLabels => {
        return dataForPlot.labels;
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

export const getMitoticStageNames = createSelector(
    [getMeasuredFeaturesDefs],
    (defs: MeasuredFeatureDef[]): MeasuredFeaturesOptions => {
        const mitoticFeature = findFeature(defs, MITOTIC_STAGE_KEY );
        if (mitoticFeature && mitoticFeature.discrete) {
            // if this feature exists, it will always be discrete, 
            // but need to let typescript know that
            return mitoticFeature.options;
        } else return {};
    }
);

export const getMitoticKeyPerCell = createSelector(
    [getMeasuredFeatureArrays],
    (measuredFeatures: MappingOfMeasuredValuesArrays): (number| null)[] => {
        return measuredFeatures[MITOTIC_STAGE_KEY] || [];
    }
);

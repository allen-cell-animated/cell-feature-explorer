import {
    find,
    includes,
    keys,
    map,
    mapValues,
    reduce,
} from "lodash";
import { createSelector } from "reselect";

import {
    CELL_ID_KEY,
    CELL_LINE_NAME_KEY,
    CLUSTER_DISTANCE_KEY,
    DOWNLOAD_URL_PREFIX,
    FOV_ID_KEY,
    GENERAL_PLOT_SETTINGS,
    PROTEIN_NAME_KEY,
} from "../../constants";

import {
    getClusterData,
    getFileInfo,
    getFullMetaDataArray,
    getMeasuredData,
    getProteinLabels,
    getProteinNames,
} from "../metadata/selectors";
import {
    FileInfo,
    MeasuredFeatures,
    MetadataStateBranch,
} from "../metadata/types";
import {
    Annotation,
    ContinuousPlotData,
    GroupedPlotData,
    NumberOrString,
    SelectedGroupDatum,
    SelectedGroups,
    State,
    Thumbnail,
} from "../types";
import { convertFileInfoToAICSId } from "../util";

import { CLUSTERING_MAP } from "./constants";
import { DownloadConfig } from "./types";

// BASIC SELECTORS
export const getPlotByOnX = (state: State) => state.selection.plotByOnX;
export const getPlotByOnY = (state: State) => state.selection.plotByOnY;
export const getClickedScatterPoints = (state: State) => state.selection.selectedPoints;
export const getSelectedGroups = (state: State) => state.selection.selectedGroups;
export const getColorBySelection = (state: State) => state.selection.colorBy;
export const getProteinColors = (state: State) => state.selection.proteinColors;
export const getSelectionSetColors = (state: State) => state.selection.selectedGroupColors;
export const getFiltersToExclude = (state: State) => state.selection.filterExclude;
export const getSelected3DCell = (state: State) => state.selection.cellSelectedFor3D;
export const getApplyColorToSelections = (state: State) => state.selection.applySelectionSetColoring;
export const getClustersOn = (state: State) => state.selection.showClusters;
export const getClusteringAlgorithm = (state: State) => state.selection.clusteringAlgorithm;
export const getNumberOfClusters = (state: State) => state.selection.numberOfClusters;
export const getClusteringDistance = (state: State) => state.selection.clusteringDistance;
export const getDownloadConfig = (state: State): DownloadConfig => state.selection.downloadConfig;
// COMPOSED SELECTORS
export const getSelected3DCellFOV = createSelector([getSelected3DCell, getFileInfo],
    (selected3DCellId: string, fileInfoArray: FileInfo[]) => {
        const fileInfo = find(fileInfoArray, {[CELL_ID_KEY]: selected3DCellId});
        return fileInfo ? fileInfo[FOV_ID_KEY] : "";
    }
);

export const getSelected3DCellCellLine = createSelector([getSelected3DCell, getFileInfo],
    (selected3DCellId: string, fileInfoArray: FileInfo[]) => {
        const fileInfo = find(fileInfoArray, {[CELL_ID_KEY]: selected3DCellId});
        return fileInfo ? fileInfo[CELL_LINE_NAME_KEY] : "";
    }
);

export const getXValues = createSelector([getMeasuredData, getPlotByOnX],
    (measuredData: MeasuredFeatures[], plotByOnX: string): number[] => (
         map(measuredData, (metaDatum: MeasuredFeatures) => (metaDatum[plotByOnX]))
    )
);

export const getYValues = createSelector([getMeasuredData, getPlotByOnY],
    (measuredData: MeasuredFeatures[], plotByOnY: string): number[] => (
        measuredData.map((metaDatum: MeasuredFeatures) => (metaDatum[plotByOnY]))
    )
);

export const getSelectedGroupsData = createSelector(
    [
        getMeasuredData,
        getSelectedGroups,
        getPlotByOnX,
        getPlotByOnY,
        getSelectionSetColors,
    ],
    (
        measuredDataArray,
        selectedGroups,
        plotByOnX,
        plotByOnY,
        selectedGroupColorMapping

    ): ContinuousPlotData => {
        const dataArray = mapValues(selectedGroups, (value, key) => {
            // for each point index, get x, y, and color for the point.
            return map(value, (pointIndex) => {

                const measuredFeatures = measuredDataArray[pointIndex];
                return {
                    groupColor: selectedGroupColorMapping[key],
                    x: measuredFeatures[plotByOnX],
                    y: measuredFeatures[plotByOnY],
                };
            });
        });
        // flatten into array
        const flattened = reduce(dataArray, (accum: SelectedGroupDatum[], value) =>
                [...accum, ...value],
            []
        );
        return {
            color: map(flattened, "groupColor"),
            x: map( flattened, "x"),
            y: map( flattened, "y"),
        };
    }
);

export const getPossibleColorByData = createSelector([getFullMetaDataArray], (metaData): MetadataStateBranch[] => (
    map(metaData, (ele) => (
            {
                ...ele.measured_features,
                [PROTEIN_NAME_KEY]: ele.file_info[PROTEIN_NAME_KEY],
            }
        )
    ))
);

export const getFilteredOpacity = createSelector(
    [
        getColorBySelection,
        getFiltersToExclude,
        getProteinLabels,
    ],
    (colorBySelection, filtersToExclude, proteinLabels): number[] => {
        return map(proteinLabels, (proteinName) => (
            includes(filtersToExclude, proteinName) ? 0 : GENERAL_PLOT_SETTINGS.unselectedCircleOpacity
        ));
    });

export const getOpacity = createSelector(
    [
        getColorBySelection,
        getFiltersToExclude,
        getProteinNames,
        getProteinLabels,
    ],
    (colorBySelection, filtersToExclude, proteinNameArray, proteinLabels): number[] => {
        let arrayToMap;
        if (colorBySelection === PROTEIN_NAME_KEY) {
            arrayToMap = proteinNameArray;
        } else {
            arrayToMap = proteinLabels;
        }
        return map(arrayToMap, (proteinName) => (
            includes(filtersToExclude, proteinName) ? 0 : GENERAL_PLOT_SETTINGS.unselectedCircleOpacity
        ));
});

export const getColorByValues = createSelector([getPossibleColorByData, getColorBySelection],
    (metaData: MetadataStateBranch[], colorBy: string): (string[] | number[]) => (
        map(metaData, colorBy)
    )
);

export const getMainPlotData = createSelector(
    [
        getXValues,
        getYValues,
        getColorByValues,
        getOpacity,
        getColorBySelection,
        getProteinColors,
        getProteinNames,
    ],
    (
        xValues,
        yValues,
        colorByValues,
        opacity,
        colorBy,
        proteinColors,
        proteinNames
    ): GroupedPlotData | ContinuousPlotData => {
    return {
        color: colorBy === PROTEIN_NAME_KEY ? null : colorByValues,
        groupBy: colorBy === PROTEIN_NAME_KEY,
        groupSettings: colorBy === PROTEIN_NAME_KEY ? map(proteinNames, (name: string, index) => {
            return {
                color: proteinColors[index],
                name,
                opacity: opacity[index],
            };
        }) : null,
        groups: colorByValues,
        opacity,
        x: xValues,
        y: yValues,
        };
    }
);

export const getSelectedGroupKeys = createSelector([getSelectedGroups],
    (selectedGroups: SelectedGroups): NumberOrString[] => {
        return keys(selectedGroups);
    }
);

export const getSelectedSetTotals = createSelector([getSelectedGroups], (selectedGroups): number[] => {
        return map(selectedGroups, (group) => group.length);
    }
);

export const getThumbnails = createSelector([
        getFileInfo,
        getClickedScatterPoints,
    ],
    (fileInfo: FileInfo[], clickedScatterPointIndices: number[]): Thumbnail[] => {
        return clickedScatterPointIndices.map((pointIndex) => {
            const cellID = fileInfo[pointIndex][CELL_ID_KEY];
            const cellLineId = fileInfo[pointIndex][CELL_LINE_NAME_KEY];
            const fovId = fileInfo[pointIndex][FOV_ID_KEY];
            const src = `/${cellLineId}/${cellLineId}_${fovId}_${cellID}.png`;
            const downloadHref = `${DOWNLOAD_URL_PREFIX}id=${convertFileInfoToAICSId(fileInfo[pointIndex])}`;
            return {
                cellID,
                downloadHref,
                pointIndex,
                src,
            };
        });
    }
);

export const getAnnotations = createSelector(
    [
        getMeasuredData,
        getFileInfo,
        getClickedScatterPoints,
        getPlotByOnX,
        getPlotByOnY,
    ],
     (
         measuredData: MeasuredFeatures[],
         fileInfo: FileInfo[],
         clickedScatterPointIndices: number[],
         xaxis,
         yaxis
     ): Annotation[] => {
        return clickedScatterPointIndices.map((pointIndex) => {
            const cellID = fileInfo[pointIndex][CELL_ID_KEY];
            const fovID = fileInfo[pointIndex][FOV_ID_KEY];
            const cellLine = fileInfo[pointIndex][CELL_LINE_NAME_KEY];
            const x = measuredData[pointIndex][xaxis];
            const y = measuredData[pointIndex][yaxis];
            return {
                cellID,
                cellLine,
                fovID,
                pointIndex,
                x,
                y,
            };
        });
    }
);

export const getClusteringRange = createSelector([getClusterData, getClusteringAlgorithm],
    (clusterData, clusteringAlgorithm): string[] => {
        if (clusterData[0]) {
            return keys(clusterData[0][clusteringAlgorithm]);
        }
        return [];
    }
);

export const getClusteringSetting = createSelector(
    [getClusteringAlgorithm, getClusteringDistance, getNumberOfClusters],
    (clusteringAlgorithm, distance, numberOfClusters): string => {
    const clusteringType = CLUSTERING_MAP(clusteringAlgorithm);
    return clusteringType === CLUSTER_DISTANCE_KEY ? distance : numberOfClusters;
});

export const getClusteringResult = createSelector(
    [
        getClusterData,
        getClusteringAlgorithm,
        getClusteringSetting,
        getXValues,
        getYValues,
        getFilteredOpacity,
    ],
    (
            clusteringData,
            clusteringAlgorithm,
            clusterSetting,
            xValues,
            yValues,
            opacity
    ): ContinuousPlotData => {
            return {
                color: map(clusteringData, (ele) => ele[clusteringAlgorithm][clusterSetting]),
                opacity,
                x: xValues,
                y: yValues,
            };

    }
);

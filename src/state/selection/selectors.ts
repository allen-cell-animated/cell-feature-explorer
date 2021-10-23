import { find, includes, isEmpty, keys, map, mapValues, reduce, values } from "lodash";
import { createSelector } from "reselect";

import {
    ARRAY_OF_CELL_IDS_KEY,
    CELL_ID_KEY,
    CELL_LINE_DEF_NAME_KEY,
    CELL_LINE_DEF_STRUCTURE_KEY,
    CELL_LINE_NAME_KEY,
    CLUSTER_DISTANCE_KEY,
    FOV_ID_KEY,
    GENERAL_PLOT_SETTINGS,
    PROTEIN_NAME_KEY,
} from "../../constants";
import {
    getPerCellDataForPlot,
    getProteinLabelsPerCell,
    getProteinNames,
    getMeasuredFeaturesKeys,
    getCategoricalFeatureKeys,
    getMeasuredFeaturesDefs,
    getClusterData,
    getCellLineDefs,
} from "../metadata/selectors";
import {
    CellLineDef,
    DataForPlot,
    FileInfo,
    MappingOfMeasuredValuesArrays,
    MeasuredFeatureDef,
    MeasuredFeaturesWithProteinNames,
    MetadataStateBranch,
    PerCellLabels,
} from "../metadata/types";
import { ContinuousPlotData, NumberOrString, SelectedGroups, State } from "../types";
import { getFileInfoDatumFromCellId } from "../util";
import { CLUSTERING_MAP } from "./constants";

import { ColorForPlot, DownloadConfig, LassoOrBoxSelectPointData } from "./types";

// BASIC SELECTORS
export const getPlotByOnX = (state: State) => state.selection.plotByOnX;
export const getPlotByOnY = (state: State) => state.selection.plotByOnY;
export const getClickedCellsFileInfo = (state: State) => state.selection.selectedPoints;
export const getSelectedGroups = (state: State) => state.selection.selectedGroups;
export const getColorBySelection = (state: State) => state.selection.colorBy;
export const getProteinColors = (state: State) => state.selection.proteinColors;
export const getSelectionSetColors = (state: State) => state.selection.selectedGroupColors;
export const getFiltersToExclude = (state: State) => state.selection.filterExclude;
export const getSelected3DCell = (state: State) => state.selection.cellSelectedFor3D;
export const getApplyColorToSelections = (state: State) =>
    state.selection.applySelectionSetColoring;
export const getClustersOn = (state: State) => state.selection.showClusters;
export const getClusteringAlgorithm = (state: State) => state.selection.clusteringAlgorithm;
export const getNumberOfClusters = (state: State) => state.selection.numberOfClusters;
export const getClusteringDistance = (state: State) => state.selection.clusteringDistance;
export const getDownloadConfig = (state: State): DownloadConfig => state.selection.downloadConfig;
export const getMousePosition = (state: State) => state.selection.mousePosition;
export const getHoveredPointData = (state: State) => state.selection.hoveredPointData;
export const getHoveredCardId = (state: State) => state.selection.hoveredCardId;
export const getSelectedAlbum = (state: State) => state.selection.selectedAlbum;
export const getGalleryCollapsed = (state: State) => state.selection.galleryCollapsed;
export const getSelectedDataset = (state: State) => state.selection.dataset;
export const getThumbnailRoot = (state: State) => state.selection.thumbnailRoot;
export const getSelectedIdsFromUrl = (state: State) => state.selection.initSelectedPoints;
export const getSelectedAlbumFileInfo = (state: State) => state.selection.selectedAlbumFileInfo;
export const getDownloadRoot = (state: State) => state.selection.downloadRoot;
export const getVolumeViewerDataRoot = (state: State) => state.selection.volumeViewerDataRoot;
export const getDisplayableGroups = (state: State) => state.selection.displayableGroups;


// COMPOSED SELECTORS

// MAIN PLOT SELECTORS

// not truly a selector, it just seemed cleaner to make this one function instead of 3
// (2 for each axis and one for the color by)
export function getFeatureDefTooltip(key: string, options: MeasuredFeatureDef[]): string {
        const data = find(options, {key: key})
        if (data) {
            return data.tooltip
        }
        return ""
    }  
    
export const getFilteredCellData = createSelector(
    [getMeasuredFeaturesKeys, getFiltersToExclude, getPerCellDataForPlot],
    (measuredFeatureKeys, filtersToExclude, perCellDataForPlot: DataForPlot): DataForPlot => {
        if (!filtersToExclude.length) {
            return perCellDataForPlot;
        }
        const proteinNameArray: string[] = [];
        const dataToReturn: MappingOfMeasuredValuesArrays = {};
        const cellIds: string[] = [];
        const thumbnails: string[] = [];

        for (let i = 0; i < perCellDataForPlot.labels.structureProteinName.length; i++) {
            const proteinName: string = perCellDataForPlot.labels.structureProteinName[i];
            if (!includes(filtersToExclude, proteinName)) {
                const cellId = perCellDataForPlot.labels.cellIds[i];
                cellIds.push(cellId);
                proteinNameArray.push(proteinName);
                thumbnails.push(perCellDataForPlot.labels.thumbnailPaths[i]);
                measuredFeatureKeys.forEach((featureKey) => {
                    if (!dataToReturn[featureKey]) {
                        dataToReturn[featureKey] = [];
                    }

                    dataToReturn[featureKey].push(
                        perCellDataForPlot.values[featureKey][i] as never
                    );
                });
            }
        }
        return {
            values: dataToReturn,
            labels: {
                [PROTEIN_NAME_KEY]: proteinNameArray,
                [ARRAY_OF_CELL_IDS_KEY]: cellIds,
                thumbnailPaths: thumbnails,
            },
        };
    }
);

export const getFilteredMeasuredValues = createSelector([getFilteredCellData], (plotForData) => {
    return plotForData.values || {};
});

export const getFilteredPerCellLabels = createSelector([getFilteredCellData], (plotForData) => {
    return plotForData.labels || {};
});

export const getXValues = createSelector(
    [getFilteredMeasuredValues, getPlotByOnX],
    (measuredData: MappingOfMeasuredValuesArrays, plotByOnX: string): number[] => {
        if (measuredData[plotByOnX]) {
            return measuredData[plotByOnX];
        }
        return [];
    }
);

export const getYValues = createSelector(
    [getFilteredMeasuredValues, getPlotByOnY],
    (measuredData: MappingOfMeasuredValuesArrays, plotByOnY: string): number[] =>
        measuredData[plotByOnY] || []
);

export const getIds = createSelector(
    [getFilteredPerCellLabels],
    (cellLabels: PerCellLabels): string[] => {
        return cellLabels[ARRAY_OF_CELL_IDS_KEY] || [];
    }
);

export const getThumbnailPaths = createSelector(
    [getFilteredPerCellLabels],
    (cellLabels: PerCellLabels) => {
        return cellLabels.thumbnailPaths || [];
    }
);

export const getColorByValues = createSelector(
    [getFilteredCellData, getColorBySelection],
    (metaData: DataForPlot, colorBy: string): string[] | number[] => {
        if (!metaData.labels) {
            return [];
        }
        const options: MeasuredFeaturesWithProteinNames = {
            ...metaData.values,
            structureProteinName: metaData.labels.structureProteinName,
        };

        return options[colorBy] || [];
    }
);

export const getColorsForPlot = createSelector(
    [
        getColorBySelection,
        getProteinNames,
        getProteinColors,
        getMeasuredFeaturesDefs,
        getCategoricalFeatureKeys,
    ],
    (
        colorBy: string,
        proteinNames: string[],
        proteinColors: string[],
        measuredFeaturesDefs,
        categoricalFeatureKeys
    ): ColorForPlot[] => {
        if (colorBy === PROTEIN_NAME_KEY) {
            return map(proteinNames, (name: string, index) => {
                return {
                    color: proteinColors[index],
                    name,
                    label: name,
                };
            });
        } else if (includes(categoricalFeatureKeys, colorBy)) {
            const feature = find(measuredFeaturesDefs, { key: colorBy });
            if (feature) {
                const { options } = feature;
                return map(options, (value, key) => {
                    return {
                        color: value.color,
                        name: key,
                        label: value.name,
                    };
                });
            }
        }
        return [];
    }
);

export const getCategoryCounts = createSelector(
    [getPerCellDataForPlot, getColorBySelection, getMeasuredFeaturesDefs],
    (
        measuredData: MetadataStateBranch,
        colorBy: string,
        measuredFeatureDefs: MeasuredFeatureDef[]
    ): number[] => {
        const feature = find(measuredFeatureDefs, { key: colorBy });
        if (feature && feature.discrete) {
            const categoryValues = map(feature.options, (_, key) => Number(key));
            const totals = reduce(
                measuredData[colorBy],
                (acc: { [key: number]: number }, cur) => {
                    const index = categoryValues.indexOf(Number(cur));
                    if (acc[index]) {
                        acc[index]++;
                    } else {
                        acc[index] = 1;
                    }
                    return acc;
                },
                {}
            );
            return values(totals);
        }
        return [];
    }
);

export const getFilteredOpacity = createSelector(
    [getColorBySelection, getFiltersToExclude, getProteinLabelsPerCell],
    (colorBySelection, filtersToExclude, proteinLabels): number[] => {
        return map(proteinLabels, (proteinName) =>
            includes(filtersToExclude, proteinName)
                ? 0
                : GENERAL_PLOT_SETTINGS.unselectedCircleOpacity
        );
    }
);

export const getOpacity = createSelector(
    [getColorBySelection, getFiltersToExclude, getProteinNames, getProteinLabelsPerCell],
    (colorBySelection, filtersToExclude, proteinNameArray, proteinLabels): number[] => {
        let arrayToMap;
        if (colorBySelection === PROTEIN_NAME_KEY) {
            arrayToMap = proteinNameArray;
        } else {
            arrayToMap = proteinLabels;
        }
        return map(arrayToMap, (proteinName) =>
            includes(filtersToExclude, proteinName)
                ? 0
                : GENERAL_PLOT_SETTINGS.unselectedCircleOpacity
        );
    }
);

export const getClickedScatterPoints = createSelector(
    [getClickedCellsFileInfo],
    (cells: FileInfo[]) => map(cells, CELL_ID_KEY)
);


// 3D VIEWER SELECTORS
export const getSelected3DCellFileInfo = createSelector(
    [getSelected3DCell, getClickedCellsFileInfo],
    (selected3DCellId: string, fileInfoArray: FileInfo[]): FileInfo => {
        return getFileInfoDatumFromCellId(fileInfoArray, selected3DCellId) || ({} as FileInfo);
    }
);

export const getSelected3DCellFOV = createSelector(
    [getSelected3DCellFileInfo],
    (fileInfo: FileInfo): string => {
        return !isEmpty(fileInfo) ? fileInfo[FOV_ID_KEY].toString() : "";
    }
);

export const getSelected3DCellCellLine = createSelector(
    [getSelected3DCellFileInfo],
    (fileInfo: FileInfo): string => {
        return !isEmpty(fileInfo) ? fileInfo[CELL_LINE_NAME_KEY] : "";
    }
);

export const getSelected3DCellLabeledProtein = createSelector(
    [getSelected3DCellFileInfo],
    (fileInfo: FileInfo): string => {
        return !isEmpty(fileInfo) ? fileInfo[PROTEIN_NAME_KEY] : "";
    }
);

export const getSelected3DCellLabeledStructure = createSelector(
    [getCellLineDefs, getSelected3DCellCellLine],
    (cellLineDefs: CellLineDef[], cellLineId: string): string => {
        const cellLineData = find(cellLineDefs, { [CELL_LINE_DEF_NAME_KEY]: cellLineId });
        if (cellLineData) {
            return cellLineData[CELL_LINE_DEF_STRUCTURE_KEY];
        }
        return "";
    }
);

// SELECTED GROUPS SELECTORS
export const getSelectedGroupsData = createSelector(
    [getPerCellDataForPlot, getSelectedGroups, getPlotByOnX, getPlotByOnY, getSelectionSetColors],
    (
        metaData,
        selectedGroups,
        plotByOnX,
        plotByOnY,
        selectedGroupColorMapping
    ): ContinuousPlotData => {
        const colorArray: string[] = [];
        const xValues: number[] = [];
        const yValues: number[] = [];

        mapValues(selectedGroups, (value, key) => {
            // for each point index, get x, y, and color for the point.
            value.forEach((point: LassoOrBoxSelectPointData) => {
                colorArray.push(selectedGroupColorMapping[key]);
                xValues.push(metaData.values[plotByOnX][point.pointIndex]);
                yValues.push(metaData.values[plotByOnY][point.pointIndex]);
            });
        });

        return {
            color: colorArray,
            x: xValues,
            y: yValues,
        };
    }
);

export const getSelectedGroupKeys = createSelector(
    [getSelectedGroups],
    (selectedGroups: SelectedGroups): NumberOrString[] => {
        return keys(selectedGroups);
    }
);

export const getSelectedSetTotals = createSelector(
    [getSelectedGroups],
    (selectedGroups): number[] => {
        return map(selectedGroups, (group) => group.length);
    }
);

// CLUSTERING SELECTORS
// TODO: get these to work with dataset v1
export const getClusteringRange = createSelector(
    [getClusterData, getClusteringAlgorithm],
    (clusterData: any[], clusteringAlgorithm): string[] => {
        if (clusterData[0]) {
            return keys(clusterData[0][clusteringAlgorithm]);
        }
        return [];
    }
);

export const getFilteredClusteringData = createSelector([getFilteredCellData], (): any[] => {
    return [];
});

export const getClusteringSetting = createSelector(
    [getClusteringAlgorithm, getClusteringDistance, getNumberOfClusters],
    (clusteringAlgorithm, distance, numberOfClusters): string => {
        const clusteringType = CLUSTERING_MAP(clusteringAlgorithm);
        return clusteringType === CLUSTER_DISTANCE_KEY ? distance : numberOfClusters;
    }
);

export const getClusteringResult = createSelector(
    [
        getFilteredClusteringData,
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

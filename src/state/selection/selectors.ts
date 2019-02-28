import {
    filter,
    find,
    findIndex,
    includes,
    keys,
    map,
    mapValues,
    reduce,
} from "lodash";
import { createSelector } from "reselect";

import {
    CELL_ID_KEY,
    CELL_LINE_DEF_STRUCTURE_KEY,
    CELL_LINE_NAME_KEY,
    CLUSTER_DISTANCE_KEY,
    FOV_ID_KEY,
    GENERAL_PLOT_SETTINGS,
    PROTEIN_NAME_KEY,
} from "../../constants";

import {
    getClusterData,
    getFileInfo,
    getFullCellLineDefs,
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
    NumberOrString,
    SelectedGroupDatum,
    SelectedGroups,
    State,
} from "../types";
import {
    getFileInfoDatumFromCellId,
} from "../util";

import { CLUSTERING_MAP } from "./constants";
import {
    ClusteringDatum,
    DownloadConfig,
} from "./types";

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
export const getMousePosition = (state: State) => state.selection.mousePosition;
export const getHoveredPointId = (state: State) => state.selection.hoveredPointId;
export const getHoveredCardId = (state: State) => state.selection.hoveredCardId;
// COMPOSED SELECTORS

// MAIN PLOT SELECTORS
export const getFilteredData = createSelector([getFiltersToExclude, getFullMetaDataArray],
    (filtersToExclude, fullMetaDataArray) => {
    if (!filtersToExclude.length) {
        return fullMetaDataArray;
    }
    return filter(fullMetaDataArray,
        (metaDatum) => !includes(filtersToExclude, metaDatum.file_info[PROTEIN_NAME_KEY]
        ));
});

export const getFilteredMeasuredData = createSelector([getFilteredData],
    (fullMetaData): MeasuredFeatures[] => {
    return map(fullMetaData, "measured_features");
});

export const getFilteredFileInfo = createSelector([getFilteredData], (fullMetaData): FileInfo[] => {
    return map(fullMetaData, "file_info");
});

export const getXValues = createSelector([getFilteredMeasuredData, getPlotByOnX],
    (measuredData: MeasuredFeatures[], plotByOnX: string): number[] => (
        map(measuredData, (metaDatum: MeasuredFeatures) => (metaDatum[plotByOnX]))
    )
);

export const getYValues = createSelector([getFilteredMeasuredData, getPlotByOnY],
    (measuredData: MeasuredFeatures[], plotByOnY: string): number[] => (
        measuredData.map((metaDatum: MeasuredFeatures) => (metaDatum[plotByOnY]))
    )
);

export const getIds = createSelector([getFilteredFileInfo],
    (fileInfoArray: FileInfo[]) => {
        return map(fileInfoArray, (fileInfo) => fileInfo[CELL_ID_KEY].toString());
    }
);

export const getPossibleColorByData = createSelector([getFilteredData], (metaData): MetadataStateBranch[] => (
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

export const getHoveredPointData = createSelector([getHoveredPointId, getFileInfo],
    (hoveredPointId: number, fileInfo: FileInfo[]): FileInfo | undefined => {
    return find(fileInfo, {[CELL_ID_KEY]: hoveredPointId});
});

const getSelectedScatterPointsWithAvailableMetadata = createSelector([
    getFileInfo,
    getClickedScatterPoints,
], (fileInfo: FileInfo[], clickedScatterPointIDs: number[]): number[] => {
    const setOfAvailableCellIds = new Set(map(fileInfo, CELL_ID_KEY));
    return filter(clickedScatterPointIDs, (id) => setOfAvailableCellIds.has(id));
});

export const getAnnotations = createSelector(
    [
        getMeasuredData,
        getFileInfo,
        getSelectedScatterPointsWithAvailableMetadata,
        getPlotByOnX,
        getPlotByOnY,
        getHoveredCardId,
    ],
    (
        measuredData: MeasuredFeatures[],
        fileInfo: FileInfo[],
        clickedScatterPointIDs: number[],
        xaxis,
        yaxis,
        currentHoveredCellId
    ): Annotation[] => {
        return clickedScatterPointIDs.map((cellID) => {
            const pointIndex = findIndex(fileInfo, (datum) => Number(datum[CELL_ID_KEY]) === Number(cellID));
            const fovID = fileInfo[pointIndex][FOV_ID_KEY];
            const cellLine = fileInfo[pointIndex][CELL_LINE_NAME_KEY];
            const x = measuredData[pointIndex][xaxis];
            const y = measuredData[pointIndex][yaxis];
            return {
                cellID,
                cellLine,
                fovID,
                hovered: cellID === currentHoveredCellId,
                pointIndex,
                x,
                y,
            };
        });
    }
);

// 3D VIEWER SELECTORS
export const getSelected3DCellFileInfo = createSelector([getSelected3DCell, getFileInfo],
    (selected3DCellId: string, fileInfoArray: FileInfo[]): FileInfo | undefined => {
        return getFileInfoDatumFromCellId(fileInfoArray, selected3DCellId);
    }
);

export const getSelected3DCellFOV = createSelector([getSelected3DCellFileInfo],
    (fileInfo: FileInfo | undefined): string => {
        return fileInfo ? fileInfo[FOV_ID_KEY] : "";
    }
);

export const getSelected3DCellCellLine = createSelector([getSelected3DCellFileInfo],
    (fileInfo: FileInfo | undefined): string => {
        return fileInfo ? fileInfo[CELL_LINE_NAME_KEY] : "";
    }
);

export const getSelected3DCellLabeledProtein = createSelector([getSelected3DCellFileInfo],
    (fileInfo: FileInfo | undefined): string => {
        return fileInfo ? fileInfo[PROTEIN_NAME_KEY] : "";
    }
);

export const getSelected3DCellLabeledStructure = createSelector([getFullCellLineDefs, getSelected3DCellCellLine],
    (cellLineDefs, cellLineId): string => {
        return cellLineDefs[cellLineId] ? cellLineDefs[cellLineId][CELL_LINE_DEF_STRUCTURE_KEY] : "";
    }
);

// SELECTED GROUPS SELECTORS
export const getSelectedGroupsData = createSelector(
    [
        getFullMetaDataArray,
        getSelectedGroups,
        getPlotByOnX,
        getPlotByOnY,
        getSelectionSetColors,
    ],
    (
        metaData,
        selectedGroups,
        plotByOnX,
        plotByOnY,
        selectedGroupColorMapping

    ): ContinuousPlotData => {
        const dataArray = mapValues(selectedGroups, (value, key) => {
            // for each point index, get x, y, and color for the point.
            return map(value, (cellId) => {
                // ids are converted to strings for plotly, so converting both to numbers to be sure
                const fullDatum = find(metaData, (ele) => Number(ele.file_info[CELL_ID_KEY]) === Number(cellId));
                return {
                    groupColor: selectedGroupColorMapping[key],
                    x: fullDatum.measured_features[plotByOnX],
                    y: fullDatum.measured_features[plotByOnY],
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

export const getSelectedGroupKeys = createSelector([getSelectedGroups],
    (selectedGroups: SelectedGroups): NumberOrString[] => {
        return keys(selectedGroups);
    }
);

export const getSelectedSetTotals = createSelector([getSelectedGroups], (selectedGroups): number[] => {
        return map(selectedGroups, (group) => group.length);
    }
);

// CLUSTERING SELECTORS
export const getClusteringRange = createSelector([getClusterData, getClusteringAlgorithm],
    (clusterData, clusteringAlgorithm): string[] => {
        if (clusterData[0]) {
            return keys(clusterData[0][clusteringAlgorithm]);
        }
        return [];
    }
);

export const getFilteredClusteringData = createSelector([getFilteredData], (fullMetaData): ClusteringDatum[] => {
    return map(fullMetaData, "clusters");
});

export const getClusteringSetting = createSelector(
    [getClusteringAlgorithm, getClusteringDistance, getNumberOfClusters],
    (clusteringAlgorithm, distance, numberOfClusters): string => {
    const clusteringType = CLUSTERING_MAP(clusteringAlgorithm);
    return clusteringType === CLUSTER_DISTANCE_KEY ? distance : numberOfClusters;
});

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

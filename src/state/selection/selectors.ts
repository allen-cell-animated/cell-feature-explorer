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
import {
    convertFileInfoToAICSId, convertFileInfoToImgSrc,
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
// COMPOSED SELECTORS

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

export const getSelected3DCellFOV = createSelector([getSelected3DCell, getFileInfo],
    (selected3DCellId: string, fileInfoArray: FileInfo[]) => {
        const fileInfo = getFileInfoDatumFromCellId(fileInfoArray, selected3DCellId);
        return fileInfo ? fileInfo[FOV_ID_KEY] : "";
    }
);

export const getSelected3DCellCellLine = createSelector([getSelected3DCell, getFileInfo],
    (selected3DCellId: string, fileInfoArray: FileInfo[]) => {
        const fileInfo = getFileInfoDatumFromCellId(fileInfoArray, selected3DCellId);
        return fileInfo ? fileInfo[CELL_LINE_NAME_KEY] : "";
    }
);

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

export const getMainPlotData = createSelector(
    [
        getXValues,
        getYValues,
        getIds,
        getFilteredFileInfo,
        getColorByValues,
        getColorBySelection,
        getProteinColors,
        getProteinNames,
    ],
    (
        xValues,
        yValues,
        ids,
        filteredFileInfo,
        colorByValues,
        colorBy,
        proteinColors,
        proteinNames
    ): GroupedPlotData | ContinuousPlotData => {
    return {
        color: colorBy === PROTEIN_NAME_KEY ? null : colorByValues,
        customdata: filteredFileInfo,
        groupBy: colorBy === PROTEIN_NAME_KEY,
        groupSettings: colorBy === PROTEIN_NAME_KEY ? map(proteinNames, (name: string, index) => {
            return {
                color: proteinColors[index],
                name,
            };
        }) : null,
        groups: colorByValues,
        ids,
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
    (fileInfo: FileInfo[], clickedScatterPointIDs: string[]): Thumbnail[] => {
        const init: Thumbnail[] = [];
        return reduce(clickedScatterPointIDs, (acc, cellID) => {
            const cellData: FileInfo | undefined = getFileInfoDatumFromCellId(fileInfo, cellID);
            if (cellData) {
                const src = convertFileInfoToImgSrc(cellData);
                const downloadHref = `${DOWNLOAD_URL_PREFIX}&id=${convertFileInfoToAICSId(cellData)}`;
                acc.push({
                    cellID: Number(cellID),
                    downloadHref,
                    labeledStructure: cellData[PROTEIN_NAME_KEY],
                    src,
                });
            }
            return acc;
        }, init);
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
         clickedScatterPointIDs: string[],
         xaxis,
         yaxis
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

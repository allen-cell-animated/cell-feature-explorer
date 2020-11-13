import {
    filter,
    find,
    findIndex,
    includes,
    isEmpty,
    keys,
    map,
    mapKeys,
    mapValues,
    reduce,
    values,
} from "lodash";
import { createSelector } from "reselect";
import { $enum } from "ts-enum-util";

import {
    CATEGORICAL_FEATURES,
    CATEGORY_TO_COLOR_LOOKUP,
    CELL_ID_KEY,
    CELL_LINE_DEF_STRUCTURE_KEY,
    CELL_LINE_NAME_KEY,
    CLUSTER_DISTANCE_KEY,
    FOV_ID_KEY,
    GENERAL_PLOT_SETTINGS, getLabels,
    PROTEIN_NAME_KEY,
} from "../../constants";
import {
    getFileInfo,
    getMeasuredFeatureValues,
    getProteinLabelsPerCell,
    getProteinNames,
    getMeasuredFeaturesKeys,
} from "../metadata/selectors";
import {
    FileInfo,
    MeasuredFeatureArrays,
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

import {
    ColorForPlot,
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
export const getSelectedAlbum = (state: State) => state.selection.selectedAlbum;
export const getGalleryCollapsed = (state: State) => state.selection.galleryCollapsed;
export const getSelectedDataset = (state: State) => state.selection.dataset;
// COMPOSED SELECTORS

// MAIN PLOT SELECTORS
export const getFilteredCellData = createSelector(
           [
               getMeasuredFeaturesKeys, 
               getFiltersToExclude, 
               getFileInfo, 
               getMeasuredFeatureValues
            ],
           (measuredFeatureKeys, filtersToExclude, fileInfo, measuredFeaturesByKey) => {
               console.log(filtersToExclude)
               if (!filtersToExclude.length) {
                   return {
                       ...measuredFeaturesByKey,
                       fileInfo,
                       [PROTEIN_NAME_KEY]: map(fileInfo, PROTEIN_NAME_KEY),
                   };
               }
               const dataToReturn = mapValues(measuredFeaturesByKey, () => []);
               dataToReturn.fileInfo = [];
               console.log(dataToReturn);
               for (let i = 1; i++; i < fileInfo.length) {
                   const datum = fileInfo[i];
                   if (includes(filtersToExclude, datum[PROTEIN_NAME_KEY])) {
                       dataToReturn.fileInfo.push(datum);
                       dataToReturn[PROTEIN_NAME_KEY].push(datum[PROTEIN_NAME_KEY]);
                       measuredFeatureKeys.forEach(key => {
                           if (measuredFeaturesByKey[key]) {
                               dataToReturn[key].push(measuredFeaturesByKey[key][i]);
                           }
                       });
                   }
               }
           }
       );


export const getXValues = createSelector(
           [getFilteredCellData, getPlotByOnX],
           (measuredData: MeasuredFeatureArrays, plotByOnX: string): number[] => {
               if (measuredData[plotByOnX]) {
                   return measuredData[plotByOnX];
               }
               return [];
           }
       );

export const getYValues = createSelector(
           [getFilteredCellData, getPlotByOnY],
           (measuredData: MeasuredFeatureArrays, plotByOnY: string): number[] =>
               measuredData[plotByOnY]
       );

export const getIds = createSelector([getFilteredCellData], (measuredData: MeasuredFeatureArrays) => {
           return measuredData.cellIds;
       });

export const getColorsForPlot = createSelector([getColorBySelection, getProteinNames, getProteinColors],
    (colorBy: string, proteinNames: string[], proteinColors: string[]): ColorForPlot[] | null => {
        if (colorBy === PROTEIN_NAME_KEY) {
            return map(proteinNames, (name: string, index) => {
                return {
                    color: proteinColors[index],
                    name,
                };
            });
        } else if (includes(CATEGORICAL_FEATURES, colorBy)) {
            const colors = CATEGORY_TO_COLOR_LOOKUP[colorBy];
            return map(colors, (value, key) => {
                return {
                    color: value,
                    name: key,
                };
            });
        }
        return null;
    }
);

export const getCategoryCounts = createSelector([getMeasuredFeatureValues, getColorBySelection],
    (measuredData: MetadataStateBranch, colorBy: string): number[] => {
        const categoryEnum = getLabels(colorBy);
        if (!isEmpty(categoryEnum)) {
            const categoryValues = $enum(categoryEnum).getValues();
            const totals =  reduce(measuredData, (acc: {[key: number]: number}, cur) => {
                const index = categoryValues.indexOf(cur[colorBy]);
                if (acc[index]) {
                    acc[index] ++;
                } else {
                    acc[index] = 1;
                }
                return acc;
            }, {});
            return values(totals);
        }
        return [];
    }
);

export const getFilteredOpacity = createSelector(
    [
        getColorBySelection,
        getFiltersToExclude,
        getProteinLabelsPerCell,
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
        getProteinLabelsPerCell,
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

export const getColorByValues = createSelector([getFilteredCellData, getColorBySelection],
    (metaData: MetadataStateBranch, colorBy: string): (string[] | number[]) => {
        console.log("GET COLORBY DATA", colorBy);
        console.log(metaData);
        return metaData[colorBy];
    }
    
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
        getMeasuredFeatureValues,
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
        if (isEmpty(measuredData)) {
            return []
        }
        return clickedScatterPointIDs.map((cellID) => {
            const pointIndex = findIndex(fileInfo, (datum) => Number(datum[CELL_ID_KEY]) === Number(cellID));
            const fovID = fileInfo[pointIndex][FOV_ID_KEY];
            const cellLine = fileInfo[pointIndex][CELL_LINE_NAME_KEY];
            console.log(measuredData, xaxis, yaxis)
            const x = measuredData[xaxis][pointIndex];
            const y = measuredData[yaxis][pointIndex];
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

export const getSelected3DCellLabeledStructure = createSelector([getFileInfo, getSelected3DCellCellLine],
    (cellFileInfo, cellLineId): string => {
        return cellFileInfo[cellLineId] ? cellFileInfo[cellLineId][CELL_LINE_DEF_STRUCTURE_KEY] : "";
    }
);

// SELECTED GROUPS SELECTORS
export const getSelectedGroupsData = createSelector(
    [
        getMeasuredFeatureValues,
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
                const fullDatum = find(metaData, (ele) => Number(ele[CELL_ID_KEY]) === Number(cellId));
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



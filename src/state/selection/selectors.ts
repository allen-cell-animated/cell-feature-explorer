import {
    filter,
    find,
    findIndex,
    includes,
    isEmpty,
    keys,
    map,
    mapValues,
    reduce,
    values,
} from "lodash";
import { createSelector } from "reselect";
import { $enum } from "ts-enum-util";

import {
    ARRAY_OF_FILE_INFO_KEY,
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
    getCategoricalFeatureKeys,
    getMeasuredFeaturesDefs,
    getClusterData,
} from "../metadata/selectors";
import {
    FileInfo,
    MappingOfCellDataArrays,
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
    CellDataArrays,
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
// COMPOSED SELECTORS

// MAIN PLOT SELECTORS
export const getFilteredCellData = createSelector(
           [getMeasuredFeaturesKeys, getFiltersToExclude, getFileInfo, getMeasuredFeatureValues],
           (
               measuredFeatureKeys,
               filtersToExclude,
               fileInfo,
               measuredFeaturesByKey
           ): MappingOfCellDataArrays => {
               if (!filtersToExclude.length) {
                   return {
                       ...measuredFeaturesByKey,
                       [ARRAY_OF_FILE_INFO_KEY]: fileInfo,
                       [PROTEIN_NAME_KEY]: map(fileInfo, PROTEIN_NAME_KEY),
                   };
               }
               const fileInfoArray: FileInfo[] = [];
               const proteinNameArray: string[] = [];
               const dataToReturn: MappingOfCellDataArrays = {};

               for (let i = 1; i++; i < fileInfo.length) {
                   const datum: FileInfo = fileInfo[i];
                   if (includes(filtersToExclude, datum[PROTEIN_NAME_KEY])) {
                       fileInfoArray.push(datum);
                       proteinNameArray.push(datum[PROTEIN_NAME_KEY]);
                       measuredFeatureKeys.forEach((key) => {
                           if (!dataToReturn[key]) {
                               dataToReturn[key] = [];
                           }
                           const array = [...dataToReturn[key], measuredFeaturesByKey[key][i]];
                           dataToReturn[key] = array;
                       });
                   }
               }
               return {
                   ...dataToReturn,
                   [ARRAY_OF_FILE_INFO_KEY]: fileInfoArray,
                   [PROTEIN_NAME_KEY]: proteinNameArray,
               };
           }
       );


export const getXValues = createSelector(
           [getFilteredCellData, getPlotByOnX],
           (measuredData: MappingOfCellDataArrays, plotByOnX: string): number[] => {
               if (measuredData[plotByOnX]) {
                   return measuredData[plotByOnX] as number[];
               }
               return [];
           }
       );

export const getYValues = createSelector(
           [getFilteredCellData, getPlotByOnY],
           (measuredData: MappingOfCellDataArrays, plotByOnY: string): number[] =>
               measuredData[plotByOnY] as number[] || []
       );

export const getIds = createSelector([getFilteredCellData], (measuredData: MappingOfCellDataArrays) => {
           return measuredData[CELL_ID_KEY] || [];
       });

export const getColorsForPlot = createSelector([getColorBySelection, getProteinNames, getProteinColors, getMeasuredFeaturesDefs,  getCategoricalFeatureKeys],
    (colorBy: string, proteinNames: string[], proteinColors: string[], measuredFeaturesDefs, categoricalFeatureKeys): ColorForPlot[] => {
        if (colorBy === PROTEIN_NAME_KEY) {
            return map(proteinNames, (name: string, index) => {
                return {
                    color: proteinColors[index],
                    name,
                    label: name,
                };
            });
        } else if (includes(categoricalFeatureKeys, colorBy)) {
            const feature = find(measuredFeaturesDefs, {key: colorBy});
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
        return metaData[colorBy] || [];
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
        return fileInfo ? fileInfo[FOV_ID_KEY].toString() : "";
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


// CLUSTERING SELECTORS
// TODO: get these to work with dataset v1
export const getClusteringRange = createSelector([getClusterData, getClusteringAlgorithm],
    (clusterData: any[], clusteringAlgorithm): string[] => {
        if (clusterData[0]) {
            return keys(clusterData[0][clusteringAlgorithm]);
        }
        return [];
    }
);

export const getFilteredClusteringData = createSelector([getFilteredCellData], (fullMetaData): any[] => {
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

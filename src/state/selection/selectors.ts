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

import {
    ARRAY_OF_CELL_IDS_KEY,
    CELL_ID_KEY,
    CELL_LINE_DEF_STRUCTURE_KEY,
    CELL_LINE_NAME_KEY,
    CLUSTER_DISTANCE_KEY,
    FOV_ID_KEY,
    GENERAL_PLOT_SETTINGS,
    PROTEIN_NAME_KEY,
    THUMBNAIL_PATH,
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
    MeasuredFeatureDef,
    MeasuredFeatures,
    MetadataStateBranch,
} from "../metadata/types";
import {
    Annotation,
    ContinuousPlotData,
    NumberOrString,
    SelectedGroups,
    State,
} from "../types";
import {
    getFileInfoDatumFromCellId,
} from "../util";
import { CLUSTERING_MAP } from "./constants";

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
export const getHoveredPointData = (state: State) => state.selection.hoveredPointData;
export const getHoveredCardId = (state: State) => state.selection.hoveredCardId;
export const getSelectedAlbum = (state: State) => state.selection.selectedAlbum;
export const getGalleryCollapsed = (state: State) => state.selection.galleryCollapsed;
export const getSelectedDataset = (state: State) => state.selection.dataset;
export const getThumbnailRoot = (state: State) => state.selection.thumbnailRoot;

// COMPOSED SELECTORS

// MAIN PLOT SELECTORS
export const getFilteredCellData = createSelector(
           [getMeasuredFeaturesKeys, getFiltersToExclude, getMeasuredFeatureValues],
           (
               measuredFeatureKeys,
               filtersToExclude,
               measuredFeaturesByKey
           ): MappingOfCellDataArrays => {
               if (!filtersToExclude.length) {
                   return measuredFeaturesByKey
                 
               }
               const proteinNameArray: string[] = [];
               const dataToReturn: MappingOfCellDataArrays = {};
               const cellIds: number[] = [];
               const thumbnails: string[] = [];
               
               for (let i = 0; i < measuredFeaturesByKey.structureProteinName.length; i++ ) {
                   const proteinName: string = measuredFeaturesByKey.structureProteinName[i];
                   if (!includes(filtersToExclude, proteinName)) {
                       const cellId = measuredFeaturesByKey[ARRAY_OF_CELL_IDS_KEY][i];
                       cellIds.push(cellId);
                       proteinNameArray.push(proteinName);
                       thumbnails.push(measuredFeaturesByKey.thumbnailPaths[i]);
                       measuredFeatureKeys.forEach((featureKey) => {
                           if (!dataToReturn[featureKey]) {
                               dataToReturn[featureKey] = [];
                           }
    
                           dataToReturn[featureKey].push(measuredFeaturesByKey[featureKey][i] as never);
                       });
                   }
               }
               return {
                   ...dataToReturn,
                   [PROTEIN_NAME_KEY]: proteinNameArray,
                   [ARRAY_OF_CELL_IDS_KEY]: cellIds,
                   thumbnailPaths: thumbnails,
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
           return measuredData[ARRAY_OF_CELL_IDS_KEY] || [];
       });

export const getThumbnailPaths = createSelector(
    [getFilteredCellData],
    (measuredData: MappingOfCellDataArrays) => {
        return measuredData.thumbnailPaths || [];
    }
);

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

export const getCategoryCounts = createSelector(
    [getMeasuredFeatureValues, getColorBySelection, getMeasuredFeaturesDefs],
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

// export const getHoveredPointData = createSelector([getHoveredPointData, getFileInfo],
//     (hoveredPointId: number, fileInfo: FileInfo[]): FileInfo | undefined => {
//     return find(fileInfo, {[CELL_ID_KEY]: hoveredPointId});
// });

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
        xAxis,
        yAxis,
        currentHoveredCellId
    ): Annotation[] => {
        if (isEmpty(measuredData)) {
            return []
        }
        return clickedScatterPointIDs.map((cellID) => {
            const pointIndex = findIndex(fileInfo, (datum) => Number(datum[CELL_ID_KEY]) === Number(cellID));
            const fovID = fileInfo[pointIndex][FOV_ID_KEY];
            const cellLine = fileInfo[pointIndex][CELL_LINE_NAME_KEY];
            const data = fileInfo[pointIndex];
            const thumbnailPath = data[THUMBNAIL_PATH];
            const x = measuredData[xAxis][pointIndex];
            const y = measuredData[yAxis][pointIndex];
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
        const colorArray: string[] = [];
        const xValues: number[] = [];
        const yValues: number[] = [];
         
        mapValues(selectedGroups, (value, key) => {
            // for each point index, get x, y, and color for the point.
            value.forEach((cellId: string) => {
                // ids are converted to strings for plotly, so converting both to numbers to be sure
                const index = metaData[ARRAY_OF_CELL_IDS_KEY].indexOf(cellId);
                colorArray.push(selectedGroupColorMapping[key]);
                xValues.push(metaData[plotByOnX][index]);
                yValues.push(metaData[plotByOnY][index]);
            });
        });
    
        return {
            color: colorArray,
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

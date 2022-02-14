import { find, includes, isEmpty, keys, map, mapValues, reduce, sortBy, values } from "lodash";
import { createSelector } from "reselect";

import {
    ARRAY_OF_CELL_IDS_KEY,
    CELL_ID_KEY,
    FOV_ID_KEY,
    GROUP_BY_KEY,
} from "../../constants";
import {
    getPerCellDataForPlot,
    getMeasuredFeaturesKeys,
    getCategoricalFeatureKeys,
    getMeasuredFeaturesDefs,
} from "../metadata/selectors";
import {
    DataForPlot,
    DiscreteMeasuredFeatureDef,
    FileInfo,
    MappingOfMeasuredValuesArrays,
    MeasuredFeatureDef,
    MeasuredFeaturesOption,
    MeasuredFeaturesWithCategoryNames,
    MetadataStateBranch,
    PerCellLabels,
} from "../metadata/types";
import { ContinuousPlotData, NumberOrString, SelectedGroups, State } from "../types";
import { findFeature, getCategoryString, getFileInfoDatumFromCellId } from "../util";

import { ColorForPlot, DownloadConfig, LassoOrBoxSelectPointData } from "./types";

// BASIC SELECTORS
export const getPlotByOnX = (state: State) => state.selection.plotByOnX;
export const getPlotByOnY = (state: State) => state.selection.plotByOnY;
export const getGroupByCategory = (state: State) => state.selection.groupBy;
export const getClickedCellsFileInfo = (state: State) => state.selection.selectedPoints;
export const getSelectedGroups = (state: State) => state.selection.selectedGroups;
export const getColorBySelection = (state: State) => state.selection.colorBy;
export const getDefaultColors = (state: State) => state.selection.defaultColors;
export const getSelectionSetColors = (state: State) => state.selection.selectedGroupColors;
export const getFiltersToExclude = (state: State) => state.selection.filterExclude;
export const getSelected3DCell = (state: State) => state.selection.cellSelectedFor3D;
export const getApplyColorToSelections = (state: State) =>
    state.selection.applySelectionSetColoring;
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

export const getSelectedDatasetName = createSelector([getSelectedDataset], (selectedDataset) => {
    return selectedDataset.split("_v")[0];
});

// ===============================================================================================

// GROUP BY SELECTORS (For the checkbox panel)

export const getGroupByFeatureDef = createSelector(
    /**
     * Returns the full feature definition of the feature currently selected as the
     * "groupBy" feature. This is the feature that will dictate the checkboxes on the left
     * hand panel.
     */
    [getMeasuredFeaturesDefs, getGroupByCategory],
    (features: MeasuredFeatureDef[], categoryToGroupBy: string): DiscreteMeasuredFeatureDef => {
        const feature = findFeature(map(features), categoryToGroupBy);
        // the group by category is always going to point to a discrete feature,
        // this just ensures the downstream selectors of this know that.
        if (!feature || !feature.discrete) {
            return {} as DiscreteMeasuredFeatureDef;
        }
        return feature;
    }
);

export const getGroupByFeatureOptionsAsList = createSelector(
    /**
     * Returns the options of the currently selected "groupBy" feature as a sorted array. 
     * Each of the options will correspond to a single checkbox in the selection panel.
     */
    [getGroupByFeatureDef],
    (feature: DiscreteMeasuredFeatureDef): MeasuredFeaturesOption[] => {
        if (isEmpty(feature)) {
            return [] as MeasuredFeaturesOption[];
        }
        return sortBy(feature.options, "name");
    }
);

export const getGroupingCategoryNames = createSelector(
    /**
     * Returns the just the names of the "groupBy" feature options. 
     * Each of these names will be the label for the checkboxes.
     */
    [getGroupByFeatureOptionsAsList],
    (feature: MeasuredFeaturesOption[]): string[] => {
        return map(feature, "name");
    }
);


export const getCategoryGroupColorsAndNames = createSelector(
    /**
     * Returns array of objects that have the color mapping for each category in a colorBy
     * selection if the colorBy is a discrete feature.
     */
    [getColorBySelection, getGroupByCategory, getMeasuredFeaturesDefs, getCategoricalFeatureKeys],
    (
        categoryToColorBy: string,
        categoryToGroupBy: string,
        measuredFeaturesDefs: MeasuredFeatureDef[],
        categoricalFeatureKeys: string[]
    ): ColorForPlot[] => {
        /**
         * This data is used to both make the color legend and to tell the plot how to color
         * the data when a categorical (discrete) feature has been chosen from the "colorBy" menu
         */
        if (includes(categoricalFeatureKeys, categoryToColorBy)) {
            const feature = findFeature(measuredFeaturesDefs, categoryToColorBy);
            if (feature && feature.discrete) {
                const { options } = feature;
                return map(options, (option: MeasuredFeaturesOption, key: string) => {
                    /**
                     * "key" is the numeral value in the features data. For categorical measured features
                     * this number can represent:
                     *   1. a number representing a boolean, ie, 1, 0, and -1 (for undefined)
                     *   2. an id to be mapped to the feature option. ie, a cell line number.
                     */
                    let id;
                    if (categoryToGroupBy === categoryToColorBy) {
                        /**
                         * For group by features, we're using the string name as the checkbox identifier instead of
                         * the numeral "key". We could change this in the future to reduce the complexity here.
                         */
                        id = option.key || option.name;
                    } else {
                        id = key;
                    }
                    return {
                        color: option.color,
                        name: id,
                        label: option.name,
                    };
                });
            }
        }
        return [];
    }
);

// =============================================================================================== 

// MAIN PLOT SELECTORS
// ===================

// not truly a selector, it just seemed cleaner to make this one function instead of 3
// (2 for each axis and one for the color by)
export function getFeatureDefTooltip(key: string, options: MeasuredFeatureDef[]): string {
    const data = find(options, { key: key });
    if (data) {
        return data.tooltip;
    }
    return "";
}

export const getGroupingCategoryNamesAsArray = createSelector(
    /**
     * Returns an array the length of the data that has the string representation of the 
     * current "groupBy" category name for each cell in the data. 
     * For example, if the the perCellDataForPlot
     * has value["cell-line"] = [2, 2, 12, 12], and the groupBy = "cell-line", then this will return 
     * ["beta-actin", "beta-actin", "tom20", "tom20"] 
     */
    [getPerCellDataForPlot, getGroupByFeatureDef],
    (perCellDataForPlot, groupByCategoryFeatureDef): string[] => {
        const categoryKey = groupByCategoryFeatureDef.key;

        return map(perCellDataForPlot.values[categoryKey], (ele) => {
            return getCategoryString(groupByCategoryFeatureDef, ele);
        });
    }
);

// UNFILTERED DATA
// ===================
/**
 * These selectors get the full x, y arrays for the currently selected features.
 * These arrays are the length of the data, regardless of whether any of the data has been filtered 
 * by the checkboxes.  
 */
export const getMeasuredValues = createSelector([getPerCellDataForPlot], (plotForData) => {
    return plotForData.values || {};
});

export const getXValues = createSelector(
    [getMeasuredValues, getPlotByOnX],
    (measuredData: MappingOfMeasuredValuesArrays, plotByOnX: string): (number | null)[] => {
        if (measuredData[plotByOnX]) {
            return measuredData[plotByOnX];
        }
        return [];
    }
);

export const getYValues = createSelector(
    [getMeasuredValues, getPlotByOnY],
    (measuredData: MappingOfMeasuredValuesArrays, plotByOnY: string): (number | null)[] => {
        if (measuredData[plotByOnY]) {
            return measuredData[plotByOnY];
        }
        return [];
    }
);

export const getColorByCategoryCounts = createSelector(
    /**
     * Returns an array of numbers that correspond to the count of each
     * color by category 
     */
    [getPerCellDataForPlot, getColorBySelection, getMeasuredFeaturesDefs],
    (
        measuredData: MetadataStateBranch,
        categoryToColorBy: string,
        measuredFeatureDefs: MeasuredFeatureDef[]
    ): number[] => {
        const feature = findFeature(measuredFeatureDefs, categoryToColorBy);
        if (feature && feature.discrete) {
            const categoryValues = map(feature.options, (_, key) => Number(key));
            const totals = reduce(
                measuredData[categoryToColorBy],
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

// FILTERED DATA
// =============

export const getFilteredCellData = createSelector(
    /**
     * Takes the full data and filters it based on the selected checkboxes and 
     * augments the data with the array of "groupBy" category names per cell. 
     */
    [
        getMeasuredFeaturesKeys,
        getFiltersToExclude,
        getPerCellDataForPlot,
        getGroupByCategory,
        getGroupingCategoryNamesAsArray,
    ],
    (
        measuredFeatureKeys,
        filtersToExclude,
        perCellDataForPlot: DataForPlot,
        categoryKey: string,
        groupingNames,
    ): DataForPlot => {
        if (!filtersToExclude.length) {
            return {
                ...perCellDataForPlot,
                labels: {
                    ...perCellDataForPlot.labels,
                    [categoryKey]: groupingNames
                }
            };
        }
        const categoryNameArray: string[] = [];
        const dataToReturn: MappingOfMeasuredValuesArrays = {};
        const cellIds: string[] = [];
        const thumbnails: string[] = [];
        const indices: number[] = [];
        for (let i = 0; i < perCellDataForPlot.labels.cellIds.length; i++) {
            const categoryName: string = groupingNames[i];
            if (!includes(filtersToExclude, categoryName)) {
                const cellId = perCellDataForPlot.labels.cellIds[i];
                cellIds.push(cellId);
                categoryNameArray.push(categoryName);
                thumbnails.push(perCellDataForPlot.labels.thumbnailPaths[i]);
                indices.push(perCellDataForPlot.indices[i]);
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
            indices: indices,
            values: dataToReturn,
            labels: {
                [categoryKey]: categoryNameArray,
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

export const getFilteredXValues = createSelector(
    [getFilteredMeasuredValues, getPlotByOnX],
    (measuredData: MappingOfMeasuredValuesArrays, plotByOnX: string): (number | null)[] => {
        if (measuredData[plotByOnX]) {
            return measuredData[plotByOnX];
        }
        return [];
    }
);

export const getFilteredYValues = createSelector(
    [getFilteredMeasuredValues, getPlotByOnY],
    (measuredData: MappingOfMeasuredValuesArrays, plotByOnY: string): (number | null)[] =>
        measuredData[plotByOnY] || []
);

export const getFilteredIds = createSelector(
    [getFilteredPerCellLabels],
    (cellLabels: PerCellLabels): string[] => {
        return cellLabels[ARRAY_OF_CELL_IDS_KEY] || [];
    }
);

export const getFilteredColorByValues = createSelector(
    [getFilteredCellData, getColorBySelection, getGroupByCategory],
    (
        metaData: DataForPlot,
        categoryToColorBy: string,
        categoryToGroupBy: string
    ): string[] | number[] => {
        if (!metaData.labels) {
            return [];
        }
        const options: MeasuredFeaturesWithCategoryNames = {
            ...metaData.values,
            [categoryToGroupBy]: metaData.labels[categoryToGroupBy],
        };
        return options[categoryToColorBy] || [];
    }
);

export const getClickedScatterPoints = createSelector(
    [getClickedCellsFileInfo],
    (cells: FileInfo[]) => map(cells, CELL_ID_KEY)
);

// =============================================================================================== 

// 3D VIEWER SELECTORS
export const getSelected3DCellFileInfo = createSelector(
    [getSelected3DCell, getClickedCellsFileInfo, getGroupingCategoryNamesAsArray, getPerCellDataForPlot],
    (selected3DCellId: string, fileInfoArray: FileInfo[], arrayOfCategoryNames, plotData): FileInfo => {
        const fileInfo = getFileInfoDatumFromCellId(fileInfoArray, selected3DCellId) || ({} as FileInfo);
        let index = -1;
        if (isEmpty(fileInfo)) {
            return fileInfo;
        }
        if (fileInfo.index !== undefined) {
            index = fileInfo.index;
        } else {
            // only won't be present if this cell was selected via the url
            index = plotData.labels.cellIds.indexOf(selected3DCellId);
        }
        return {
            ...fileInfo,
            [GROUP_BY_KEY]: arrayOfCategoryNames[index]
        }
    }
);

export const getSelected3DCellFOV = createSelector(
    [getSelected3DCellFileInfo],
    (fileInfo: FileInfo): string => {
        return !isEmpty(fileInfo) ? fileInfo[FOV_ID_KEY].toString() : "";
    }
);

// =============================================================================================== 

// LASSOED or BOX SELECTED GROUPS SELECTORS
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

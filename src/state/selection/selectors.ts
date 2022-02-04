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
    FileInfo,
    MappingOfMeasuredValuesArrays,
    MeasuredFeatureDef,
    MeasuredFeaturesOption,
    MeasuredFeaturesWithCategoryNames,
    MetadataStateBranch,
    PerCellLabels,
} from "../metadata/types";
import { ContinuousPlotData, NumberOrString, SelectedGroups, State } from "../types";
import { getFileInfoDatumFromCellId } from "../util";

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

// COMPOSED SELECTORS
export const getSelectedDatasetName = createSelector([getSelectedDataset], (selectedDataset) => {
    return selectedDataset.split("_v")[0];
});

export const getGroupByFeatureDef = createSelector(
    [getMeasuredFeaturesDefs, getGroupByCategory],
    (features: MeasuredFeatureDef[], category):MeasuredFeatureDef => {
        const feature = find(map(features), { key: category });
        if (!feature) {
            return {} as MeasuredFeatureDef;
        }
        return feature;
    }
);

export const getGroupByFeatureOptionsAsList = createSelector(
    [getGroupByFeatureDef],
    (feature: MeasuredFeatureDef): MeasuredFeaturesOption[] => {
        if (isEmpty(feature)) {
            return [] as MeasuredFeaturesOption[];
        }
        return sortBy(feature.options, "name");
    }
);

export const getGroupingCategoryNames = createSelector(
    [getGroupByFeatureOptionsAsList],
    (feature: MeasuredFeaturesOption[]): string[] => {
        return map(feature, "name");
    }
);
// MAIN PLOT SELECTORS

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
    [getPerCellDataForPlot, getGroupByFeatureDef],
    (perCellDataForPlot, groupByCategoryFeatureDef): string[] => {
        const categoryKey = groupByCategoryFeatureDef.key;

        return map(perCellDataForPlot.values[categoryKey], (ele) => {
            const categoryInfo = groupByCategoryFeatureDef.options[ele];
            return categoryInfo.key || categoryInfo.name;

        });
    }
);

export const getFilteredCellData = createSelector(
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
    [getFilteredCellData, getColorBySelection, getGroupByCategory],
    (metaData: DataForPlot, colorBy: string, groupBy: string): string[] | number[] => {
        if (!metaData.labels) {
            return [];
        }
        const options: MeasuredFeaturesWithCategoryNames = {
            ...metaData.values,
            [groupBy]: metaData.labels[groupBy],
        };
        return options[colorBy] || [];
    }
);

export const getColorsForPlot = createSelector(
    [getColorBySelection, getGroupByCategory, getMeasuredFeaturesDefs, getCategoricalFeatureKeys],
    (
        colorBy: string,
        groupBy: string,
        measuredFeaturesDefs,
        categoricalFeatureKeys: string[]
    ): ColorForPlot[] => {
        if (includes(categoricalFeatureKeys, colorBy)) {
            const feature = find(measuredFeaturesDefs, { key: colorBy });
            if (feature) {
                const { options } = feature;
                return map(options, (value, key) => {
                    // for the groupby feature we're using the string name as the key instead 
                    // of a numeral value. We might want to change this to remove complexity. 
                    let name;
                    if (groupBy === colorBy) {
                        name = value.key || value.name;
                    } else {
                        name = key;
                    }
                    return {
                        color: value.color,
                        name: name,
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

export const getClickedScatterPoints = createSelector(
    [getClickedCellsFileInfo],
    (cells: FileInfo[]) => map(cells, CELL_ID_KEY)
);

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

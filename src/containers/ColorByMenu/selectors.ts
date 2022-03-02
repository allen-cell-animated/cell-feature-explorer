import { chunk, includes, map, reduce, values } from "lodash";
import { createSelector } from "reselect";

import {
    DISABLE_COLOR,
    DOWNLOAD_CONFIG_TYPE_PROTEIN,
    DOWNLOAD_CONFIG_TYPE_SELECTION_SET,
    OFF_COLOR,
} from "../../constants/index";
import { getLabelsPerCell } from "../../state/metadata/selectors";
import {
    MappingOfMeasuredValuesArrays,
    MeasuredFeatureDef,
    MeasuredFeaturesOption,
} from "../../state/metadata/types";
import {
    getApplyColorToSelections,
    getColorBySelection,
    getDownloadConfig,
    getDownloadRoot,
    getFiltersToExclude,
    getSelectedGroupKeys,
    getSelectedGroups,
    getSelectedSetTotals,
    getSelectionSetColors,
    getGroupingCategoryNames,
    getGroupByFeatureOptionsAsList,
    getGroupByCategory,
    getCategoryGroupColorsAndNames,
    getGroupByFeatureDef,
    getGroupingCategoryNamesAsArray,
    getYValues,
    getXValues,
} from "../../state/selection/selectors";
import { ColorForPlot, LassoOrBoxSelectPointData } from "../../state/selection/types";
import { convertSingleImageIdToDownloadId } from "../../state/util";

import { PanelData } from "./types";

export const getDisplayableGroups = createSelector(
    [getXValues, getYValues, getGroupingCategoryNamesAsArray],
    (xValues, yValues, categoryNames): string[] => {
        // Could memoize this if performance becomes an issue
        const displayable = new Set<string>();
        for (let i = 0; i < xValues.length; i++) {
            if (xValues[i] !== null && yValues[i] !== null) {
                displayable.add(categoryNames[i]);
            }
        }
        return [...displayable];
    }
);

export const getGroupByTitle = createSelector(
    [getGroupByFeatureDef],
    (groupByFeatureDef: MeasuredFeatureDef): string => {
        return groupByFeatureDef.displayName;
    }
);

export const getCheckAllCheckboxIsIntermediate = createSelector(
    [getFiltersToExclude, getGroupingCategoryNames],
    (filtersToExclude, categoryNames: string[]): boolean => {
        return filtersToExclude.length > 0 && filtersToExclude.length !== categoryNames.length;
    }
);

export const disambiguateCategoryNames = (options: MeasuredFeaturesOption[]): string[] => {
    const categoryNames: string[] = map(options, (option) => option.name);
    const keys: string[] = map(options, (option) => option.key || "");

    const repeatedNames: string[] = categoryNames.filter((name, i) => {
        return categoryNames.indexOf(name) !== i;
    });
    const disambiguatedNames: string[] = categoryNames.map((name, i) => {
        if (repeatedNames.includes(name)) {
            return `${name} (${keys[i]})`;
        }
        return name;
    });

    return disambiguatedNames;
};

export const getLegendColors = createSelector(
    [getCategoryGroupColorsAndNames, getGroupByCategory, getColorBySelection],
    (colorsAndNames, categoryToGroupBy, categoryToColorBy): ColorForPlot[] => {
        // if color by and group by are the same, the legend
        // is redundant
        if (categoryToColorBy === categoryToGroupBy) {
            return [];
        }
        return colorsAndNames;
    }
);

const getColorForCategory = (
    showGroupByColors: boolean,
    isExcluded: boolean,
    isDisabled: boolean,
    categoryColor: string
) => {
    if (isDisabled) {
        return DISABLE_COLOR;
    } else if (isExcluded) {
        return OFF_COLOR;
    } else if (showGroupByColors) {
        return categoryColor;
    } else {
        return DISABLE_COLOR;
    }
};

export const getInteractivePanelData = createSelector(
    [
        getGroupByCategory,
        getColorBySelection,
        getGroupByFeatureOptionsAsList,
        getFiltersToExclude,
        getDisplayableGroups,
    ],
    (
        categoryToGroupBy: keyof MappingOfMeasuredValuesArrays,
        categoryToColorBy: keyof MappingOfMeasuredValuesArrays,
        categories: MeasuredFeaturesOption[],
        filtersToExclude: string[],
        displayableGroups: string[]
    ): PanelData[] => {
        const names = disambiguateCategoryNames(categories);
        return map(categories, (category: MeasuredFeaturesOption, index: number) => {
            const name: string = category.name;
            const key: string = category.key || "";
            const id = key || name;
            const total: number = category.count || 0;
            const disabled = !displayableGroups.includes(id);
            const color = getColorForCategory(
                categoryToColorBy === categoryToGroupBy,
                includes(filtersToExclude, id),
                disabled,
                category.color
            );
            return {
                checked: !includes(filtersToExclude, id),
                color: color,
                id: id,
                name: names[index],
                disabled: disabled,
                total,
            };
        });
    }
);

export const getSelectionPanelData = createSelector(
    [getApplyColorToSelections, getSelectionSetColors, getSelectedGroupKeys, getSelectedSetTotals],
    (
        applyColorToSelections,
        selectedSetColors,
        selectedSetNames,
        selectedSetTotals
    ): PanelData[] => {
        return map(selectedSetNames, (name, index) => {
            const color = applyColorToSelections ? values(selectedSetColors)[index] : DISABLE_COLOR;
            const displayName = Number(name) ? index : name;
            return {
                color,
                id: name.toString(),
                name: displayName.toString(),
                total: selectedSetTotals[index],
            };
        });
    }
);

export const getListOfCellIdsByDownloadConfig = createSelector(
    [getLabelsPerCell, getGroupingCategoryNamesAsArray, getDownloadConfig, getSelectedGroups],
    (labelsPerCell, namePerCell: string[], downloadConfig, selectedGroups): string[] => {
        const returnArray: string[] = [];
        if (downloadConfig.type === DOWNLOAD_CONFIG_TYPE_PROTEIN) {
            return reduce(
                namePerCell,
                (acc, categoryName: string, index) => {
                    if (categoryName === downloadConfig.key) {
                        acc.push(convertSingleImageIdToDownloadId(labelsPerCell.cellIds[index]));
                    }
                    return acc;
                },
                returnArray
            );
        } else if (downloadConfig.type === DOWNLOAD_CONFIG_TYPE_SELECTION_SET) {
            const selectedCells = selectedGroups[downloadConfig.key];
            return selectedCells.map((point: LassoOrBoxSelectPointData) =>
                convertSingleImageIdToDownloadId(point.cellId)
            );
        }
        return returnArray;
    }
);

export const createUrlFromListOfIds = createSelector(
    [getDownloadRoot, getListOfCellIdsByDownloadConfig],
    (downloadRoot: string, cellIdsToDownload): string[] => {
        const chunkSize = 300;
        const chunksOfIds = chunk(cellIdsToDownload, chunkSize);
        return map(
            chunksOfIds,
            (listOfIds) => `${downloadRoot}${map(listOfIds, (cellId) => `&id=${cellId}`).join("")}`
        );
    }
);

import { chunk, includes, map, reduce, values } from "lodash";
import { createSelector } from "reselect";

import {
    DEFAULT_GROUP_BY,
    DISABLE_COLOR,
    DOWNLOAD_CONFIG_TYPE_PROTEIN,
    DOWNLOAD_CONFIG_TYPE_SELECTION_SET,
    OFF_COLOR,
} from "../../constants/index";
import { getLabelsPerCell } from "../../state/metadata/selectors";
import { MeasuredFeaturesOption } from "../../state/metadata/types";
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
    getDisplayableGroups,
    getSelectedDatasetName,
    getGroupingCategoryNames,
    getGroupByFeatureInfo,
    getGroupByCategory,
    getColorsForPlot,
} from "../../state/selection/selectors";
import { LassoOrBoxSelectPointData } from "../../state/selection/types";
import { convertSingleImageIdToDownloadId } from "../../state/util";

import { PanelData } from "./types";

export const getGroupByTitle = createSelector(
    [getSelectedDatasetName],
    (selectedDatasetName: string): string => {
        return DEFAULT_GROUP_BY[selectedDatasetName] || "labeled structure";
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

export const getColorByLegend = createSelector(
    [getColorsForPlot, getGroupByCategory, getColorBySelection],
    (colors, groupBy, colorBy) => {
        // if color by and group by are the same, the legend 
        // is redundant 
        if (colorBy === groupBy) {
            return [];
        }
        return colors;
    }
);

export const getInteractivePanelData = createSelector(
    [
        getGroupByCategory,
        getColorBySelection,
        getGroupByFeatureInfo,
        getFiltersToExclude,
        getDisplayableGroups,
    ],
    (
        groupBy: string[],
        colorBy: string[],
        categories: MeasuredFeaturesOption[],
        filtersToExclude: string[],
        displayableGroups: string[]
    ): PanelData[] => {
        const getColorForCategory = (
            showGroupByColors: boolean,
            isExcluded: boolean,
            isDisabled: boolean,
            categoryColor: string
        ) => {
            if (isDisabled) {
                return DISABLE_COLOR;
            }
            if (showGroupByColors) {
                return isExcluded ? OFF_COLOR : categoryColor;
            } else {
                return isExcluded ? OFF_COLOR : DISABLE_COLOR;
            }
        };
        const names = disambiguateCategoryNames(categories);
        return map(categories, (category: MeasuredFeaturesOption, index: number) => {
            const name: string = category.name;
            const key: string = category.key || "";
            const id = key || name;
            const total: number = category.count || 0;
            const disabled = !displayableGroups.includes(id);
            const color = getColorForCategory(
                colorBy === groupBy,
                includes(filtersToExclude, id),
                disabled,
                category.color
            );
            return {
                checked: !includes(filtersToExclude, id),
                color: color,
                id: id,
                name: names[index],
                gene: key,
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
    [getLabelsPerCell, getDownloadConfig, getSelectedGroups],
    (labelsPerCell, downloadConfig, selectedGroups): string[] => {
        const returnArray: string[] = [];
        if (downloadConfig.type === DOWNLOAD_CONFIG_TYPE_PROTEIN) {
            return reduce(
                labelsPerCell.groupBy,
                (acc, proteinName: string, index) => {
                    if (proteinName === downloadConfig.key) {
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

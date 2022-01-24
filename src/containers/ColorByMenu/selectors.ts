import {
    chunk,
    includes,
    map,
    reduce,
    values,
} from "lodash";
import { createSelector } from "reselect";

import {
    DEFAULT_GROUP_BY,
    DISABLE_COLOR,
    DOWNLOAD_CONFIG_TYPE_PROTEIN,
    DOWNLOAD_CONFIG_TYPE_SELECTION_SET,
    OFF_COLOR,
    GROUP_BY_KEY,
} from "../../constants/index";
import {
    getLabelsPerCell,
} from "../../state/metadata/selectors";
import { MeasuredFeaturesOption, MeasuredFeaturesOptions } from "../../state/metadata/types";
import {
    getApplyColorToSelections,
    getColorBySelection,
    getDownloadConfig,
    getDownloadRoot,
    getFiltersToExclude,
    getProteinColors,
    getSelectedGroupKeys,
    getSelectedGroups,
    getSelectedSetTotals,
    getSelectionSetColors,
    getDisplayableGroups,
    getSelectedDatasetName,
    getGroupingCategoryNames,
    getGroupByFeatureInfo,
} from "../../state/selection/selectors";
import { LassoOrBoxSelectPointData } from "../../state/selection/types";
import { NumberOrString } from "../../state/types";
import { convertSingleImageIdToDownloadId } from "../../state/util";

import { PanelData } from "./types";

export const getGroupByTitle = createSelector([getSelectedDatasetName], (selectedDatasetName: string): string => {
    return DEFAULT_GROUP_BY[selectedDatasetName] || "labeled structure";
})

export const getCheckAllCheckboxIsIntermediate = createSelector(
    [getFiltersToExclude, getGroupingCategoryNames] ,
    (filtersToExclude, categoryNames: string[]): boolean => {
        return filtersToExclude.length > 0 && filtersToExclude.length !== categoryNames.length;
} );

const getColors = createSelector(
    [getColorBySelection, getProteinColors, getGroupingCategoryNames, getFiltersToExclude],
    (colorBy, proteinColors, categoryNames: string[], filtersToExclude) => {
        return colorBy === GROUP_BY_KEY ?
            categoryNames
                .map((ele: NumberOrString, index: number) =>
                    includes(filtersToExclude, ele) ? OFF_COLOR : proteinColors[index]) :
            categoryNames
                .map((ele: NumberOrString) =>
                    includes(filtersToExclude, ele) ? OFF_COLOR : DISABLE_COLOR);
    });

export const disambiguateCategoryNames = (options: MeasuredFeaturesOptions): string[] => {
    const categoryNames: string[] = map(options, option => option.name);
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

export const getInteractivePanelData = createSelector(
    [getGroupByFeatureInfo, getFiltersToExclude, getColors, getDisplayableGroups],
    (categories: MeasuredFeaturesOption[], filtersToExclude, proteinColors: string[], displayableGroups): PanelData[] => {
        // const names = disambiguateCategoryNames(categories);
        return map(categories, (category: MeasuredFeaturesOption, index: number) => {
            const name: string = category.name;
            const key: string = category.key || "";
            const total: number = category.count || 0;
            const disabled = !displayableGroups.includes(name);
            const color = disabled ? DISABLE_COLOR : (category.color || proteinColors[index]);
            return {
                checked: !includes(filtersToExclude, name),
                color: color,
                id: key || name,
                name: name,
                gene: key,
                disabled: disabled,
                total,
            };
        });
    });

export const getSelectionPanelData = createSelector(
    [getApplyColorToSelections, getSelectionSetColors, getSelectedGroupKeys, getSelectedSetTotals],
    (applyColorToSelections, selectedSetColors, selectedSetNames, selectedSetTotals): PanelData[] => {
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
    });

export const getListOfCellIdsByDownloadConfig = createSelector(
    [
        getLabelsPerCell,
        getDownloadConfig,
        getSelectedGroups,
    ],
    (
        labelsPerCell,
        downloadConfig,
        selectedGroups
    ): string[] => {
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
});

export const createUrlFromListOfIds = createSelector(
    [getDownloadRoot, getListOfCellIdsByDownloadConfig],
    (downloadRoot: string, cellIdsToDownload): string[] => {
    const chunkSize = 300;
    const chunksOfIds = chunk(cellIdsToDownload, chunkSize);
    return map(
        chunksOfIds,
        (listOfIds) => `${downloadRoot}${map(listOfIds, (cellId) => `&id=${cellId}`).join("")}`
    );
});

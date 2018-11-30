import {
    includes,
    map,
    reduce,
    values,
} from "lodash";
import { createSelector } from "reselect";

import {
    DISABLE_COLOR,
    OFF_COLOR,
    PROTEIN_NAME_KEY,
} from "../../constants/index";
import {
    getFileInfo,
    getProteinNames,
    getProteinTotals,
} from "../../state/metadata/selectors";
import {
    getApplyColorToSelections,
    getColorBySelection,
    getFiltersToExclude,
    getProteinColors,
    getSelectedGroupKeys,
    getSelectedSetTotals,
    getSelectionSetColors,
} from "../../state/selection/selectors";
import { NumberOrString } from "../../state/types";

import { PanelData } from "./types";

export const getCheckAllCheckboxIsIntermediate = createSelector(
    [getFiltersToExclude, getProteinNames] ,
    (filtersToExclude, allProteinNames): boolean => {
        return filtersToExclude.length > 0 && filtersToExclude.length !== allProteinNames.length;
} );

const getColors = createSelector(
    [getColorBySelection, getProteinColors, getProteinNames, getFiltersToExclude],
    (colorBy, proteinColors, proteinNames, filtersToExclude) => {
        return colorBy === PROTEIN_NAME_KEY ?
            proteinNames
                .map((ele: NumberOrString, index: number) =>
                    includes(filtersToExclude, ele) ? OFF_COLOR : proteinColors[index]) :
            proteinNames
                .map((ele: NumberOrString, index: number) =>
                    includes(filtersToExclude, ele) ? OFF_COLOR : DISABLE_COLOR);
    });

export const getInteractivePanelData = createSelector(
    [getProteinNames, getFiltersToExclude, getProteinTotals, getColors],
    (proteinNames, filtersToExclude, proteinTotals, proteinColors): PanelData[] => {
        return map(proteinTotals, (total, index) => {
            return {
                checked: !includes(filtersToExclude, proteinNames[index]),
                color: proteinColors[index],
                id: proteinNames[index],
                name: proteinNames[index],
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

export const getCellIdsByProteinName = createSelector([getProteinNames, getFileInfo], (proteinNames, fileInfo) => {
    return reduce(fileInfo, (acc, cur) => {
        acc[cur[PROTEIN_NAME_KEY]].push(`${cur.CellLineName}_${cur.FOVId}_${cur.CellId}`);
        return acc;
    }, reduce(proteinNames, (acc, cur) => { acc[cur] = []; return acc; }, {} ));
});

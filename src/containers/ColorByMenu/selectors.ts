import { includes, map, values } from "lodash";
import { createSelector } from "reselect";

import { DISABLE_COLOR, OFF_COLOR, PROTEIN_NAME_KEY } from "../../constants/index";
import { getProteinNames, getProteinTotals } from "../../state/metadata/selectors";
import {
    getApplyColorToSelections,
    getColorBySelection,
    getFiltersToExclude,
    getProteinColors, getSelectedGroupKeys, getSelectedSetTotals, getSelectionSetColors,
} from "../../state/selection/selectors";
import { NumberOrString } from "../../state/types";

export const getIntermediate = createSelector(
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
    (proteinNames, filtersToExclude, proteinTotals, proteinColors) => {
        return map(proteinTotals, (total, index) => {
            return {
                checked: !includes(filtersToExclude, proteinNames[index]),
                color: proteinColors[index],
                id: name,
                name: proteinNames[index],
                total,
            };
        });
    }
    );

export const getSelectionPanelData = createSelector(
    [getApplyColorToSelections, getSelectionSetColors, getSelectedGroupKeys, getSelectedSetTotals],
    (applyColorToSelections, selectedSetColors, selectedSetNames, selectedSetTotals) => {
        return map(selectedSetNames, (name: NumberOrString, index) => {
            return {
                color: applyColorToSelections ?
                    values(selectedSetColors)[index] : DISABLE_COLOR,
                id: name,
                name: Number(name) ? index : name,
                total: selectedSetTotals[index],
            };
        });
    }
    );

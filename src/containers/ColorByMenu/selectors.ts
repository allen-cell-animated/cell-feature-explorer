import {
    chunk,
    includes,
    map,
    reduce,
    values,
} from "lodash";
import { createSelector } from "reselect";

import {
    CELL_COUNT_KEY,
    CELL_LINE_DEF_GENE_KEY,
    DISABLE_COLOR,
    DOWNLOAD_CONFIG_TYPE_PROTEIN,
    DOWNLOAD_CONFIG_TYPE_SELECTION_SET,
    OFF_COLOR,
    PROTEIN_NAME_KEY,
} from "../../constants/index";
import {
    getLabelsPerCell,
    getProteinNames,
    getSortedCellLineDefs,
} from "../../state/metadata/selectors";
import { CellLineDef } from "../../state/metadata/types";
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
} from "../../state/selection/selectors";
import { LassoOrBoxSelectPointData } from "../../state/selection/types";
import { NumberOrString } from "../../state/types";
import { convertSingleImageIdToDownloadId } from "../../state/util";

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
                .map((ele: NumberOrString) =>
                    includes(filtersToExclude, ele) ? OFF_COLOR : DISABLE_COLOR);
    });

export const disambiguateStructureNames = (cellLines: CellLineDef[]): string[] => {
    const proteinNames: string[] = cellLines.map(cellLine => cellLine.structureProteinName);
    const structureNames: string[] = cellLines.map(cellLine => cellLine.StructureId_Name);
    
    const repeatedNames: string[] = structureNames.filter((name, i) => {
        return structureNames.indexOf(name) !== i;
    });
    const disambiguatedNames: string[] = structureNames.map((name, i) => {
        if (repeatedNames.includes(name)) {
            return `${name} (${proteinNames[i]})`;
        }
        return name;
    });

    return disambiguatedNames;
};

export const getInteractivePanelData = createSelector(
    [getSortedCellLineDefs, getFiltersToExclude, getColors, getDisplayableGroups],
    (cellLines, filtersToExclude, proteinColors: string[], displayableGroups): PanelData[] => {
        const structureNames = disambiguateStructureNames(cellLines);
        return map(cellLines, (cellLine: CellLineDef, index: number) => {
            const proteinName: string = cellLine[PROTEIN_NAME_KEY];
            const geneName: string = cellLine[CELL_LINE_DEF_GENE_KEY];
            const structureName: string = structureNames[index];
            const total: number = cellLine[CELL_COUNT_KEY] || 0;
            const disabled = !displayableGroups.includes(proteinName);
            const color = disabled ? "#6e6e6e" : proteinColors[index];
            return {
                checked: !includes(filtersToExclude, proteinName),
                color: color,
                id: proteinName,
                name: structureName,
                gene: geneName,
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
                labelsPerCell.structureProteinName,
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

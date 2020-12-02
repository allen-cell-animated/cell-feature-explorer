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
    CELL_ID_KEY,
    DISABLE_COLOR,
    DOWNLOAD_CONFIG_TYPE_PROTEIN,
    DOWNLOAD_CONFIG_TYPE_SELECTION_SET,
    DOWNLOAD_URL_PREFIX,
    OFF_COLOR,
    PROTEIN_NAME_KEY,
} from "../../constants/index";
import {
    getFileInfo,
    getProteinNames,
    getSortedCellLineDefs,
} from "../../state/metadata/selectors";
import { CellLineDef, FileInfo } from "../../state/metadata/types";
import {
    getApplyColorToSelections,
    getColorBySelection,
    getDownloadConfig,
    getFiltersToExclude,
    getProteinColors,
    getSelectedGroupKeys,
    getSelectedGroups,
    getSelectedSetTotals,
    getSelectionSetColors,
} from "../../state/selection/selectors";
import { NumberOrString } from "../../state/types";
import { convertFileInfoToAICSId } from "../../state/util";

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

export const getInteractivePanelData = createSelector(
    [getSortedCellLineDefs, getFiltersToExclude, getColors],
    (cellLines, filtersToExclude, proteinColors: string[]): PanelData[] => {
        return map(cellLines, (cellLine: CellLineDef, index: number) => {
            const proteinName: string = cellLine[PROTEIN_NAME_KEY];
            const total: number = cellLine[CELL_COUNT_KEY];
            return {
                checked: !includes(filtersToExclude, proteinName),
                color: proteinColors[index],
                id: proteinName,
                name: proteinName,
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
        getProteinNames,
        getFileInfo,
        getDownloadConfig,
        getSelectedGroups,
    ],
    (
        proteinNames,
        fileInfo,
        downloadConfig,
        selectedGroups
    ): string[] => {
        const returnArray: string[] = [];
        if (downloadConfig.type === DOWNLOAD_CONFIG_TYPE_PROTEIN) {
            return reduce(fileInfo, (acc, cur: FileInfo) => {
                if (cur[PROTEIN_NAME_KEY] === downloadConfig.key) {
                    acc.push(convertFileInfoToAICSId(cur));
                }
                return acc;
            }, returnArray);
        } else if (downloadConfig.type === DOWNLOAD_CONFIG_TYPE_SELECTION_SET) {
            const selectedCellIds: number[] = map(selectedGroups[downloadConfig.key], Number);
            return reduce(fileInfo, (acc, cur: FileInfo) => {
                if (includes(selectedCellIds, cur[CELL_ID_KEY])) {
                    acc.push(convertFileInfoToAICSId(cur));
                }
                return acc;
            }, returnArray);
        }
        return returnArray;
});

export const createUrlFromListOfIds = createSelector(
    [getListOfCellIdsByDownloadConfig],
    (cellIdsToDownload): string[] => {
    const chunkSize = 300;
    const chunksOfIds = chunk(cellIdsToDownload, chunkSize);
    return map(chunksOfIds,
        (listOfIds) => (`${DOWNLOAD_URL_PREFIX}${map(listOfIds, (cellId) => `&id=${cellId}`).join("")}`)
    );
});

import {
    find,
    includes,
    keys,
    map,
    mapValues,
} from "lodash";
import { createSelector } from "reselect";

import {
    CELL_ID_KEY,
    CELL_LINE_NAME_KEY,
    FOV_ID_KEY,
    GENERAL_PLOT_SETTINGS,
    PROTEIN_NAME_KEY,
} from "../../constants";

import {
    getFileInfo,
    getFullMetaDataArray,
    getMeasuredData,
    getProteinLabels,
    getProteinNames,
} from "../metadata/selectors";
import {
    FileInfo,
    MeasuredFeatures,
    MetadataStateBranch,
} from "../metadata/types";
import {
    Annotation,
    NumberOrString,
    State,
    Thumbnail,
} from "../types";

import {
    SelectedGroupData,
    SelectedGroups,
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

// COMPOSED SELECTORS
export const getSelected3DCellFOV = createSelector([getSelected3DCell, getFileInfo],
    (selected3DCellId: string, fileInfoArray: FileInfo[]) => {
        const fileInfo = find(fileInfoArray, {[CELL_ID_KEY]: selected3DCellId});
        return fileInfo ? fileInfo[FOV_ID_KEY] : "";
    }
);

export const getSelected3DCellCellLine = createSelector([getSelected3DCell, getFileInfo],
    (selected3DCellId: string, fileInfoArray: FileInfo[]) => {
        const fileInfo = find(fileInfoArray, {[CELL_ID_KEY]: selected3DCellId});
        return fileInfo ? fileInfo[CELL_LINE_NAME_KEY] : "";
    }
);

export const getXValues = createSelector([getMeasuredData, getPlotByOnX],
    (measuredData: MeasuredFeatures[], plotByOnX: string): number[] => (
         map(measuredData, (metaDatum: MeasuredFeatures) => (metaDatum[plotByOnX]))
    )
);

export const getYValues = createSelector([getMeasuredData, getPlotByOnY],
    (measuredData: MeasuredFeatures[], plotByOnY: string): number[] => (
        measuredData.map((metaDatum: MeasuredFeatures) => (metaDatum[plotByOnY]))
    )
);

export const getSelectedGroupsData = createSelector(
    [
        getFullMetaDataArray,
        getSelectedGroups,
        getPlotByOnX,
        getPlotByOnY,
        getColorBySelection,
        getSelectionSetColors,
    ],
    (
        allData,
        selectedGroups,
        plotByOnX,
        plotByOnY,
        colorBy,
        selectedGroupColorMapping

    ): SelectedGroupData | {} => {
        return mapValues(selectedGroups, (value, key) => {
            return map(value, (pointIndex) => {
                const measuredFeatures = allData[pointIndex].measured_features;
                const fileInfo = allData[pointIndex].file_info;
                return {
                    colorBy: measuredFeatures[colorBy] || fileInfo[colorBy],
                    groupColor: selectedGroupColorMapping[key],
                    x: measuredFeatures[plotByOnX],
                    y: measuredFeatures[plotByOnY],
                };
            });
        });
    }
);

export const getPossibleColorByData = createSelector([getFullMetaDataArray], (metaData) => (
    map(metaData, (ele) => (
            {
                ...ele.measured_features,
                [PROTEIN_NAME_KEY]: ele.file_info[PROTEIN_NAME_KEY],
            }
        )
    ))
);

export const getOpacity = createSelector(
    [
        getColorBySelection,
        getFiltersToExclude,
        getProteinNames,
        getProteinLabels,
    ],
    (colorBySelection, filtersToExclude, proteinNameArray, proteinLabels) => {
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

export const getColorByValues = createSelector([getPossibleColorByData, getColorBySelection],
    (metaData: MetadataStateBranch[], colorBy: string): (number[] | string[]) => (
        map(metaData, colorBy)
    )
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

export const getThumbnails = createSelector([
        getFileInfo,
        getClickedScatterPoints,
    ],
    (fileInfo: FileInfo[], clickedScatterPointIndices: number[]): Thumbnail[] => {
        return clickedScatterPointIndices.map((pointIndex) => {
            const cellID = fileInfo[pointIndex][CELL_ID_KEY];
            const cellLineId = fileInfo[pointIndex][CELL_LINE_NAME_KEY];
            const fovId = fileInfo[pointIndex][FOV_ID_KEY];
            const src = `/${cellLineId}/${cellLineId}_${fovId}_${cellID}.png`;
            return {
                cellID,
                pointIndex,
                src,
            };
        });
    }
);

export const getAnnotations = createSelector(
    [
        getMeasuredData,
        getFileInfo,
        getClickedScatterPoints,
        getPlotByOnX,
        getPlotByOnY,
    ],
     (
         measuredData: MeasuredFeatures[],
         fileInfo: FileInfo[],
         clickedScatterPointIndices: number[],
         xaxis,
         yaxis
     ): Annotation[] => {
        return clickedScatterPointIndices.map((pointIndex) => {
            const cellID = fileInfo[pointIndex][CELL_ID_KEY];
            const fovID = fileInfo[pointIndex][FOV_ID_KEY];
            const cellLine = fileInfo[pointIndex][CELL_LINE_NAME_KEY];
            const x = measuredData[pointIndex][xaxis];
            const y = measuredData[pointIndex][yaxis];
            return {
                cellID,
                cellLine,
                fovID,
                pointIndex,
                x,
                y,
            };
        });
    }
);

import {
    filter,
    find,
    includes,
    keys,
    map,
    values,
} from "lodash";
import { createSelector } from "reselect";

import {
    CELL_ID_KEY,
    CELL_LINE_NAME_KEY,
    FOV_ID_KEY,
    PROTEIN_NAME_KEY,
} from "../../constants";

import {
    getFileInfo,
    getFullMetaDataArray,
    getMeasuredData,
} from "../metadata/selectors";
import {
    FileInfo,
    MeasuredFeatures,
    MetaData,
    MetadataStateBranch,
} from "../metadata/types";
import {
    Annotation,
    NumberOrString,
    State,
    Thumbnail,
} from "../types";

import { SelectedGroups } from "./types";

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

export const getFilteredData = createSelector([getFullMetaDataArray, getFiltersToExclude],
    (allData, filters): MetaData[] => {
    return filter(allData, (datum) => !includes(filters,  datum.file_info[PROTEIN_NAME_KEY]));
});

export const getFilteredXValues = createSelector([getFilteredData, getPlotByOnX],
    (filteredData, plotByOnX): number[] => (
        map(filteredData, (metaDatum: MetaData) => (metaDatum.measured_features[plotByOnX]))
    )
);

export const getFilteredYValues = createSelector([getFilteredData, getPlotByOnY],
    (filteredData, plotByOnY): number[] => (
        map(filteredData, (metaDatum: MetaData) => (metaDatum.measured_features[plotByOnY]))
    )
);

export const getPossibleColorByData = createSelector([getFilteredData], (metaData) => (
    map(metaData, (ele) => (
            {
            ...ele.measured_features,
            [PROTEIN_NAME_KEY]: ele.file_info[PROTEIN_NAME_KEY],
            }
        )
    ))
);

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

export const getSelectedGroupsValues = createSelector([getXValues, getYValues, getSelectedGroups],
    (xvalues: number[], yvalues: number[], selectedGroups: SelectedGroups): SelectedGroups[] => {
        if (!values(selectedGroups)) {
            return [];
        }
        return values(selectedGroups).map(
            ((selectedGroupsArray) => {
                if (!selectedGroupsArray) {
                    return {};
                }
                return selectedGroupsArray.map((pointIndex: number) => {
                    return {
                        x: xvalues[pointIndex],
                        y: yvalues[pointIndex],
                    };
                });
            })
        );
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

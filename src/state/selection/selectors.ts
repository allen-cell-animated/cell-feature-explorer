import {
    keys,
    map,
    values,
} from "lodash";
import { createSelector } from "reselect";

import {
    CELL_ID_KEY, PROTEIN_NAME_KEY,
    THUMBNAIL_DIR_KEY
} from "../../constants";

import {
    getFileInfo,
    getFullMetaDataArray,
    getMeasuredData,
} from "../metadata/selectors";
import {
    FileInfo,
    MeasuredFeatures, MetaData,
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

// COMPOSED SELECTORS
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

export const getPossibleColorByData = createSelector([getFullMetaDataArray], (metaData) => (
    map(metaData, (ele) => (
            {
            ...ele.measured_features,
            [PROTEIN_NAME_KEY]: ele.file_info[PROTEIN_NAME_KEY],
            }
        )
    ))
);

export const getColorByValues = createSelector([getPossibleColorByData, getColorBySelection],
    (metaData: MetaData[], colorBy: string): number[] | string[] => (
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
            const directory = fileInfo[pointIndex][THUMBNAIL_DIR_KEY];
            const cellLineId = cellID.split("_")[0];
            const src = `/aics/thumbnails/${directory}/${cellLineId}/${cellID}.png`;
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
            const x = measuredData[pointIndex][xaxis];
            const y = measuredData[pointIndex][yaxis];
            return {
                cellID,
                pointIndex,
                x,
                y,
            };
        });
    }
);

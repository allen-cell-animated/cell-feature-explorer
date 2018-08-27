import { keys, map, values } from "lodash";
import { createSelector } from "reselect";

import {
    getFeatureData,
} from "../metadata/selectors";
import {
    FeatureData,
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
export const getSelectedSubGroup = (state: State) => state.selection.selectedSubGroup;

// COMPOSED SELECTORS
export const getXValues = createSelector([getFeatureData, getPlotByOnX],
    (featureData: MetadataStateBranch, plotByOnX: string): number[] => (
         featureData.map((metaDatum: FeatureData) => (metaDatum[plotByOnX]))
    )
);

export const getYValues = createSelector([getFeatureData, getPlotByOnY],
    (featureData: MetadataStateBranch, plotByOnY: string): number[] => (
        featureData.map((metaDatum: FeatureData) => (metaDatum[plotByOnY]))
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

export const getColorByValues = createSelector([getFeatureData, getColorBySelection],
    (featureData: MetadataStateBranch, colorBy: string): string[] => (
        featureData.map((metaDatum: FeatureData) => (metaDatum[colorBy]))
    )
);

export const getThumbnails = createSelector([getFeatureData, getClickedScatterPoints],
    (featureData: MetadataStateBranch, clickedScatterPointIndices: number[]): Thumbnail[] => {
        return clickedScatterPointIndices.map((pointIndex) => {
            const data = featureData[pointIndex];
            const cellID = data["Cell ID"];
            const directory = data.datadir;
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

export const getAnnotations = createSelector([getFeatureData, getClickedScatterPoints, getPlotByOnX, getPlotByOnY],
    (featureData: MetadataStateBranch, clickedScatterPointIndices: number[], xaxis, yaxis): Annotation[] => {
        return clickedScatterPointIndices.map((pointIndex) => {
            const data = featureData[pointIndex];
            const cellID = data["Cell ID"];
            const x = data[xaxis];
            const y = data[yaxis];
            return {
                cellID,
                pointIndex,
                x,
                y,
            };
        });
    }
);

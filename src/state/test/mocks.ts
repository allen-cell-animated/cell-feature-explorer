import { zipWith } from "lodash";

import {
    CELL_ID_KEY,
    CELL_LINE_NAME_KEY,
    FOV_ID_KEY, KMEANS_KEY,
    PROTEIN_NAME_KEY,
} from "../../constants/index";

import {
    INITIAL_COLOR_BY,
    INITIAL_COLORS,
    INITIAL_PLOT_BY_ON_X,
    INITIAL_PLOT_BY_ON_Y,
} from "../selection/constants";

import { MetaData } from "../metadata/types";

import { State } from "../types";

export const makeFeatureData = (
    cellIds: string[],
    proteinNames: string[],
    measuredFeatures1: number[],
    measuredFeatures2: number[]
): MetaData[] => (
    zipWith(cellIds, proteinNames, measuredFeatures1, measuredFeatures2,
        (cellId, proteinName, feature1, feature2) => (
        {
            clusters: {
                [KMEANS_KEY]: {
                    2 : 0,
                },
            },
            file_info : {
                [CELL_ID_KEY]: Number(cellId.split("_")[2]),
                [CELL_LINE_NAME_KEY]: cellId.split("_")[0] || cellId,
                [FOV_ID_KEY]: cellId.split("_")[1] || cellId,
                [PROTEIN_NAME_KEY]: proteinName,
            },
            measured_features: {
                feature1,
                feature2,
            },

        }
    )
));

export const mockState = (
    cellIds: string[],
    proteinNames: string[],
    measuredFeatures1: number[],
    measuredFeatures2: number[]
): State => ({
    metadata: {
        featureData: makeFeatureData(cellIds, proteinNames, measuredFeatures1, measuredFeatures2),
    },
    selection: {
        colorBy: INITIAL_COLOR_BY,
        downloadConfig: {
            key: "",
            type: "",
        },
        filterExclude: [],
        plotByOnX: INITIAL_PLOT_BY_ON_X,
        plotByOnY: INITIAL_PLOT_BY_ON_Y,
        proteinColors: INITIAL_COLORS,
        selectedGroupColors: INITIAL_COLORS,
        selectedGroups: {},
        selectedPoints: [],
    },
});

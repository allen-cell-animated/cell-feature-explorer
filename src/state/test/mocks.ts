import { zipWith } from "lodash";
import {
    CELL_ID_KEY,
    PROTEIN_NAME_KEY,
    THUMBNAIL_DIR_KEY,
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
    zipWith(cellIds, proteinNames, measuredFeatures1, measuredFeatures2, (cellId, proteinName, feature1, feature2) => (
        {
            file_info : {
                [CELL_ID_KEY]: cellId,
                [PROTEIN_NAME_KEY]: proteinName,
                [THUMBNAIL_DIR_KEY]: "dir",
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
        plotByOnX: INITIAL_PLOT_BY_ON_X,
        plotByOnY: INITIAL_PLOT_BY_ON_Y,
        proteinColors: INITIAL_COLORS,
        selectedGroupColors: INITIAL_COLORS,
        selectedGroups: {},
        selectedPoints: [],
    },
});

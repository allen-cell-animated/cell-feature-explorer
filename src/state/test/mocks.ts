import {
    INITIAL_COLOR_BY,
    INITIAL_COLORS,
    INITIAL_PLOT_BY_ON_X,
    INITIAL_PLOT_BY_ON_Y,
} from "../selection/constants";

import { MetadataStateBranch } from "../metadata/types";
import { State } from "../types";
import {
    CELL_ID_KEY,
    PROTEIN_NAME_KEY, THUMBNAIL_DIR_KEY,
} from "../../constants/index";

export const mockFeatureData: MetadataStateBranch = [
        {
            [CELL_ID_KEY]: "AICS-1",
            [PROTEIN_NAME_KEY]: "protein1",
            [THUMBNAIL_DIR_KEY]: "dir",
            feature1: 1,
            feature2: 2,
            feature3: 3,
        },
        {
            [CELL_ID_KEY]: "AICS-2",
            [PROTEIN_NAME_KEY]: "protein1",
            [THUMBNAIL_DIR_KEY]: "dir",
            feature1: 4,
            feature2: 5,
            feature3: 6,
        },
        {
            [CELL_ID_KEY]: "AICS-3",
            [PROTEIN_NAME_KEY]: "protein2",
            [THUMBNAIL_DIR_KEY]: "dir",
            feature1: 7,
            feature2: 8,
            feature3: 9,
        },
        {
            [CELL_ID_KEY]: "AICS-4",
            [PROTEIN_NAME_KEY]: "protein2",
            [THUMBNAIL_DIR_KEY]: "dir",
            feature1: 10,
            feature2: 11,
            feature3: 12,
        },

];

export const mockState: State = {
    metadata: {
        featureData: mockFeatureData,
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
};

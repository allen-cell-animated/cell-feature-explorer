/* eslint-disable @typescript-eslint/camelcase */

import { CELL_LINE_DEF_NAME_KEY, CELL_LINE_DEF_PROTEIN_KEY, CELL_LINE_DEF_STRUCTURE_KEY, PROTEIN_NAME_KEY, CELL_ID_KEY, CELL_LINE_NAME_KEY, FOV_ID_KEY, ARRAY_OF_CELL_IDS_KEY, MITOTIC_STAGE_KEY, CELL_COUNT_KEY } from "../../constants";
import {
    INITIAL_COLOR_BY,
    INITIAL_COLORS,
} from "../selection/constants";

    const cellLineDefs = [
        {
            [CELL_LINE_DEF_NAME_KEY]: "AICS-57",
            [CELL_LINE_DEF_PROTEIN_KEY]: "Nucleophosmin",
            [CELL_LINE_DEF_STRUCTURE_KEY]: "Nucleolus (Granular Component)",
            [PROTEIN_NAME_KEY]: "Nucleophosmin",
            [CELL_COUNT_KEY]: 3470,
        },
    ];
    const fileInfo = [
        {
            [CELL_ID_KEY]: 1,
            [CELL_LINE_NAME_KEY]: "AICS-57",
            [FOV_ID_KEY]: 12762,
            [CELL_LINE_DEF_STRUCTURE_KEY]: "Nucleolus (Granular Component)",
            [PROTEIN_NAME_KEY]: "Nucleophosmin",
        },
        {
            [CELL_ID_KEY]: 2,
            [CELL_LINE_NAME_KEY]: "AICS-57",
            [FOV_ID_KEY]: 12762,
            [CELL_LINE_DEF_STRUCTURE_KEY]: "Nucleolus (Granular Component)",
            [PROTEIN_NAME_KEY]: "Nucleophosmin",
        },
    ];
    const measuredFeaturesDefs = [
        {
            discrete: false,
            displayName: "Apical Proximity",
            key: "apical-proximity",
            unit: "unitless",
        },
        {
            discrete: true,
            displayName: "Cell Segmentation",
            key: "cell-segmentation",
            unit: "complete",
        },
        {
            discrete: false,
            displayName: "Cell Surface area",
            key: "cellular-surface-area",
            unit: "µm²",
        },
    ];
    const featureData = {
        [ARRAY_OF_CELL_IDS_KEY]: ["1", "2"],
        "apical-proximity": [-0.25868651080317, -0.1],
        "cell-segmentation": [1, 0],
        "cellular-surface-area": [702.3191, 702.3191],
        [MITOTIC_STAGE_KEY]: [2, 1],
    };

export const mockState = {
           metadata: {
               cellLineDefs: cellLineDefs,
               cellFileInfo: fileInfo,
               featureData: featureData,
               measuredFeaturesDefs: measuredFeaturesDefs,
           },
           selection: {
               colorBy: INITIAL_COLOR_BY,
               downloadConfig: {
                   key: "",
                   type: "",
               },
               filterExclude: [],
               plotByOnX: "INITIAL_PLOT_BY_ON_X",
               plotByOnY: "INITIAL_PLOT_BY_ON_Y",
               proteinColors: INITIAL_COLORS,
               selectedGroupColors: INITIAL_COLORS,
               selectedGroups: {},
               selectedPoints: [],
           },
       };

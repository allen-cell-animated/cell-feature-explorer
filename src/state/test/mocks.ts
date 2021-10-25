/* eslint-disable @typescript-eslint/camelcase */

import {
    CELL_LINE_DEF_NAME_KEY,
    CELL_LINE_DEF_PROTEIN_KEY,
    CELL_LINE_DEF_STRUCTURE_KEY,
    CELL_LINE_DEF_GENE_KEY,
    PROTEIN_NAME_KEY,
    CELL_ID_KEY,
    CELL_LINE_NAME_KEY,
    FOV_ID_KEY,
    ARRAY_OF_CELL_IDS_KEY,
    CELL_COUNT_KEY,
    FOV_THUMBNAIL_PATH,
    FOV_VOLUME_VIEWER_PATH,
    THUMBNAIL_PATH,
    VOLUME_VIEWER_PATH,
} from "../../constants";
import { FileInfo } from "../metadata/types";
import {
    INITIAL_COLOR_BY,
    INITIAL_COLORS,
} from "../selection/constants";

export const selectedCellFileInfo: FileInfo[] = [
    {
        [CELL_ID_KEY]: "1",
        [CELL_LINE_NAME_KEY]: "AICS-57",
        [FOV_ID_KEY]: "12762",
        [PROTEIN_NAME_KEY]: "Nucleophosmin",
        [FOV_THUMBNAIL_PATH]: "path",
        [FOV_VOLUME_VIEWER_PATH]: "path",
        [THUMBNAIL_PATH]: "path",
        [VOLUME_VIEWER_PATH]: "path",
    },
    {
        [CELL_ID_KEY]: "2",
        [CELL_LINE_NAME_KEY]: "AICS-57",
        [FOV_ID_KEY]: "12762",
        [PROTEIN_NAME_KEY]: "Nucleophosmin",
        [FOV_THUMBNAIL_PATH]: "path",
        [FOV_VOLUME_VIEWER_PATH]: "path",
        [THUMBNAIL_PATH]: "path",
        [VOLUME_VIEWER_PATH]: "path",
    },
];

const cellLineDefs = [
    {
        [CELL_LINE_DEF_NAME_KEY]: "AICS-57",
        [CELL_LINE_DEF_PROTEIN_KEY]: "Nucleophosmin",
        [CELL_LINE_DEF_STRUCTURE_KEY]: "Nucleolus (Granular Component)",
        [PROTEIN_NAME_KEY]: "Nucleophosmin",
        [CELL_LINE_DEF_GENE_KEY]: "ABC-1",
        [CELL_COUNT_KEY]: 3470,
    },
    {
        [CELL_LINE_DEF_NAME_KEY]: "AICS-7",
        [CELL_LINE_DEF_PROTEIN_KEY]: "Alpha-actinin-1",
        [CELL_LINE_DEF_STRUCTURE_KEY]: "Actin filaments",
        [PROTEIN_NAME_KEY]: "Alpha-actinin-1",
        [CELL_LINE_DEF_GENE_KEY]: "ABC-2",
        [CELL_COUNT_KEY]: 1809,
    },
    {
        [CELL_LINE_DEF_NAME_KEY]: "AICS-16",
        [CELL_LINE_DEF_PROTEIN_KEY]: "Beta-actin",
        [CELL_LINE_DEF_STRUCTURE_KEY]: "Actin filaments",
        [PROTEIN_NAME_KEY]: "Beta-actin",
        [CELL_LINE_DEF_GENE_KEY]: "ABC-3",
        [CELL_COUNT_KEY]: 1039,
    },
    {
        [CELL_LINE_DEF_NAME_KEY]: "AICS-999",
        [CELL_LINE_DEF_PROTEIN_KEY]: "Delta-actin",
        [CELL_LINE_DEF_STRUCTURE_KEY]: "Actin filaments",
        [PROTEIN_NAME_KEY]: "Delta-actin",
        [CELL_LINE_DEF_GENE_KEY]: "ABC-4",
        [CELL_COUNT_KEY]: 2003,
    },
    {
        [CELL_LINE_DEF_NAME_KEY]: "AICS-58",
        [CELL_LINE_DEF_PROTEIN_KEY]: "Beta-catenin",
        [CELL_LINE_DEF_STRUCTURE_KEY]: "Adherens junctions",
        [PROTEIN_NAME_KEY]: "Beta-catenin",
        [CELL_LINE_DEF_GENE_KEY]: "ABC-5",
        [CELL_COUNT_KEY]: 2343,
    },
];

const fileInfo: FileInfo[] = [
    {
        [CELL_ID_KEY]: "1",
        [CELL_LINE_NAME_KEY]: "AICS-57",
        [FOV_ID_KEY]: "12762",
        [PROTEIN_NAME_KEY]: "Nucleophosmin",
        [FOV_THUMBNAIL_PATH]: "path",
        [FOV_VOLUME_VIEWER_PATH]: "path",
        [THUMBNAIL_PATH]: "path",
        [VOLUME_VIEWER_PATH]: "path",
    },
    {
        [CELL_ID_KEY]: "2",
        [CELL_LINE_NAME_KEY]: "AICS-57",
        [FOV_ID_KEY]: "12762",
        [PROTEIN_NAME_KEY]: "Nucleophosmin",
        [FOV_THUMBNAIL_PATH]: "path",
        [FOV_VOLUME_VIEWER_PATH]: "path",
        [THUMBNAIL_PATH]: "path",
        [VOLUME_VIEWER_PATH]: "path",
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
    {
        discrete: false,
        displayName: "Missing data",
        key: "missing-data",
        unit: "µm²",
    },
];
const featureData = {
    values: {
        "apical-proximity": [-0.25868651080317, -0.1],
        "cell-segmentation": [1, 0],
        "cellular-surface-area": [702.3191, 702.3191],
        "missing-data": [null, null],
    },
    labels: {
        [ARRAY_OF_CELL_IDS_KEY]: ["1", "2"],
        thumbnailPaths: ["path1", "path2"],
        [PROTEIN_NAME_KEY]: ["protein1", "protein2"],
    },
};

const displayableGroups = cellLineDefs.map(cellLine => cellLine[CELL_LINE_DEF_PROTEIN_KEY]);

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
               selectedPoints: selectedCellFileInfo,
               displayableGroups: displayableGroups,
           },
       };

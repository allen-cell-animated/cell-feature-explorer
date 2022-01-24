import {
    GROUP_BY_KEY,
    CELL_ID_KEY,
    CELL_LINE_NAME_KEY,
    FOV_ID_KEY,
    ARRAY_OF_CELL_IDS_KEY,
    FOV_THUMBNAIL_PATH,
    FOV_VOLUME_VIEWER_PATH,
    THUMBNAIL_PATH,
    VOLUME_VIEWER_PATH,
} from "../../constants";
import { FileInfo } from "../metadata/types";
import { INITIAL_COLOR_BY, INITIAL_COLORS } from "../selection/constants";

export const selectedCellFileInfo: FileInfo[] = [
    {
        [CELL_ID_KEY]: "1",
        [CELL_LINE_NAME_KEY]: "AICS-57",
        [FOV_ID_KEY]: "12762",
        [GROUP_BY_KEY]: "Nucleophosmin",
        [FOV_THUMBNAIL_PATH]: "path",
        [FOV_VOLUME_VIEWER_PATH]: "path",
        [THUMBNAIL_PATH]: "path",
        [VOLUME_VIEWER_PATH]: "path",
    },
    {
        [CELL_ID_KEY]: "2",
        [CELL_LINE_NAME_KEY]: "AICS-57",
        [FOV_ID_KEY]: "12762",
        [GROUP_BY_KEY]: "Nucleophosmin",
        [FOV_THUMBNAIL_PATH]: "path",
        [FOV_VOLUME_VIEWER_PATH]: "path",
        [THUMBNAIL_PATH]: "path",
        [VOLUME_VIEWER_PATH]: "path",
    },
];

const fileInfo: FileInfo[] = [
    {
        [CELL_ID_KEY]: "1",
        [CELL_LINE_NAME_KEY]: "AICS-57",
        [FOV_ID_KEY]: "12762",
        [GROUP_BY_KEY]: "Nucleophosmin",
        [FOV_THUMBNAIL_PATH]: "path",
        [FOV_VOLUME_VIEWER_PATH]: "path",
        [THUMBNAIL_PATH]: "path",
        [VOLUME_VIEWER_PATH]: "path",
    },
    {
        [CELL_ID_KEY]: "2",
        [CELL_LINE_NAME_KEY]: "AICS-57",
        [FOV_ID_KEY]: "12762",
        [GROUP_BY_KEY]: "Nucleophosmin",
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
        [GROUP_BY_KEY]: ["protein1", "protein2"],
    },
};

// The protein name for the first cell line should be disabled in the
// left panel
const displayableGroups: any = []

export const mockState = {
    metadata: {
        cellFileInfo: fileInfo,
        featureData: featureData,
        measuredFeaturesDefs: measuredFeaturesDefs,
        viewerChannelSettings: {},
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

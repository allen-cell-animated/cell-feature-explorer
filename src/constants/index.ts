export const APP_ID = "cell-feature-explorer";
export const API_VERSION = "v1";
export const X_AXIS_ID = "plotByOnX";
export const Y_AXIS_ID = "plotByOnY";
export const ARRAY_OF_CELL_IDS_KEY = "cellIds";
export const ARRAY_OF_FILE_INFO_KEY = "fileInfo";
export const SCATTER_PLOT_NAME = "features-scatter-plot";
export const SELECTIONS_PLOT_NAME = "selections-scatter-plot";
export const CLUSTERS_PLOT_NAME = "clusters-plot-name";
export const COLOR_BY_SELECTOR = "colorBy";
export const PROTEIN_NAME_KEY = "structureProteinName";
export const CELL_LINE_DEF_NAME_KEY = "CellLineId_Name";
export const CELL_LINE_DEF_STRUCTURE_KEY = "StructureId_Name";
export const CELL_LINE_DEF_PROTEIN_KEY = "ProteinId_DisplayName";

export const CELL_ID_KEY = "CellId";
export const FOV_ID_KEY = "FOVId";
export const CELL_LINE_NAME_KEY = "CellLineName";
export const FOV_THUMBNAIL_PATH = "fovThumbnailPath";
export const FOV_VOLUME_VIEWER_PATH = "fovVolumeviewerPath";
export const THUMBNAIL_PATH = "thumbnailPath";
export const VOLUME_VIEWER_PATH = "volumeviewerPath";
// this defines the order they appear in the data files
export const FILE_INFO_KEYS = Object.freeze([
    CELL_ID_KEY,
    FOV_ID_KEY,
    CELL_LINE_NAME_KEY,
    THUMBNAIL_PATH,
    VOLUME_VIEWER_PATH,
    FOV_THUMBNAIL_PATH,
    FOV_VOLUME_VIEWER_PATH,
]);

export const CELL_COUNT_KEY = "cellCount";
export const DOWNLOAD_CONFIG_TYPE_PROTEIN = "protein";
export const DOWNLOAD_CONFIG_TYPE_SELECTION_SET = "selectionSet";
export const NUCLEAR_VOLUME_FEATURE_NAME = "DNA volume (\u00b5m\u00b3)";
export const MITOTIC_STAGE_KEY = "interphase-and-mitotic-stages";
const INTERPHASE_AND_MITOSIS_KEY = "Interphase and Mitosis (stage)";
const CELL_SEGMENTATION_KEY = "Cell Segmentation (complete)";
export const CATEGORICAL_FEATURES = Object.freeze([
    INTERPHASE_AND_MITOSIS_KEY,
    CELL_SEGMENTATION_KEY,
    MITOTIC_STAGE_KEY,
]);

export enum INTERPHASE_AND_MITOSIS_LABELS {
    "Interphase" = 0,
    "Mitotic" = 1,
}

export enum CELL_SEGMENTATION_LABELS {
    "Incomplete" = 0,
    "Complete" = 1,
    "Not determined" = -1,
}

export enum MITOTIC_STAGE_LABELS {
    "Interphase" = 0,
    "Prophase" = 1,
    "Prometaphase" = 2,
    "Metaphase" = 3,
    "Anaphase" = 4,
    "Not determined" = NaN,
}

export const CATEGORY_TO_ENUM_LOOKUP: {
    [index: string]: any
} = {
    [INTERPHASE_AND_MITOSIS_KEY] : INTERPHASE_AND_MITOSIS_LABELS,
    [CELL_SEGMENTATION_KEY] : CELL_SEGMENTATION_LABELS,
    [MITOTIC_STAGE_KEY] : MITOTIC_STAGE_LABELS,
};

export function getLabels(name: string): { [index: string]: number } {
    return CATEGORY_TO_ENUM_LOOKUP[name] || {};
}

const NO_DATA_COLOR = "#838383";

export const MITOTIC_COLORS: { [index: number]: string } = {
    [MITOTIC_STAGE_LABELS.Anaphase]: "#7f48f3",
    [MITOTIC_STAGE_LABELS.Metaphase]: "#66c2a4",
    [MITOTIC_STAGE_LABELS.Prometaphase]: "#fed98e",
    [MITOTIC_STAGE_LABELS.Prophase]: "#c51b8a",
    [MITOTIC_STAGE_LABELS.Interphase]: "#e9ebee",
    [NaN]: NO_DATA_COLOR,
};

export const INTERPHASE_AND_MITOSIS_COLORS = {
    [INTERPHASE_AND_MITOSIS_LABELS.Mitotic]: "#7f48f3",
    [INTERPHASE_AND_MITOSIS_LABELS.Interphase]: "#e9ebee",
};

export const COMPLETENESS_COLORS = {
    [CELL_SEGMENTATION_LABELS.Complete]: "#7f48f3",
    [CELL_SEGMENTATION_LABELS.Incomplete]: "#fed98e",
    "-1" : NO_DATA_COLOR, // couldn't do a lookup with a space in the name.
};

export const CATEGORY_TO_COLOR_LOOKUP: {
    [index: string]: any
} = {
    [INTERPHASE_AND_MITOSIS_KEY] : INTERPHASE_AND_MITOSIS_COLORS,
    [CELL_SEGMENTATION_KEY] : COMPLETENESS_COLORS,
    [MITOTIC_STAGE_KEY] : MITOTIC_COLORS,
};

export const AGGLOMERATIVE_KEY = "Agglomerative";
export const KMEANS_KEY = "KMeans";
export const SPECTRAL_KEY = "Spectral";

export const CLUSTER_NUMBER_KEY = "numberOfClusters";
export const CLUSTER_DISTANCE_KEY = "clusteringDistance";

// These lines are typing and exporting variables created by webpack DefinePlugin

declare const BASE_API_URL: string;
const _BASE_API_URL = BASE_API_URL;
export { _BASE_API_URL as BASE_API_URL };

declare const THUMBNAIL_BASE_URL: string;
const _THUMBNAIL_BASE_URL = THUMBNAIL_BASE_URL;
export { _THUMBNAIL_BASE_URL as THUMBNAIL_BASE_URL };

declare const DOWNLOAD_URL_PREFIX: string;
const _DOWNLOAD_URL_PREFIX = DOWNLOAD_URL_PREFIX;
export { _DOWNLOAD_URL_PREFIX as DOWNLOAD_URL_PREFIX };

export const MY_SELECTIONS_ID = 0;

export const DISABLE_COLOR = "#6e6e6e";
export const OFF_COLOR = "#000";

export const GENERAL_PLOT_SETTINGS = {
    backgroundColor: "rgba(0,0,0,0)",
    cellName: CELL_ID_KEY,
    chartParent: "ace-scatter-chart",
    circleRadius: 4,
    histogramColor: "rgb(164,162,164)",
    legend: {
        font: {
            color: "rgb(255,255,255)",
        },
        orientation: "h" as "h",
        y: 60,
    },
  margin: {
        b: 50,
        l: 60,
        r: 40,
        t: 10,
    },
    moveDropdownCutoffWidth: 370,
    plotHeight: 580,
    showLegendCutoffHeight: 635,
    showLegendCutoffWidth: 692,
    textColor: "rgb(255,255,255)",
    unselectedCircleOpacity: .5,
    xAxisInitial: "DNA volume (\u00b5m\u00b3)",
    yAxisInitial: "Cell volume (\u00b5m\u00b3)",
};

export const BRIGHT_FIELD_NAMES = ["Bright_100", "Bright_100X", "TL 100x", "Bright_2"];
export const OBS_MEMBRANE_NAMES = ["CMDRP"];
export const OBS_STRUCTURE_NAMES = ["EGFP", "mtagRFPT"];
export const OBS_DNA_NAMES = ["H3342_3", "H3342"];

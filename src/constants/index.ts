export const APP_ID = "cell-feature-explorer";
export const API_VERSION = "v1";
export const X_AXIS_ID = "plotByOnX";
export const Y_AXIS_ID = "plotByOnY";
export const SCATTER_PLOT_NAME = "features-scatter-plot";
export const SELECTIONS_PLOT_NAME = "selections-scatter-plot";
export const CLUSTERS_PLOT_NAME = "clusters-plot-name";
export const COLOR_BY_SELECTOR = "colorBy";
export const CELL_ID_KEY = "CellId";
export const CELL_LINE_NAME_KEY = "CellLineName";
export const FOV_ID_KEY = "FOVId";
export const PROTEIN_NAME_KEY = "structureProteinName";

export const CELL_LINE_DEF_NAME_KEY = "CellLineId/Name";
export const CELL_LINE_DEF_STRUCTURE_KEY = "StructureId/Name";
export const CELL_LINE_DEF_PROTEIN_KEY = "ProteinId/DisplayName";
export const FILE_INFO_KEYS = Object.freeze([CELL_ID_KEY, CELL_LINE_NAME_KEY, FOV_ID_KEY]);

export const AGGLOMERATIVE_KEY = "Agglomerative";
export const KMEANS_KEY = "KMeans";
export const DBSCAN_KEY = "DBSCAN";

export const CLUSTER_NUMBER_KEY = "numberOfClusters";
export const CLUSTER_DISTANCE_KEY = "clusteringDistance";

declare const CELL_VIEWER_URL: string;
declare const BASE_API_URL: string;
declare const THUMBNAIL_BASE_URL: string;
const _CELL_VIEWER_URL = CELL_VIEWER_URL;
const _BASE_API_URL = BASE_API_URL;
const _THUMBNAIL_BASE_URL = THUMBNAIL_BASE_URL;
export {_CELL_VIEWER_URL as CELL_VIEWER_URL};
export {_BASE_API_URL as BASE_API_URL};
export {_THUMBNAIL_BASE_URL as THUMBNAIL_BASE_URL};

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
        bottom: 10,
        left: 25,
        right: 25,
        top: 10,
    },
    moveDropdownCutoffWidth: 370,
    showLegendCutoffHeight: 635,
    showLegendCutoffWidth: 692,
    textColor: "rgb(255,255,255)",
    unselectedCircleOpacity: .7,
    xAxisInitial: "Nuclear Volume (fL)",
    yAxisInitial: "Cellular Volume (fL)",
};

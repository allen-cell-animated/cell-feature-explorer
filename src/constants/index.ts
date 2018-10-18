export const APP_ID = "cell-feature-explorer";
export const API_VERSION = "v1";
export const X_AXIS_ID = "plotByOnX";
export const Y_AXIS_ID = "plotByOnY";
export const SCATTER_PLOT_NAME = "features-scatter-plot";
export const COLOR_BY_SELECTOR = "colorBy";
export const CELL_ID_KEY = "Cell ID";
export const CELL_LINE_NAME_KEY = "CellLineName";
export const FOV_ID_KEY = "FOV ID";
export const PROTEIN_NAME_KEY = "structureProteinName";
export const CELLLINEDEF_NAME_KEY = "CellLineId/Name";
export const CELLLINEDEF_STRUCTURE_KEY = "StructureId/Name";
export const CELLLINEDEF_PROTEIN_KEY = "ProteinId/Name";

// production-like settings
// export const CELL_VIEWER_URL = "https://meganrm.github.io/website-3d-cell-viewer/";
// export const BASE_API_URL = `https://raw.githubusercontent.com/meganrm/plotting-tool/master/src/`;
// export const THUMBNAIL_BASE_URL = "https://cellviewer-1-2-0.allencell.org";

// assume all components are accessible on the same local server for dev environment
export const CELL_VIEWER_URL = "/website-3d-cell-viewer/imageviewer/";
export const BASE_API_URL = `/cell-feature-explorer/dist/`;
export const THUMBNAIL_BASE_URL = "http://dev-aics-dtp-001/cellviewer-1-3-0/Cell-Viewer_Thumbnails/";

export const GENERAL_PLOT_SETTINGS = {
    backgroundColor: "rgba(0,0,0,0)",
    cellName: CELL_ID_KEY,
    chartParent: "ace-scatter-chart",
    circleRadius: 4,
    histogramColor: "rgb(164,162,164)",
    // imagesDir: "", // "/aics/thumbnails",
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
    xAxisInitial: "Nuclear volume (fL)",
    yAxisInitial: "Cellular volume (fL)",
};

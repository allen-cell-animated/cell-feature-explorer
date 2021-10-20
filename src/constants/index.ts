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
export const CELL_LINE_DEF_GENE_KEY = "GeneId_Name";

export const CELL_ID_KEY = "CellId";
export const FOV_ID_KEY = "FOVId";
export const CELL_LINE_NAME_KEY = "CellLineName";
export const FOV_THUMBNAIL_PATH = "fovThumbnailPath";
export const FOV_VOLUME_VIEWER_PATH = "fovVolumeviewerPath";
export const THUMBNAIL_PATH = "thumbnailPath";
export const VOLUME_VIEWER_PATH = "volumeviewerPath";

export type FILE_INFO_KEY =
    | typeof CELL_ID_KEY
    | typeof FOV_ID_KEY
    | typeof CELL_LINE_NAME_KEY
    | typeof THUMBNAIL_PATH
    | typeof VOLUME_VIEWER_PATH
    | typeof FOV_THUMBNAIL_PATH
    | typeof FOV_VOLUME_VIEWER_PATH;
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
export const MITOTIC_STAGE_KEY = "interphase-and-mitotic-stages"; // TODO: add display info for thumbnail cards to file info so this won't be needed on the front end

export const AGGLOMERATIVE_KEY = "Agglomerative";
export const KMEANS_KEY = "KMeans";
export const SPECTRAL_KEY = "Spectral";

export const CLUSTER_NUMBER_KEY = "numberOfClusters";
export const CLUSTER_DISTANCE_KEY = "clusteringDistance";

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
    unselectedCircleOpacity: 0.5,
};

// TODO these are literally only used in one single place; maybe they could be moved into that one place?
// TODO move these to the dataset data
export const BRIGHT_FIELD_NAMES = ["Bright_100", "Bright_100X", "TL 100x", "Bright_2"];
export const OBS_MEMBRANE_NAMES = ["CMDRP"];
export const OBS_STRUCTURE_NAMES = ["EGFP", "mtagRFPT"];
export const OBS_DNA_NAMES = ["H3342_3", "H3342"];
export const VARIANCE_DATASET_CHANNEL_NAME_MAPPINGS = [
    { test: /(CMDRP)|(Memb)/, label: "Membrane" },
    { test: /(EGFP)|(RFPT)|(STRUCT)/, label: "Labeled structure" },
    { test: /(H3342)|(DNA)/, label: "DNA" },
    { test: /(100)|(Bright)/, label: "Bright field" },
];
export const VARIANCE_DATASET_CHANNEL_GROUPINGS = {
    "Observed channels": [
        "CMDRP",
        "EGFP",
        "mtagRFPT",
        "H3342",
        "H3342_3",
        "Bright_100",
        "Bright_100X",
        "TL 100x",
        "TL_100x",
        "Bright_2",
    ],
    "Segmentation channels": ["SEG_STRUCT", "SEG_Memb", "SEG_DNA"],
    "Contour channels": ["CON_Memb", "CON_DNA"],
};

export const NO_SETTINGS = {
    channelNameMapping: "" as "", // type to empty string, not any string
    groupToChannelNameMap: "" as "", // type to empty string, not any string
};

export const VIEWER_CHANNEL_SETTINGS: {
    [key: string]:
        | {
              channelNameMapping: "" | { test: RegExp; label: string }[];
              groupToChannelNameMap: "" | { [key: string]: string[] };
              channelsEnabled?: number[];
              initialChannelSettings?: { [key: string]: { color: [number, number, number] } };
          }
        | undefined;
} = {
    // eslint-disable-next-line @typescript-eslint/camelcase
    aics_hipsc: {
        channelNameMapping: VARIANCE_DATASET_CHANNEL_NAME_MAPPINGS,
        groupToChannelNameMap: VARIANCE_DATASET_CHANNEL_GROUPINGS,
        channelsEnabled: [0, 1, 2],
    },
    // eslint-disable-next-line @typescript-eslint/camelcase
    cellsystems_fish: {
        channelNameMapping: [],
        groupToChannelNameMap: {},
        channelsEnabled: [0, 1, 3, 4],
        initialChannelSettings: {
            "0": { color: [128, 0, 128] },
            "1": { color: [128, 128, 128] },
            "2": { color: [0, 128, 128] },
            "3": { color: [128, 128, 0] },
            "4": { color: [255, 255, 255] },
        },
    },
};

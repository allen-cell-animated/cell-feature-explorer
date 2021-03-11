import {
    AGGLOMERATIVE_KEY,
    CLUSTER_DISTANCE_KEY,
    CLUSTER_NUMBER_KEY,
    KMEANS_KEY,
    MY_SELECTIONS_ID,
    PROTEIN_NAME_KEY,
    SPECTRAL_KEY,
} from "../../constants/index";
import { makeConstant } from "../util";

import {
    ClusteringNumberChoices,
} from "./types";
const makeSelectionConstant = (constant: string) => makeConstant("selection", constant);

export const CHANGE_AXIS = makeSelectionConstant("deselect-file");
export const SELECT_GROUP_VIA_PLOT = makeSelectionConstant("select_group");
export const DESELECT_POINT = makeSelectionConstant("deselect-point");
export const SELECT_POINT = makeSelectionConstant("select-point");
export const DESELECT_ALL_POINTS = makeSelectionConstant("deselect-all-points");
export const TOGGLE_FILTER_BY_PROTEIN_NAME = makeSelectionConstant("toggle-filter-by-protein-name");
export const OPEN_CELL_IN_3D = makeSelectionConstant("open-cell-in-3d");
export const TOGGLE_APPLY_SELECTION_SET_COLOR = makeSelectionConstant("apply-selection-set-color");
export const DESELECT_GROUP_OF_POINTS = makeSelectionConstant("deselect-group");
export const CHANGE_CLUSTER_NUMBER = makeSelectionConstant("change-cluster-number");
export const CHANGE_CLUSTERING_ALGORITHM = makeSelectionConstant("change-clustering-algorithm");
export const TOGGLE_CLUSTERS_VISIBLE = makeSelectionConstant("toggle-clusters-on");
export const SET_DOWNLOAD_CONFIG = makeSelectionConstant("set-download-config");
export const SET_MOUSE_POSITION = makeSelectionConstant("set-mouse-position");
export const SYNC_STATE_WITH_URL = makeSelectionConstant("sync-with-url");
export const CHANGE_HOVERED_POINT_ID = makeSelectionConstant("change-hovered-point");
export const CHANGE_HOVERED_GALLERY_CARD = makeSelectionConstant("change-hovered-gallery-card");
export const CHANGE_SELECTED_ALBUM = makeSelectionConstant("change-selected-album");
export const TOGGLE_GALLERY_OPEN_CLOSE = makeSelectionConstant("toggle-gallery");
export const REQUEST_CELL_FILE_INFO_BY_CELL_ID = makeSelectionConstant(
    "REQUEST_CELL_FILE_INFO_BY_CELL_ID"
);
export const RECEIVE_FILE_INFO = makeSelectionConstant(
    "RECEIVE_CELL_FILE_INFO"
);
export const RECEIVE_FILE_INFO_FOR_SELECTED_CELL = makeSelectionConstant(
    "RECEIVE_SELECTED_FILE_INFO"
);
export const RECEIVE_FILE_INFO_FOR_ALBUM_CELLS = makeSelectionConstant(
    "RECEIVE_FILE_INFO_FOR_ALBUM_CELLS"
);
export const SELECT_ARRAY_OF_POINTS = makeSelectionConstant("SELECT_ARRAY_OF_POINTS");
export const RECEIVE_FILE_INFO_FOR_SELECTED_ARRAY_OF_CELLS = makeSelectionConstant(
    "RECEIVE_FILE_INFO_FOR_SELECTED_ARRAY_OF_CELLS"
);
export const SET_DATASET = makeSelectionConstant("set-dataset");
export const CHANGE_DATASET = makeSelectionConstant("change-dataset");
export const CLEAR_DATASET = makeSelectionConstant("clear-dataset");

export const INITIAL_COLOR_BY = PROTEIN_NAME_KEY;
export const INITIAL_SELECTED_ALBUM_ID = MY_SELECTIONS_ID;

export const INITIAL_COLORS = [
    "#bbcd22",
    "#ff9900",
    "#FFEE1E",
    "#FD92B6",
    "#33a02c",
    "#F07C4C",
    "#c26cff",
    "#f0486e",
    "#0099ff",
    "#ffc35c",
    "#33ffff",
    "#ff6633",
    "#a6cee3",
    "#cab2d6",
    "#b15928",
    "#e8af39",
    "#537eff",
    "#61d900",
    "#ff8ae8",
    "#FF4d4d",
    "#c26cff",
    "#aeaeae",
    "#ff44ff",
    "#6a3d9a",
    "#ffff99",
    "#ff00de",
    "#24bcfa",
    "#84df11",
    "#ecc560",
    "#ff72ff",
    "#f58117",
    "#f8311b",
    "#5791db",
    "#11a89a",
    "#a70009",
    "#ff6200",
    "#fddb02",
    "#f7db78",
    "#f9a558",
    ];

export const INITIAL_SELECTION_COLORS = [
    "#8dd3c7",
    "#ffffb3",
    "#bebada",
    "#fb8072",
    "#80b1d3",
    "#fdb462",
    "#b3de69",
    "#fccde5",
    "#d9d9d9",
    "#bc80bd",
    "#ccebc5",
    "#ffed6f",
];

export const CLUSTERING_MAP = (key: string): ClusteringNumberChoices => {
    const map: {[key: string]: ClusteringNumberChoices} = {
        [AGGLOMERATIVE_KEY]: CLUSTER_NUMBER_KEY,
        [SPECTRAL_KEY]: CLUSTER_NUMBER_KEY,
        [KMEANS_KEY]: CLUSTER_NUMBER_KEY,
    };
    return map[key] || CLUSTER_NUMBER_KEY;
};

export const CLUSTERING_LABEL = {
    [CLUSTER_NUMBER_KEY] : "number of clusters",
    [CLUSTER_DISTANCE_KEY] : "distance between clusters",
};

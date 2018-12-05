import {
    AGGLOMERATIVE_KEY,
    CLUSTER_DISTANCE_KEY, CLUSTER_NUMBER_KEY,
    DBSCAN_KEY, KMEANS_KEY,
    PROTEIN_NAME_KEY,
} from "../../constants/index";
import { makeConstant } from "../util";

import {
    ClusteringNumberChoices,
    ClusteringTypeChoices,
} from "./types";

export const CHANGE_AXIS = makeConstant("selection", "deselect-file");
export const SELECT_GROUP = makeConstant("selection", "select_group");
export const DESELECT_POINT = makeConstant("selection", "deselect-point");
export const SELECT_POINT = makeConstant("selection", "select-point");
export const DESELECT_ALL_POINTS = makeConstant("selection", "deselect-all-points");
export const TOGGLE_FILTER_BY_PROTEIN_NAME = makeConstant("selection", "toggle-filter-by-protein-name");
export const OPEN_CELL_IN_3D = makeConstant("selection", "open-cell-in-3d");
export const TOGGLE_APPLY_SELECTION_SET_COLOR = makeConstant("selection", "apply-selection-set-color");
export const DESELECT_GROUP_OF_POINTS = makeConstant("selection", "deselect-group");
export const CHANGE_CLUSTER_NUMBER = makeConstant("selection", "change-cluster-number");
export const CHANGE_CLUSTERING_ALGORITHM = makeConstant("selection", "change-clustering-algorithm");
export const TOGGLE_CLUSTERS_VISIBLE = makeConstant("selection", "toggle-clusters-on");
export const SELECT_DOWNLOAD_ID = makeConstant("selection", "select-download-id");
export const DOWNLOAD_IMAGE_DATA = makeConstant("selection", "download-image");

export const INITIAL_COLOR_BY = PROTEIN_NAME_KEY;
export const INITIAL_PLOT_BY_ON_X = "Nuclear Volume (fL)";
export const INITIAL_PLOT_BY_ON_Y = "Cellular Volume (fL)";
export const INITIAL_COLORS = [
    "#a6cee3",
    "#1f78b4",
    "#b2df8a",
    "#33a02c",
    "#fb9a99",
    "#e31a1c",
    "#fdbf6f",
    "#ff7f00",
    "#cab2d6",
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
    "#98b0d6",
    "#11a89a",
    "#a70009",
    "#ff6200",
    "#fddb02",
    "#f7db78",
    "#b15928",
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

export const CLUSTERING_MAP = (key: ClusteringTypeChoices): ClusteringNumberChoices => {
    const map: {[key: string]: ClusteringNumberChoices} = {
        [AGGLOMERATIVE_KEY]: CLUSTER_NUMBER_KEY,
        [DBSCAN_KEY]: CLUSTER_DISTANCE_KEY,
        [KMEANS_KEY]: CLUSTER_NUMBER_KEY,
    };
    return map[key] || CLUSTER_NUMBER_KEY;
};

export const CLUSTERING_LABEL = {
    [CLUSTER_NUMBER_KEY] : "number of clusters",
    [CLUSTER_DISTANCE_KEY] : "distance between clusters",
};

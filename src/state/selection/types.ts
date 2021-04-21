import {
    AGGLOMERATIVE_KEY,
    CELL_ID_KEY,
    CLUSTER_DISTANCE_KEY,
    CLUSTER_NUMBER_KEY,
    KMEANS_KEY,
    PROTEIN_NAME_KEY,
    SPECTRAL_KEY,
} from "../../constants";
import { FileInfo, MetadataStateBranch } from "../metadata/types";

type AGGLOMERATIVE_KEY = typeof AGGLOMERATIVE_KEY;
type KMEANS_KEY = typeof KMEANS_KEY;
type SPECTRAL_KEY = typeof SPECTRAL_KEY;
type CLUSTER_DISTANCE_KEY = typeof CLUSTER_DISTANCE_KEY;
type CLUSTER_NUMBER_KEY = typeof CLUSTER_NUMBER_KEY;

export type MenuSelectionChoices = "structureProteinName" | "cellularFeatures" |  "clusters";
export type ClusteringTypeChoices = KMEANS_KEY | SPECTRAL_KEY | AGGLOMERATIVE_KEY;
export type ClusteringNumberChoices = CLUSTER_DISTANCE_KEY | CLUSTER_NUMBER_KEY;

export interface CellDataArrays {
    [key: string]: number[] | FileInfo[] | string[];
}

export interface DownloadConfig {
    key: string;
    type: string;
}

export interface MousePosition {
    pageX: number;
    pageY: number;
}

export interface SelectionStateBranch {
    [key: string]: any;
}

interface OneCluster {
    [key: string]: number;
}
export interface ClusteringDatum {
    [key: string]: OneCluster;
}

export interface LassoOrBoxSelectPointData {
    pointIndex: number;
    cellId: string;
}
export interface LassoOrBoxSelectAction {
    key: string | number;
    payload: LassoOrBoxSelectPointData[];
    type: string;
}

export interface SelectAxisAction {
    axisId: keyof MetadataStateBranch;
    payload: string;
    type: string;
}

export interface DeselectPointAction {
    payload: string;
    type: string;
}

export interface DeselectGroupOfPointsAction {
    payload: number | string;
    type: string;
}

export interface  SelectPointAction {
    payload: string;
    type: string;
}

export interface  SelectCellIn3DAction {
    payload: string;
    type: string;
}

export interface ResetSelectionAction {
    type: string;
}

export interface ChangeSelectionAction {
    payload: string;
    type: string;
}

export interface ChangeDownloadConfigAction {
    payload: DownloadConfig;
    type: string;
}
export interface BoolToggleAction {
    payload: boolean;
    type: string;
}

export interface ChangeClusterNumberAction {
    payload: string;
    clusteringKey: string;
    type: string;
}

export interface ChangeMousePositionAction {
    payload: MousePosition;
    type: string;
}

export interface SelectedPointData {
    [CELL_ID_KEY]: string;
    [PROTEIN_NAME_KEY]: string;
    thumbnailPath: string;
}

export interface ChangeHoveredPointAction {
    payload: SelectedPointData;
    type: string;
}

export interface ChangeSelectedDatasetAction {
    payload: {
        dataset: string;
        thumbnailRoot: string;
        downloadRoot: string;
        volumeViewerDataRoot: string;
    };
    type: string;
}

export interface SelectAlbumAction {
    payload: number;
    type: string;
}

export interface TickConversion {
    tickText: string[];
    tickValues: number[];
}

export interface ColorForPlot {
    color: string;
    name: string;
    label: string;
}

export interface RequestFileInfoByCellIDAction {
    payload: string;
    type: string;
}

export interface ReceiveCellFileInfoAction {
    payload: FileInfo;
    type: string;
}

export interface ReceiveArrayOfPointsAction {
    payload: FileInfo[];
    type: string;
}

export interface SelectArrayOfPointsAction {
    payload: string[];
    type: string;
}

export interface SetHoveredCardAction {
    payload: SelectedPointData;
    type: string;
};

export interface ClearDatasetAction {
    type: string;
}
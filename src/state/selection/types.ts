import {
    AGGLOMERATIVE_KEY,
    CLUSTER_DISTANCE_KEY,
    CLUSTER_NUMBER_KEY,
    KMEANS_KEY,
    SPECTRAL_KEY,
} from "../../constants";
import { MetadataStateBranch } from "../metadata/types";

type AGGLOMERATIVE_KEY = typeof AGGLOMERATIVE_KEY;
type KMEANS_KEY = typeof KMEANS_KEY;
type SPECTRAL_KEY = typeof SPECTRAL_KEY;
type CLUSTER_DISTANCE_KEY = typeof CLUSTER_DISTANCE_KEY;
type CLUSTER_NUMBER_KEY = typeof CLUSTER_NUMBER_KEY;

export type MenuSelectionChoices = "structureProteinName" | "cellularFeatures" |  "clusters";
export type ClusteringTypeChoices = KMEANS_KEY | SPECTRAL_KEY | AGGLOMERATIVE_KEY;
export type ClusteringNumberChoices = CLUSTER_DISTANCE_KEY | CLUSTER_NUMBER_KEY;

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

export interface LassoOrBoxSelectAction {
    key: string | number;
    payload: number[];
    type: string;
}

export interface SelectAxisAction {
    axisId: keyof MetadataStateBranch;
    payload: string;
    type: string;
}

export interface DeselectPointAction {
    payload: number;
    type: string;
}

export interface DeselectGroupOfPointsAction {
    payload: number | string;
    type: string;
}

export interface  SelectPointAction {
    payload: number;
    type: string;
}

export interface  SelectCellIn3DAction {
    payload: number;
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

export interface ChangeHoveredPointAction {
    payload: number;
    type: string;
}

export interface SelectAlbumAction {
    payload: number;
    type: string;
}

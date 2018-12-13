import {
    CHANGE_AXIS,
    CHANGE_CLUSTER_NUMBER,
    CHANGE_CLUSTERING_ALGORITHM,
    DESELECT_ALL_POINTS,
    DESELECT_GROUP_OF_POINTS,
    DESELECT_POINT,
    OPEN_CELL_IN_3D,
    SELECT_DOWNLOAD_ID,
    SELECT_GROUP,
    SELECT_POINT,
    TOGGLE_APPLY_SELECTION_SET_COLOR,
    TOGGLE_CLUSTERS_VISIBLE,
    TOGGLE_FILTER_BY_PROTEIN_NAME,
} from "./constants";
import {
    BoolToggleAction,
    ChangeClusterNumberAction,
    ChangeDownloadConfigAction,
    ChangeSelectionAction,
    DeselectPointAction,
    DownloadConfig,
    ResetSelectionAction,
    SelectAxisAction,
    SelectGroupOfPointsAction,
    SelectPointAction,
} from "./types";

export function changeAxis(axisId: string, payload: string): SelectAxisAction {
    return {
        axisId,
        payload,
        type: CHANGE_AXIS,
    };
}

export function selectGroupOfPoints(key: string | number, payload: number[]): SelectGroupOfPointsAction  {
    return {
        key,
        payload,
        type: SELECT_GROUP,
    };
}

export function deselectGroupOfPoints(payload: string | number) {
    return {
        payload,
        type: DESELECT_GROUP_OF_POINTS,
    };
}

export function deselectPoint(payload: number): DeselectPointAction {
    return {
        payload,
        type: DESELECT_POINT,
    };
}

export function selectPoint(payload: number): SelectPointAction {
    return {
        payload,
        type: SELECT_POINT,
    };
}

export function clearAllSelectedPoints(): ResetSelectionAction {
    return {
        type: DESELECT_ALL_POINTS,
    };
}

export function toggleFilterByProteinName(payload: string): ChangeSelectionAction {
    return {
        payload,
        type: TOGGLE_FILTER_BY_PROTEIN_NAME,
    };
}

export function selectCellFor3DViewer(payload: number): SelectPointAction {
    return {
        payload,
        type: OPEN_CELL_IN_3D,
    };
}

export function toggleApplySelectionSetColors(payload: boolean): BoolToggleAction {
    return {
        payload,
        type: TOGGLE_APPLY_SELECTION_SET_COLOR,
    };
}

export function changeClusteringAlgorithm(payload: string): ChangeSelectionAction {
    return {
        payload,
        type: CHANGE_CLUSTERING_ALGORITHM,
    };
}

export function changeClusteringNumber(clusteringKey: string, payload: string): ChangeClusterNumberAction {
    return {
        clusteringKey,
        payload,
        type: CHANGE_CLUSTER_NUMBER,
    };
}

export function toggleShowClusters(payload: boolean): BoolToggleAction {
    return {
        payload,
        type: TOGGLE_CLUSTERS_VISIBLE,
    };
}

export function changeDownloadSettings(payload: DownloadConfig): ChangeDownloadConfigAction {
    return {
        payload,
        type: SELECT_DOWNLOAD_ID,
    };
}

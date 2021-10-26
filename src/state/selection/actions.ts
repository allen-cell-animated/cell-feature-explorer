import { URLSearchParamMap } from "../../util/UrlState";
import { FileInfo } from "../metadata/types";

import {
    CHANGE_AXIS,
    CHANGE_CLUSTER_NUMBER,
    CHANGE_CLUSTERING_ALGORITHM,
    CHANGE_HOVERED_GALLERY_CARD,
    CHANGE_HOVERED_POINT_ID,
    CHANGE_SELECTED_ALBUM,
    DESELECT_ALL_POINTS,
    DESELECT_GROUP_OF_POINTS,
    DESELECT_POINT,
    OPEN_CELL_IN_3D,
    SELECT_GROUP_VIA_PLOT,
    SELECT_POINT,
    SET_DOWNLOAD_CONFIG,
    SET_MOUSE_POSITION,
    SYNC_STATE_WITH_URL,
    TOGGLE_APPLY_SELECTION_SET_COLOR,
    TOGGLE_CLUSTERS_VISIBLE,
    TOGGLE_FILTER_BY_PROTEIN_NAME,
    TOGGLE_GALLERY_OPEN_CLOSE,
    CHANGE_DATASET,
    RECEIVE_FILE_INFO,
    REQUEST_CELL_FILE_INFO_BY_CELL_ID,
    SELECT_ARRAY_OF_POINTS,
    CLEAR_DATASET,
    SET_DISPLAYABLE_GROUPS,
} from "./constants";
import {
    BoolToggleAction,
    ChangeClusterNumberAction,
    ChangeDownloadConfigAction,
    ChangeHoveredPointAction,
    ChangeMousePositionAction,
    ChangeSelectionAction,
    ClearDatasetAction,
    DeselectPointAction,
    DownloadConfig,
    LassoOrBoxSelectAction,
    LassoOrBoxSelectPointData,
    MousePosition,
    RequestFileInfoByCellIDAction,
    ResetSelectionAction,
    SelectAlbumAction,
    SelectAxisAction,
    SelectedPointData,
    SelectPointAction,
    SetDisplayableGroupsAction,
} from "./types";

export function changeAxis(axisId: string, payload: string): SelectAxisAction {
    return {
        axisId,
        payload,
        type: CHANGE_AXIS,
    };
}

export function lassoOrBoxSelectGroup(key: string | number, payload: LassoOrBoxSelectPointData[]): LassoOrBoxSelectAction  {
    return {
        key,
        payload,
        type: SELECT_GROUP_VIA_PLOT,
    };
}

export function deselectGroupOfPoints(payload: string | number) {
    return {
        payload,
        type: DESELECT_GROUP_OF_POINTS,
    };
}

export function deselectPoint(payload: string): DeselectPointAction {
           return {
               payload,
               type: DESELECT_POINT,
           };
       }

export function selectPoint(payload: string): SelectPointAction {
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

export function selectCellFor3DViewer(payload: string): SelectPointAction {
    return {
        payload,
        type: OPEN_CELL_IN_3D,
    };
}

export function syncStateWithURL(payload: URLSearchParamMap) {
    return {
        payload,
        type: SYNC_STATE_WITH_URL,
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
        type: SET_DOWNLOAD_CONFIG,
    };
}

export function changeMousePosition(payload: MousePosition): ChangeMousePositionAction {
    return {
        payload,
        type: SET_MOUSE_POSITION,
    };
}

export function changeHoveredPoint(payload: SelectedPointData): ChangeHoveredPointAction {
           return {
               payload,
               type: CHANGE_HOVERED_POINT_ID,
           };
       }

export function setHoveredGalleryCard(payload: SelectedPointData): ChangeHoveredPointAction {
           return {
               payload,
               type: CHANGE_HOVERED_GALLERY_CARD,
           };
       }

export function selectAlbum(payload: number): SelectAlbumAction {
    return {
        payload,
        type: CHANGE_SELECTED_ALBUM,
    };
}

export function toggleGallery(payload: boolean): BoolToggleAction {
    return {
        payload,
        type: TOGGLE_GALLERY_OPEN_CLOSE,
    };
}

export function changeDataset(payload: string): ChangeSelectionAction {
           return {
               payload,
               type: CHANGE_DATASET,
           };
       }

export function clearDataset(): ClearDatasetAction {
    return {
        type: CLEAR_DATASET,
    };
}
       
export function receiveFileInfoDataForCell(payload: FileInfo) {
    return {
        payload,
        type: RECEIVE_FILE_INFO,
    };
}

export function requestCellFileInfoByCellId(payload: string): RequestFileInfoByCellIDAction {
    return {
        payload,
        type: REQUEST_CELL_FILE_INFO_BY_CELL_ID,
    };
}

export function requestCellFileInfoByArrayOfCellIds(payload: string[]) {
    return {
        payload,
        type: SELECT_ARRAY_OF_POINTS,
    };
}

export function setDisplayableGroups(payload: string[]): SetDisplayableGroupsAction {
    return {
        payload,
        type: SET_DISPLAYABLE_GROUPS,
    }
}
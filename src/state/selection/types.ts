import { SelectedGroups } from "..";
import { CELL_ID_KEY } from "../../constants";
import { FileInfo } from "../metadata/types";

export interface SelectionStateBranch {
    applySelectionSetColoring: boolean;
    cellSelectedFor3D: string;
    colorBy: string;
    dataset: string;
    downloadConfig: DownloadConfig;
    filterExclude: string[];
    galleryCollapsed: boolean;
    hoveredCardId: string;
    hoveredPointData: SelectedPointData | null;
    mousePosition: MousePosition;
    plotByOnX: string;
    plotByOnY: string;
    groupBy: string;
    defaultColors: string[];
    selectedAlbum: number;
    selectedGroupColors: { [key: string]: string };
    selectedGroups: SelectedGroups;
    selectedAlbumFileInfo: FileInfo[];
    selectedPoints: FileInfo[];
    initSelectedPoints: string[];
    thumbnailRoot: string;
    downloadRoot: string;
    volumeViewerDataRoot: string;
    alignActive: boolean;
}

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
    axisId: string;
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

export interface SelectPointAction {
    payload: {
        id: string;
        index?: number;
    };
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

export interface ChangeMousePositionAction {
    payload: MousePosition;
    type: string;
}

export interface SelectedPointData {
    [CELL_ID_KEY]: string;
    index: number;
    thumbnailPath: string;
    groupBy?: string;
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
}

export interface ClearDatasetAction {
    type: string;
}

export interface ChangeGroupByCategory {
    payload: string;
    type: string;
}

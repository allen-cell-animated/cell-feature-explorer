import { filter, pickBy, uniqBy } from "lodash";
import type { Action } from "redux";
import type { SelectedGroups } from "..";

import { CELL_ID_KEY } from "../../constants";
import type { FileInfo } from "../metadata/types";
import type { TypeToDescriptionMap } from "../types";
import { makeReducer } from "../util";

import {
    CHANGE_AXIS,
    CHANGE_HOVERED_GALLERY_CARD,
    CHANGE_HOVERED_POINT_ID,
    CHANGE_SELECTED_ALBUM,
    DESELECT_ALL_POINTS,
    DESELECT_GROUP_OF_POINTS,
    DESELECT_POINT,
    INITIAL_COLORS,
    INITIAL_SELECTED_ALBUM_ID,
    INITIAL_SELECTION_COLORS,
    OPEN_CELL_IN_3D,
    SELECT_GROUP_VIA_PLOT,
    SET_DOWNLOAD_CONFIG,
    SET_MOUSE_POSITION,
    TOGGLE_APPLY_SELECTION_SET_COLOR,
    TOGGLE_FILTER_BY_CATEGORY_NAME,
    TOGGLE_GALLERY_OPEN_CLOSE,
    SET_DATASET,
    RECEIVE_FILE_INFO_FOR_ALBUM_CELLS,
    RECEIVE_FILE_INFO_FOR_SELECTED_CELL,
    RECEIVE_FILE_INFO_FOR_SELECTED_ARRAY_OF_CELLS,
    CLEAR_DATASET,
    CHANGE_GROUP_BY_CATEGORY,
    SET_ALIGN_ACTIVE,
} from "./constants";
import {
    BoolToggleAction,
    ChangeDownloadConfigAction,
    ChangeGroupByCategory,
    ChangeHoveredPointAction,
    ChangeMousePositionAction,
    ChangeSelectedDatasetAction,
    ChangeSelectionAction,
    ClearDatasetAction,
    DeselectGroupOfPointsAction,
    DeselectPointAction,
    LassoOrBoxSelectAction,
    ReceiveCellFileInfoAction,
    ResetSelectionAction,
    SelectAlbumAction,
    SelectArrayOfPointsAction,
    SelectAxisAction,
    SelectionStateBranch,
    SelectPointAction,
} from "./types";

export const initialState = {
    applySelectionSetColoring: true,
    cellSelectedFor3D: "",
    colorBy: "",
    dataset: "",
    downloadConfig: {
        key: "",
        type: "",
    },
    filterExclude: [] as string[],
    galleryCollapsed: true,
    hoveredCardId: "",
    hoveredPointData: null,
    mousePosition: {
        pageX: 0,
        pageY: 0,
    },
    plotByOnX: "",
    plotByOnY: "",
    groupBy: "",
    defaultColors: INITIAL_COLORS,
    selectedAlbum: INITIAL_SELECTED_ALBUM_ID,
    selectedAlbumFileInfo: [] as FileInfo[],
    selectedGroupColors: {},
    selectedGroups: {} as SelectedGroups,
    selectedPoints: [] as FileInfo[],
    initSelectedPoints: [] as string[],
    thumbnailRoot: "",
    downloadRoot: "",
    volumeViewerDataRoot: "",
    alignActive: false,
};

const actionToConfigMap: TypeToDescriptionMap = {
    [SET_DATASET]: {
        accepts: (action: Action): action is ChangeSelectedDatasetAction =>
            action.type === SET_DATASET,
        perform: (state: SelectionStateBranch, action: ChangeSelectedDatasetAction) => {
            return {
                ...state,
                dataset: action.payload.dataset,
                thumbnailRoot: action.payload.thumbnailRoot,
                downloadRoot: action.payload.downloadRoot,
                volumeViewerDataRoot: action.payload.volumeViewerDataRoot,
            };
        },
    },
    [CLEAR_DATASET]: {
        accepts: (action: Action): action is ClearDatasetAction => action.type === CLEAR_DATASET,
        perform: () => {
            return { ...initialState };
        },
    },

    [CHANGE_AXIS]: {
        accepts: (action: Action): action is SelectAxisAction => action.type === CHANGE_AXIS,
        perform: (state: SelectionStateBranch, action: SelectAxisAction) => ({
            ...state,
            [action.axisId]: action.payload,
        }),
    },

    [CHANGE_GROUP_BY_CATEGORY]: {
        accepts: (action: Action): action is ChangeGroupByCategory =>
            action.type === CHANGE_GROUP_BY_CATEGORY,
        perform: (state: SelectionStateBranch, action: ChangeGroupByCategory) => ({
            ...state,
            groupBy: action.payload,
        }),
    },
    [OPEN_CELL_IN_3D]: {
        accepts: (action: Action): action is SelectPointAction =>
            action.type === OPEN_CELL_IN_3D,
        perform: (state: SelectionStateBranch, action: SelectPointAction) => ({
            ...state,
            cellSelectedFor3D: action.payload.id,
        }),
    },
    [SELECT_GROUP_VIA_PLOT]: {
        accepts: (action: Action): action is LassoOrBoxSelectAction =>
            action.type === SELECT_GROUP_VIA_PLOT,
        perform: (state: SelectionStateBranch, action: LassoOrBoxSelectAction) => ({
            ...state,
            selectedGroupColors: {
                ...state.selectedGroupColors,
                [action.key]: INITIAL_SELECTION_COLORS.splice(0, 1)[0],
            },
            selectedGroups: {
                ...state.selectedGroups,
                [action.key]: action.payload,
            },
        }),
    },
    [DESELECT_GROUP_OF_POINTS]: {
        accepts: (action: Action): action is DeselectGroupOfPointsAction =>
            action.type === DESELECT_GROUP_OF_POINTS,
        perform: (state: SelectionStateBranch, action: DeselectGroupOfPointsAction) => ({
            ...state,
            selectedGroupColors: pickBy(
                state.selectedGroupColors,
                (value, key) => key.toString() !== action.payload.toString()
            ),
            selectedGroups: pickBy(
                state.selectedGroups,
                (value, key) => key.toString() !== action.payload.toString()
            ),
        }),
    },
    [DESELECT_POINT]: {
        accepts: (action: Action): action is DeselectPointAction =>
            action.type === DESELECT_POINT,
        perform: (state: SelectionStateBranch, action: DeselectPointAction) => ({
            ...state,
            selectedPoints: filter(state.selectedPoints, (e) => e.CellId !== action.payload),
        }),
    },
    [DESELECT_ALL_POINTS]: {
        accepts: (action: Action): action is ResetSelectionAction =>
            action.type === DESELECT_ALL_POINTS,
        perform: (state: SelectionStateBranch) => ({
            ...state,
            selectedPoints: [...initialState.selectedPoints],
        }),
    },
    [TOGGLE_FILTER_BY_CATEGORY_NAME]: {
        accepts: (action: Action): action is ChangeSelectionAction =>
            action.type === TOGGLE_FILTER_BY_CATEGORY_NAME,
        perform: (state: SelectionStateBranch, action: ChangeSelectionAction) => ({
            ...state,
            filterExclude: action.payload,
        }),
    },
    [TOGGLE_APPLY_SELECTION_SET_COLOR]: {
        accepts: (action: Action): action is BoolToggleAction =>
            action.type === TOGGLE_APPLY_SELECTION_SET_COLOR,
        perform: (state: SelectionStateBranch, action: BoolToggleAction) => ({
            ...state,
            applySelectionSetColoring: action.payload,
        }),
    },
    [SET_DOWNLOAD_CONFIG]: {
        accepts: (action: Action): action is ChangeDownloadConfigAction =>
            action.type === SET_DOWNLOAD_CONFIG,
        perform: (state: SelectionStateBranch, action: ChangeDownloadConfigAction) => ({
            ...state,
            downloadConfig: action.payload,
        }),
    },
    [SET_MOUSE_POSITION]: {
        accepts: (action: Action): action is ChangeMousePositionAction =>
            action.type === SET_MOUSE_POSITION,
        perform: (state: SelectionStateBranch, action: ChangeMousePositionAction) => ({
            ...state,
            mousePosition: action.payload,
        }),
    },
    [CHANGE_HOVERED_POINT_ID]: {
        accepts: (action: Action): action is ChangeHoveredPointAction =>
            action.type === CHANGE_HOVERED_POINT_ID,
        perform: (state: SelectionStateBranch, action: ChangeHoveredPointAction) => ({
            ...state,
            hoveredPointData: action.payload,
        }),
    },
    [CHANGE_HOVERED_GALLERY_CARD]: {
        accepts: (action: Action): action is ChangeHoveredPointAction =>
            action.type === CHANGE_HOVERED_GALLERY_CARD,
        perform: (state: SelectionStateBranch, action: ChangeHoveredPointAction) => ({
            ...state,
            hoveredCardId: action.payload,
        }),
    },
    [CHANGE_SELECTED_ALBUM]: {
        accepts: (action: Action): action is SelectAlbumAction =>
            action.type === CHANGE_SELECTED_ALBUM,
        perform: (state: SelectionStateBranch, action: SelectAlbumAction) => ({
            ...state,
            selectedAlbum: action.payload,
        }),
    },
    [TOGGLE_GALLERY_OPEN_CLOSE]: {
        accepts: (action: Action): action is BoolToggleAction =>
            action.type === TOGGLE_GALLERY_OPEN_CLOSE,
        perform: (state: SelectionStateBranch, action: BoolToggleAction) => ({
            ...state,
            galleryCollapsed: action.payload,
        }),
    },
    [RECEIVE_FILE_INFO_FOR_SELECTED_CELL]: {
        accepts: (action: Action): action is SelectPointAction =>
            action.type === RECEIVE_FILE_INFO_FOR_SELECTED_CELL,
        perform: (state: SelectionStateBranch, action: SelectPointAction) => ({
            ...state,
            selectedPoints: uniqBy([...state.selectedPoints, action.payload], CELL_ID_KEY),
        }),
    },
    [RECEIVE_FILE_INFO_FOR_SELECTED_ARRAY_OF_CELLS]: {
        accepts: (action: Action): action is SelectArrayOfPointsAction =>
            action.type === RECEIVE_FILE_INFO_FOR_SELECTED_ARRAY_OF_CELLS,
        perform: (state: SelectionStateBranch, action: SelectArrayOfPointsAction) => ({
            ...state,
            selectedPoints: uniqBy([...state.selectedPoints, ...action.payload], CELL_ID_KEY),
        }),
    },
    [RECEIVE_FILE_INFO_FOR_ALBUM_CELLS]: {
        accepts: (action: Action): action is ReceiveCellFileInfoAction =>
            action.type === RECEIVE_FILE_INFO_FOR_ALBUM_CELLS,
        perform: (state: SelectionStateBranch, action: ReceiveCellFileInfoAction) => ({
            ...state,
            selectedAlbumFileInfo: action.payload,
        }),
    },
    [SET_ALIGN_ACTIVE]: {
        accepts: (action: Action): action is BoolToggleAction =>
            action.type === SET_ALIGN_ACTIVE,
        perform: (state: SelectionStateBranch, action: BoolToggleAction) => ({
            ...state,
            alignActive: action.payload,
        }),
    },
};

export default makeReducer<SelectionStateBranch>(actionToConfigMap, initialState);

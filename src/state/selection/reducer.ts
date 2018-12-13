import {
    filter,
    pickBy,
} from "lodash";
import { AnyAction } from "redux";

import { KMEANS_KEY } from "../../constants";
import { TypeToDescriptionMap } from "../types";
import { makeReducer } from "../util";

import {
    CHANGE_AXIS,
    CHANGE_CLUSTER_NUMBER,
    CHANGE_CLUSTERING_ALGORITHM,
    DESELECT_ALL_POINTS,
    DESELECT_GROUP_OF_POINTS,
    DESELECT_POINT,
    INITIAL_COLOR_BY,
    INITIAL_COLORS,
    INITIAL_PLOT_BY_ON_X,
    INITIAL_PLOT_BY_ON_Y,
    INITIAL_SELECTION_COLORS,
    OPEN_CELL_IN_3D,
    SELECT_GROUP,
    SELECT_POINT,
    SET_DOWNLOAD_CONFIG,
    TOGGLE_APPLY_SELECTION_SET_COLOR,
    TOGGLE_CLUSTERS_VISIBLE,
    TOGGLE_FILTER_BY_PROTEIN_NAME,
} from "./constants";
import {
    BoolToggleAction,
    ChangeClusterNumberAction,
    ChangeDownloadConfigAction,
    ChangeSelectionAction,
    DeselectGroupOfPointsAction,
    DeselectPointAction,
    ResetSelectionAction,
    SelectAxisAction, SelectCellIn3DAction,
    SelectGroupOfPointsAction,
    SelectionStateBranch,
    SelectPointAction,
} from "./types";

export const initialState = {
    applySelectionSetColoring: true,
    cellSelectedFor3D: null,
    clusteringAlgorithm: KMEANS_KEY,
    clusteringDistance: "",
    colorBy: INITIAL_COLOR_BY,
    downloadConfig: {
        key: "",
        type: "",
    },
    filterExclude: [],
    numberOfClusters: "",
    plotByOnX: INITIAL_PLOT_BY_ON_X,
    plotByOnY: INITIAL_PLOT_BY_ON_Y,
    proteinColors: INITIAL_COLORS,
    selectedGroupColors: {},
    selectedGroups: {},
    selectedPoints: [],
    showClusters: false,
};

const actionToConfigMap: TypeToDescriptionMap = {

    [CHANGE_AXIS]: {
        accepts: (action: AnyAction): action is SelectAxisAction => action.type === CHANGE_AXIS,
        perform: (state: SelectionStateBranch, action: SelectAxisAction) => ({
            ...state,
            [action.axisId]: action.payload,
        }),
    },
    [OPEN_CELL_IN_3D] : {
        accepts: (action: AnyAction): action is SelectCellIn3DAction => action.type === OPEN_CELL_IN_3D,
        perform: (state: SelectionStateBranch, action: ChangeSelectionAction) => ({
            ...state,
            cellSelectedFor3D: action.payload,
        }),
    },
    [SELECT_GROUP]: {
        accepts: (action: AnyAction): action is SelectGroupOfPointsAction => action.type === SELECT_GROUP,
        perform: (state: SelectionStateBranch, action: SelectGroupOfPointsAction) => ({
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
        accepts: (action: AnyAction): action is DeselectGroupOfPointsAction => action.type === DESELECT_GROUP_OF_POINTS,
        perform: (state: SelectionStateBranch, action: DeselectGroupOfPointsAction) => ({
            ...state,
            selectedGroupColors: pickBy(state.selectedGroupColors,
                (value, key) => key.toString() !== action.payload.toString()),
            selectedGroups: pickBy(state.selectedGroups, (value, key) => key.toString() !== action.payload.toString()),
        }),
    },
    [DESELECT_POINT]: {
        accepts: (action: AnyAction): action is DeselectPointAction => action.type === DESELECT_POINT,
        perform: (state: SelectionStateBranch, action: DeselectPointAction) => ({
            ...state,
            selectedPoints : filter(state.selectedPoints, (e) => e !== action.payload),
        }),
    },
    [SELECT_POINT]: {
        accepts: (action: AnyAction): action is SelectPointAction => action.type === SELECT_POINT,
        perform: (state: SelectionStateBranch, action: SelectPointAction) => ({
            ...state,
            selectedPoints : [...state.selectedPoints, action.payload],
        }),
    },
    [DESELECT_ALL_POINTS]: {
        accepts: (action: AnyAction): action is ResetSelectionAction => action.type === DESELECT_ALL_POINTS,
        perform: (state: SelectionStateBranch, action: ResetSelectionAction) => ({
            ...state,
            selectedPoints: [...initialState.selectedPoints],
        }),
    },
    [TOGGLE_FILTER_BY_PROTEIN_NAME]: {
        accepts: (action: AnyAction): action is ChangeSelectionAction => action.type === TOGGLE_FILTER_BY_PROTEIN_NAME,
        perform: (state: SelectionStateBranch, action: ChangeSelectionAction) => ({

                ...state,
                filterExclude: action.payload,

        }),
    },
    [TOGGLE_APPLY_SELECTION_SET_COLOR] : {
        accepts: (action: AnyAction): action is BoolToggleAction =>
            action.type === TOGGLE_APPLY_SELECTION_SET_COLOR,
        perform: (state: SelectionStateBranch, action: BoolToggleAction) => ({
            ...state,
            applySelectionSetColoring: action.payload,
        }),
    },
    [CHANGE_CLUSTERING_ALGORITHM] : {
        accepts: (action: AnyAction): action is ChangeSelectionAction => action.type === CHANGE_CLUSTERING_ALGORITHM,
        perform: (state: SelectionStateBranch, action: ChangeSelectionAction) => ({
            ...state,
            clusteringAlgorithm: action.payload,
        }),
    },
    [CHANGE_CLUSTER_NUMBER]: {
        accepts: (action: AnyAction): action is ChangeClusterNumberAction => action.type === CHANGE_CLUSTER_NUMBER,
        perform: (state: SelectionStateBranch, action: ChangeClusterNumberAction) => ({
            ...state,
            [action.clusteringKey]: action.payload,
        }),
    },
    [TOGGLE_CLUSTERS_VISIBLE]: {
        accepts: (action: AnyAction): action is BoolToggleAction => action.type === TOGGLE_CLUSTERS_VISIBLE,
        perform: (state: SelectionStateBranch, action: BoolToggleAction) => ({
            ...state,
            showClusters: action.payload,
        }),
    },
    [SET_DOWNLOAD_CONFIG]: {
        accepts: (action: AnyAction): action is ChangeDownloadConfigAction => action.type === SET_DOWNLOAD_CONFIG,
        perform: (state: SelectionStateBranch, action: ChangeDownloadConfigAction) => ({
            ...state,
            downloadConfig: action.payload,
        }),
    },
};

export default makeReducer<SelectionStateBranch>(actionToConfigMap, initialState);

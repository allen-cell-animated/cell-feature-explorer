import { filter, includes } from "lodash";
import { AnyAction } from "redux";

import { TypeToDescriptionMap } from "../types";
import { makeReducer } from "../util";

import {
    CHANGE_AXIS,
    DESELECT_ALL_POINTS,
    DESELECT_POINT,
    INITIAL_COLOR_BY,
    INITIAL_COLORS,
    INITIAL_PLOT_BY_ON_X,
    INITIAL_PLOT_BY_ON_Y,
    OPEN_CELL_IN_3D,
    SELECT_GROUP,
    SELECT_POINT,
    TOGGLE_FILTER_BY_PROTEIN_NAME,
} from "./constants";
import {
    DeselectPointAction,
    ResetSelectionAction,
    SelectAxisAction,
    SelectCellFor3DAction,
    SelectGroupOfPointsAction,
    SelectionStateBranch,
    SelectPointAction,
    ToggleFilterAction,
} from "./types";

export const initialState = {
    cellSelectedFor3D: null,
    colorBy: INITIAL_COLOR_BY,
    filterExclude: [],
    plotByOnX: INITIAL_PLOT_BY_ON_X,
    plotByOnY: INITIAL_PLOT_BY_ON_Y,
    proteinColors: INITIAL_COLORS,
    selectedGroupColors: INITIAL_COLORS,
    selectedGroups: {},
    selectedPoints: [],
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
        accepts: (action: AnyAction): action is SelectCellFor3DAction => action.type === OPEN_CELL_IN_3D,
        perform: (state: SelectionStateBranch, action: SelectGroupOfPointsAction) => ({
            ...state,
            cellSelectedFor3D: action.payload,
        }),
    },
    [SELECT_GROUP]: {
        accepts: (action: AnyAction): action is SelectGroupOfPointsAction => action.type === SELECT_GROUP,
        perform: (state: SelectionStateBranch, action: SelectGroupOfPointsAction) => ({
            ...state,
            selectedGroups: {
                ...state.selectedGroups,
                [action.key]: action.payload,
            },
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
        accepts: (action: AnyAction): action is ToggleFilterAction => action.type === TOGGLE_FILTER_BY_PROTEIN_NAME,
        perform: (state: SelectionStateBranch, action: ToggleFilterAction) => ({

                ...state,
                filterExclude: includes(state.filterExclude, action.payload) ?
                    filter(state.filterExclude, (e) => e !== action.payload) : [...state.filterExclude, action.payload],

        }),
    },
};

export default makeReducer<SelectionStateBranch>(actionToConfigMap, initialState);

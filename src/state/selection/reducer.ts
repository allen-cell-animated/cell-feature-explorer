import { filter } from "lodash";
import { AnyAction } from "redux";

import { TypeToDescriptionMap } from "../types";
import { makeReducer } from "../util";

import {
    CHANGE_AXIS,
    DESELECT_POINT,
    INITIAL_COLOR_BY,
    INITIAL_COLORS,
    INITIAL_PLOT_BY_ON_X,
    INITIAL_PLOT_BY_ON_Y,
    SELECT_GROUP,
    SELECT_POINT,
} from "./constants";
import {
    DeselectPointAction,
    SelectAxisAction,
    SelectGroupOfPointsAction,
    SelectionStateBranch,
    SelectPointAction,
} from "./types";

export const initialState = {
    colorBy: INITIAL_COLOR_BY,
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
};

export default makeReducer<SelectionStateBranch>(actionToConfigMap, initialState);

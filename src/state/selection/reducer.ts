import { filter } from "lodash";
import { AnyAction } from "redux";

import { TypeToDescriptionMap } from "../types";
import { makeReducer } from "../util";

import {
    CHANGE_AXIS,
    DESELECT_POINT,
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
    colorBy: "structureProteinName",
    plotByOnX: "Nuclear volume (fL)",
    plotByOnY: "Cellular volume (fL)",
    proteinColors: [
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
        "#b15928",
    ],
    selectedGroupColors: [
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
        "#b15928",
    ],
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

import { makeConstant } from "../util";

export const CHANGE_AXIS = makeConstant("selection", "deselect-file");
export const SELECT_GROUP = makeConstant("selection", "select_group");
export const DESELECT_POINT = makeConstant("selection", "deselect-point");
export const SELECT_POINT = makeConstant("selection", "select-point");

export const INITIAL_COLOR_BY = "structureProteinName";
export const INITIAL_PLOT_BY_ON_X = "Nuclear volume (fL)";
export const INITIAL_PLOT_BY_ON_Y = "Cellular volume (fL)";
export const INITIAL_COLORS = [
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
];

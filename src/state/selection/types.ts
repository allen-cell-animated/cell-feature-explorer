import { Color } from "plotly.js";

import { MetadataStateBranch } from "../metadata/types";

export type MenuSelectionChoices = "structureProteinName" | "cellularFeatures" |  "clusters";

export interface SelectionStateBranch {
    [key: string]: any;
}

export interface SelectedGroups {
    [key: number]: number[];
    [key: string]: number[];
}

export interface SelectGroupOfPointsAction {
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

export interface ResetSelectionAction {
    type: string;
}

export interface ToggleFilterAction {
    payload: string;
    type: string;
}

export interface SelectCellFor3DAction {
    payload: string;
    type: string;
}

export interface ToggleApplyColorAction {
    payload: boolean;
    type: string;
}

export interface SelectedGroupDatum {
    colorBy: number[] | string[];
    groupColor: Color[];
    x: number[];
    y: number[];
}

export interface SelectedGroupData {
    [key: number]: SelectedGroupDatum[];
    [key: string]: SelectedGroupDatum[];
}

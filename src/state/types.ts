import { AxiosInstance } from "axios";
import { Color } from "plotly.js";
import { AnyAction } from "redux";

import { MetadataStateBranch } from "./metadata/types";
import { SelectionStateBranch } from "./selection/types";

export type NumberOrString = number | string;

export interface ActionDescription {
    accepts: (action: AnyAction) => boolean;
    perform: (state: any, action: any) => any;
}

export interface BatchedAction {
    type: string;
    batch: boolean;
    payload: AnyAction[];
}

export interface ReduxLogicDeps {
    action: AnyAction;
    baseApiUrl: string;
    httpClient: AxiosInstance;
    getState: () => State;
    ctx?: any;
}

export type ReduxLogicNextCb = (action: AnyAction) => void;

export interface State {
    metadata: MetadataStateBranch;
    selection: SelectionStateBranch;
}

export interface TypeToDescriptionMap {
    [propName: string ]: ActionDescription;
}

export interface Annotation {
    cellLine: string;
    cellID: string;
    fovID: string;
    pointIndex: number;
    x: number;
    y: number;
}

export interface Thumbnail {
    pointIndex: number;
    src: string;
    cellID: string;
    empty?: boolean;
}

export interface SelectedGroupDatum {
    groupColor: Color;
    x: number;
    y: number;
}

export interface ContinuousPlotData {
    color: Color | Color[] | number | number[];
    x: number[];
    y: number[];
    groupBy?: boolean;
    plotName?: string;
    opacity?: number[] | number;
    groupColors?: Color[];
}

interface GroupSettings {
    name: string;
    color: Color | number;
    opacity: number;
}
export interface GroupedPlotData {
    x: number[];
    y: number[];
    groupBy: boolean;
    groups: string[];
    groupSettings: GroupSettings[];
    plotName?: string;
}

export interface SelectedGroup {
    groupColor: Color[];
    x: number[];
    y: number[];
}

export interface SelectedGroupData {
    [key: string]: SelectedGroupDatum[];
}

export interface SelectedGroups {
    [key: number]: number[];
    [key: string]: number[];
}

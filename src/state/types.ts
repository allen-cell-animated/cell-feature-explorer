import { AxiosInstance } from "axios";
import { Color } from "plotly.js";
import { AnyAction } from "redux";

import { MetadataStateBranch } from "./metadata/types";
import { SelectionStateBranch } from "./selection/types";
import { ImageDataset} from "./image-dataset/types";

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
    httpClient: AxiosInstance;
    imageDataSet: ImageDataset;
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
    hovered: boolean;
    fovID: string;
    pointIndex: number;
    thumbnailPath: string;
    x: number;
    y: number;
}

export interface Thumbnail {
    downloadHref: string;
    labeledStructure: string;
    mitoticStage: string;
    src: string;
    cellID: string;
    empty?: boolean;
    fullFieldDownloadHref: string;
}

export interface SelectedGroupDatum {
    groupColor: Color;
    x: number;
    y: number;
}

export interface ContinuousPlotData {
    color: Color | Color[] | number | number[];
    ids?: string[];
    x: number[];
    y: number[];
    customdata?: string[];
    opacity?: number[];
    groupBy?: boolean;
    plotName?: string;
    groupColors?: Color[];
}

interface GroupSettings {
    name: string;
    color: Color | number;
}
export interface GroupedPlotData {
    ids?: string[];
    x: number[];
    y: number[];
    customdata?: string[];
    groupBy: boolean;
    groups: number[] | string[];
    groupSettings: GroupSettings[] | null;
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

export interface Album {
    album_id: number | string;
    cell_ids: number[];
    title: string;
}

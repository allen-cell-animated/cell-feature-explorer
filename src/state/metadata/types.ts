export interface MetadataStateBranch {
    [key: string]: any;
}

export interface FeatureData {
    [key: string]: number | string;
}

export interface ReceiveAction {
    payload: MetadataStateBranch;
    type: string;
}

export interface RequestAction {
    type: string;
}

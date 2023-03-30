import { Timestamp } from "@firebase/firestore-types";

import { ViewerChannelSettings } from "@aics/web-3d-viewer/type-declarations";

import { DataForPlot, FileInfo, MeasuredFeatureDef } from "../metadata/types";
import { Album } from "../types";

export interface InitialDatasetSelections {
    defaultXAxis: string;
    defaultYAxis: string;
    defaultColorBy: string;
    defaultGroupBy: string;
    thumbnailRoot: string;
    downloadRoot: string;
    volumeViewerDataRoot: string;
}

export interface DatasetMetaData {
    name: string;
    title: string;
    version: string;
    id: string;
    description: string;
    image: string;
    index: number;
    link?: string;
    manifest?: string;
    production?: boolean;
    userData: {
        isNew: boolean;
        inReview: boolean;
        totalTaggedStructures: number;
        totalCells: number;
        totalFOVs: number;
    };
}

interface Publication {
    citation: string;
    title: string;
    url: string;
}

export interface Megaset {
    name: string;
    title: string;
    production: boolean;
    dateCreated: Timestamp;
    datasets: {
        [key: string]: DatasetMetaData
    };
    extra?: string;
    publications?: Publication[];
}

export interface ImageDataset {
    selectDataset(manifest: any): Promise<InitialDatasetSelections>;
    getAvailableDatasets(): Promise<Megaset[]>;
    getViewerChannelSettings(): Promise<ViewerChannelSettings>;
    getFeatureData(): Promise<DataForPlot | void>;
    getAlbumData(): Promise<Album[]>;
    getMeasuredFeatureDefs(): Promise<MeasuredFeatureDef[]>;
    getFileInfoByCellId(id: string): Promise<FileInfo | undefined>;
    getFileInfoByArrayOfCellIds(ids: string[]): Promise<(FileInfo | undefined)[]>;
}

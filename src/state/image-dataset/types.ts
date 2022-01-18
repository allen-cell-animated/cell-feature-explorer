import { CellLineDef, DataForPlot, FileInfo, MeasuredFeatureDef } from "../metadata/types";
import { Album } from "../types";

import { ViewerChannelSettings } from "@aics/web-3d-viewer/type-declarations";

export interface InitialDatasetSelections {
    defaultXAxis: string;
    defaultYAxis: string;
    defaultColorBy: string;
    thumbnailRoot: string;
    downloadRoot: string;
    volumeViewerDataRoot: string;
}

export interface ImageDataset {
    selectDataset(manifest: any): Promise<InitialDatasetSelections>;
    getAvailableDatasets(): Promise<Megaset[]>;
    getCellLineDefs(): Promise<CellLineDef[]>;
    getViewerChannelSettings(): Promise<ViewerChannelSettings>;
    getFeatureData(): Promise<DataForPlot>;
    getAlbumData(): Promise<Album[]>;
    getMeasuredFeatureDefs(): Promise<MeasuredFeatureDef[]>;
    getFileInfoByCellId(id: string): Promise<FileInfo | undefined>;
    getFileInfoByArrayOfCellIds(ids: string[]): Promise<(FileInfo | undefined)[]>;
}

export interface DatasetMetaData {
    name: string;
    title: string;
    version: string;
    id: string;
    description: string;
    image: string;
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
    datasets: {
        [key: string]: DatasetMetaData
    };
    publications?: Publication[];
}
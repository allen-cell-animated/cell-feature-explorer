import { DatasetMetaData } from "../../constants/datasets";
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
    getAvailableDatasets(): Promise<DatasetMetaData[]>;
    getCellLineDefs(): Promise<CellLineDef[]>;
    getViewerChannelSettings(): Promise<ViewerChannelSettings>;
    getFeatureData(): Promise<DataForPlot>;
    getAlbumData(): Promise<Album[]>;
    getMeasuredFeatureDefs(): Promise<MeasuredFeatureDef[]>;
    getFileInfoByCellId(id: string): Promise<FileInfo | undefined>;
    getFileInfoByArrayOfCellIds(ids: string[]): Promise<(FileInfo | undefined)[]>;
}

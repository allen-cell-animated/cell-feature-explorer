import { DatasetMetaData } from "../../constants/datasets";
import { CellLineDef, FileInfo, MeasuredFeatureDef, MetadataStateBranch } from "../metadata/types";
import { Album } from "../types";

export interface InitialDatasetSelections {
    defaultXAxis: string;
    defaultYAxis: string;
    thumbnailRoot: string;
    downloadRoot: string;
    volumeViewerDataRoot: string;
}

export interface ImageDataset {
    selectDataset(manifest: any): Promise<InitialDatasetSelections>;
    getAvailableDatasets(): Promise<DatasetMetaData[]>;
    getCellLineDefs(): Promise<CellLineDef[]>;
    getFeatureData(): Promise<MetadataStateBranch>;
    getAlbumData(): Promise<Album[]>;
    getMeasuredFeatureDefs(): Promise<MeasuredFeatureDef[]>;
    getFileInfoByCellId(id: string): Promise<FileInfo | undefined>;
    getFileInfoByArrayOfCellIds(ids: string[]): Promise<FileInfo[] | undefined>;
}

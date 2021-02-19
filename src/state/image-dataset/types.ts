import { DatasetMetaData } from "../../constants/datasets";
import { CellLineDef, FileInfo, MeasuredFeatureDef, MetadataStateBranch } from "../metadata/types";
import { Album } from "../types";

export interface InitialDatasetSelections {
    defaultXAxis:string;
    defaultYAxis: string;
}

export interface ImageDataset {
    selectDataset(manifest: any): Promise<InitialDatasetSelections>;
    getAvailableDatasets(): Promise<DatasetMetaData[]>;
    getCellLineDefs(): Promise<CellLineDef[]>;
    getFeatureData(): Promise<MetadataStateBranch>;
    getAlbumData(): Promise<Album[]>;
    getMeasuredFeatureNames?(): Promise<MeasuredFeatureDef[]>;
    getFileInfo?(): Promise<FileInfo[]>;
}

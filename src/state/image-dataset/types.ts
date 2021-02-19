import { DatasetMetaData } from "../../constants/datasets";
import { CellLineDef, MetadataStateBranch } from "../metadata/types";
import { Album } from "../types";

export interface InitialDatasetSelections {
    defaultXAxis:string;
    defaultYAxis: string;
}

export interface ImageDataset {
    selectDataset(manifest: any): Promise<InitialDatasetSelections>;
    getAvailableDatasets(): Promise<DatasetMetaData[]>;
    getCellLineData(): Promise<CellLineDef>;
    getFeatureData(): Promise<MetadataStateBranch[]>;
    getAlbumData(): Promise<Album[]>;
}

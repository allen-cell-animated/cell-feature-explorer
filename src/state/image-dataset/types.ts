import { DatasetMetaData } from "../../constants/datasets";
import { CellLineDef, MetadataStateBranch } from "../metadata/types";
import { Album } from "../types";

export interface ImageDataset {
    getAvailableDatasets(): Promise<DatasetMetaData[]>;
    getCellLineData(): Promise<CellLineDef>;
    getFeatureData(): Promise<MetadataStateBranch[]>;
    getAlbumData(): Promise<Album[]>;
}

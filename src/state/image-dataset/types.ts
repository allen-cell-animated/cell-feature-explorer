import { CellLineDef, MetadataStateBranch } from "../metadata/types";
import { Album } from "../types";

export interface ImageDataset {
    getCellLineData(): Promise<CellLineDef>;
    getFeatureData(xDataKey?: string, yDataKey?: string, colorByKey?: string): Promise<MetadataStateBranch[]>;
    getAlbumData(): Promise<Album[]>;
    getMeasuredFeatureNames?(): Promise<MetadataStateBranch[]>;
}

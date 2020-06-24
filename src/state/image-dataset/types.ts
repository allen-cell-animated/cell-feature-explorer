import { CellLineDef, MetadataStateBranch } from "../metadata/types";
import { Album } from "../types";

export interface ImageDataset {
    getCellLineData(): Promise<CellLineDef>;
    getFeatureData(): Promise<MetadataStateBranch[]>;
    getAlbumData(): Promise<Album[]>;
}

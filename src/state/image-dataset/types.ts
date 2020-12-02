import { QueryDocumentSnapshot } from "@firebase/firestore-types";

import { CellLineDef, FileInfo, MeasuredFeatureDef, MetadataStateBranch } from "../metadata/types";
import { Album } from "../types";

export interface PageReturn {
    dataset: MetadataStateBranch | null;
    next?: any;
}
export interface ImageDataset {
    getCellLineData(): Promise<CellLineDef[]>;
    getFeatureData(): Promise<PageReturn>;
    getAlbumData(): Promise<Album[]>;
    getMeasuredFeatureNames?(): Promise<MeasuredFeatureDef[]>;
    getFileInfo?(): Promise<FileInfo[]>;
    getPageOfFeatureData?(lastVisible: QueryDocumentSnapshot): Promise<PageReturn>;
}

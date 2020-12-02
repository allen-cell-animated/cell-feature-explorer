import { DocumentReference, QueryDocumentSnapshot, QuerySnapshot } from "@firebase/firestore-types";
import { map } from "lodash";

import {
    ARRAY_OF_CELL_IDS_KEY,
    CELL_COUNT_KEY,
    CELL_LINE_DEF_NAME_KEY,
    CELL_LINE_DEF_PROTEIN_KEY,
    CELL_LINE_DEF_STRUCTURE_KEY,
    PROTEIN_NAME_KEY,
} from "../../../constants";
import {
    CellLineDef,
    FileInfo,
    MeasuredFeatureDef,
    MetadataStateBranch,
} from "../../metadata/types";
import { Album } from "../../types";
import { ALBUMS_FILENAME, CELL_LINE_DEF_FILENAME } from "../constants";
import { ImageDataset } from "../types";

import { firestore } from "./configure-firebase";

const CFE_DATASETS = "cfe-datasets";
const VERSION = "v2";
const CELL_FILE_INFO_COLLECTION = "cell-file-info";
const CELL_FEATURES_COLLECTION = "measured-features-values";
const CELL_FEATURE_DEFS_COLLECTION = "measured-features-names";

class FirebaseRequest implements ImageDataset {
    private collectionRef: DocumentReference;
    constructor() {
        this.collectionRef = firestore.collection(CFE_DATASETS).doc(VERSION);
    }

    private getDoc = (collection: string, docId: string) => {
        return this.collectionRef.collection(collection).doc(docId).get();
    };

    private getCollection = (collection: string, limit?: number) => {
        if (limit) {
            return this.collectionRef.collection(collection).limit(limit).get();
        }
        return this.collectionRef.collection(collection).get();
    };

    private getPage = (collection: string, limit: number, startAfter: QueryDocumentSnapshot) => {
        if (limit) {
        }
        return this.collectionRef.collection(collection).startAfter(startAfter).limit(limit).get();
    };

    public getCellLineData = () => {
        return this.getCollection(CELL_LINE_DEF_FILENAME).then((snapshot: QuerySnapshot) => {
            const dataset: CellLineDef[] = [];
            snapshot.forEach((doc: QueryDocumentSnapshot) => {
                const datum = doc.data();
                if (datum[CELL_COUNT_KEY] > 0) {
                    dataset.push({
                        [CELL_LINE_DEF_NAME_KEY]: datum[CELL_LINE_DEF_NAME_KEY],
                        [CELL_LINE_DEF_STRUCTURE_KEY]: datum[CELL_LINE_DEF_STRUCTURE_KEY],
                        [PROTEIN_NAME_KEY]: datum[CELL_LINE_DEF_PROTEIN_KEY],
                        [CELL_COUNT_KEY]: datum[CELL_COUNT_KEY],
                    });
                }
            });
            return dataset;
        });
    };

    public getFileInfo = () => {
        return this.getCollection(CELL_FILE_INFO_COLLECTION).then((snapshot) => {
            const dataset: FileInfo[] = [];
            snapshot.forEach((doc) => dataset.push(doc.data() as FileInfo));
            return dataset;
        });
    };

    public getFileInfoByCellId = (cellId: string) => {
        return this.getDoc(CELL_FILE_INFO_COLLECTION, cellId).then((doc) => doc.data());
    };

    public getFileInfoByArrayOfCellIds = (cellIds: string[]) => {
        Promise.all(cellIds.map((id) => {
            return this.getDoc(CELL_FILE_INFO_COLLECTION, id).then((doc) => doc.data());
        }))
    };

    public getPageOfFeatureData = async (lastVisible: QueryDocumentSnapshot) => {
        const snapshot = await this.getPage(CELL_FEATURES_COLLECTION, 10000, lastVisible);
        if (!snapshot.empty) {
            const dataset: MetadataStateBranch = {
                [ARRAY_OF_CELL_IDS_KEY]: [],
            };
            snapshot.forEach((doc: QueryDocumentSnapshot) => {
                dataset[ARRAY_OF_CELL_IDS_KEY].push(doc.id);
                const data = doc.data();
                map(data, (value, key) => {
                    if (!dataset[key]) {
                        dataset[key] = [];
                    }
                    dataset[key].push(value);
                });
            });
            return {
                dataset,
                next: snapshot.docs[snapshot.docs.length - 1],
            };
        } else {
            return { dataset: null };
        }
    };

    public getFeatureData = () => {
        return this.getCollection(CELL_FEATURES_COLLECTION, 10000).then(
            (snapshot: QuerySnapshot) => {
                if (!snapshot.empty) {
                    const dataset: MetadataStateBranch = {
                        [ARRAY_OF_CELL_IDS_KEY]: [],
                    };
                    snapshot.forEach((doc: QueryDocumentSnapshot) => {
                        dataset[ARRAY_OF_CELL_IDS_KEY].push(doc.id);
                        const data = doc.data();
                        map(data, (value, key) => {
                            if (!dataset[key]) {
                                dataset[key] = [];
                            }
                            dataset[key].push(value);
                        });
                    });
                    return {
                        dataset,
                        next: snapshot.docs[snapshot.docs.length - 1],
                    };
                } else {
                    return { dataset: null };
                }
            }
        );
    };

    public getMeasuredFeatureNames = async () => {
        const snapshot = await this.getCollection(CELL_FEATURE_DEFS_COLLECTION);
        const dataset: MeasuredFeatureDef[] = [];
        snapshot.forEach((doc: QueryDocumentSnapshot) => {
            dataset.push(doc.data() as MeasuredFeatureDef);
        });
        return dataset;
    };

    public getAlbumData = () => {
        return this.getCollection(ALBUMS_FILENAME).then((snapshot: QuerySnapshot) => {
            const dataset: Album[] = [];
            snapshot.forEach((doc: QueryDocumentSnapshot) => {
                dataset.push(doc.data() as Album);
            });
            return dataset;
        });
    };
}

export default FirebaseRequest;

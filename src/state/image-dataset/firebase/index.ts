import {
    DocumentReference,
    QueryDocumentSnapshot,
    QuerySnapshot,
} from "@firebase/firestore-types";
import { map } from "lodash";

import {
    ARRAY_OF_CELL_IDS_KEY,
    CELL_LINE_DEF_NAME_KEY,
    CELL_LINE_DEF_PROTEIN_KEY,
    CELL_LINE_DEF_STRUCTURE_KEY,
    PROTEIN_NAME_KEY,
} from "../../../constants";
import { DatasetMetaData } from "../../../constants/datasets";
import { CellLineDef, FileInfo, MeasuredFeatureDef, MetadataStateBranch } from "../../metadata/types";
import { Album } from "../../types";
import {
    ALBUMS_FILENAME,
    CELL_LINE_DEF_FILENAME,
} from "../constants";
import { ImageDataset } from "../types";

import { firestore } from "./configure-firebase";

class FirebaseRequest implements ImageDataset {
    private collectionRef: DocumentReference;
    private featureDefs: string;
    private featuresData: string;
    private cellLineData: string;
    private thumbnailRoot: string;
    private downloadRoot: string;
    private volumeViewerDataRoot: string;
    private featuresDisplayOrder: string;
    constructor() {
        this.featureDefs = "";
        this.featuresData = "";
        this.cellLineData = "";
        this.thumbnailRoot = "";
        this.downloadRoot = "";
        this.volumeViewerDataRoot = "";
        this.featuresDisplayOrder = "";
        this.collectionRef = firestore.collection("cfe-datasets").doc("v1");
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

    public getAvailableDatasets = () => {
        return firestore
            .collection("dataset-descriptions")
            .get()
            .then((snapShot: QuerySnapshot) => {
                const datasets: DatasetMetaData[] = [];
                snapShot.forEach((doc) => datasets.push(doc.data() as DatasetMetaData));
                return datasets;
            });
    };

    public setCollectionRef = (id: string) => {
        this.collectionRef = firestore.collection("cfe-datasets").doc(id);
    };

    private getManifest = (ref: string) => {
        return firestore
            .doc(ref)
            .get()
            .then((manifestDoc: DocumentData) => {
                return manifestDoc.data();
            });
    };

    public selectDataset = (ref: string) => {
        return this.getManifest(ref).then((data) => {
            this.featureDefs = data.featureDefs;
            this.featuresData = data.featuresData;
            this.cellLineData = data.cellLineData;
            this.thumbnailRoot = data.thumbnailRoot;
            this.downloadRoot = data.downloadRoot;
            this.volumeViewerDataRoot = data.volumeViewerDataRoot;
            this.featuresDisplayOrder = data.featuresDisplayOrder;
            return {
                defaultXAxis: data.defaultXAxis,
                defaultYAxis: data.defaultYAxis,
            };
        });
    };

    public getCellLineData = () => {
        return this.getCollection(CELL_LINE_DEF_FILENAME).then((snapshot: QuerySnapshot) => {
            const dataset: CellLineDef[] = [];
            snapshot.forEach((doc: QueryDocumentSnapshot) => {
                const datum = doc.data();
                if (datum.cellCount > 0) {
                    dataset.push({
                        [CELL_LINE_DEF_NAME_KEY]: datum[CELL_LINE_DEF_NAME_KEY],
                        [CELL_LINE_DEF_STRUCTURE_KEY]: datum[CELL_LINE_DEF_STRUCTURE_KEY],
                        [PROTEIN_NAME_KEY]: datum[CELL_LINE_DEF_PROTEIN_KEY],
                        cellCount: datum.cellCount,
                    });
                }
            });
            return dataset;
        });
    };

    public getFeatureData = () => {
        // TODO: request from AWS
        return this.getCollection("cell-feature-analysis").then((snapshot: QuerySnapshot) => {
            const dataset: MetadataStateBranch[] = [];
            snapshot.forEach((doc: QueryDocumentSnapshot) => {
                dataset.push(doc.data());
            });
            return dataset;
        });
    }

    public getFileInfo = () => {
        return this.getCollection("cell-file-info")
            .then((snapshot) => {
                const dataset: FileInfo[] = []
                snapshot.forEach((doc) => dataset.push(doc.data() as FileInfo));
                return dataset;
            });
    };

    public getFileInfoByCellId = (cellId: string) => {
        return this.getDoc("cell-file-info", cellId).then((doc) => doc.data());
    };

    public getFileInfoByArrayOfCellIds = (cellIds: string[]) => {
        Promise.all(cellIds.map((id) => {
            return this.getDoc("cell-file-info", id).then((doc) => doc.data());
        }))
    };

    public getPageOfFeatureData = async (lastVisible: QueryDocumentSnapshot) => {
        const snapshot = await this.getPage("measured-features-values", 10000, lastVisible);
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
        return this.getCollection("measured-features-values", 10000).then(
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
                    return dataset;
                } else {
                    return null;
                }
            }
        );
    };

    public getMeasuredFeatureNames = async () => {
        const snapshot = await this.getCollection("measured-features-names");
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

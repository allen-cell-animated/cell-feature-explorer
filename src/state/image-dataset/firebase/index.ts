import {
    DocumentReference,
    QueryDocumentSnapshot,
    QuerySnapshot,
    DocumentData,
} from "@firebase/firestore-types";

import {
    CELL_COUNT_KEY,
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

const CFE_DATASETS = "cfe-datasets";
const VERSION = "v2";
const CELL_FILE_INFO_COLLECTION = "cell-file-info";
const CELL_FEATURES_COLLECTION = "measured-features-values";
const CELL_FEATURE_DEFS_COLLECTION = "measured-features-names";

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

    private getDoc = (docPath: string) => {
        return firestore.doc(docPath).get();
    };

    private getCollection = (collection: string) => {

        return firestore.collection(collection).get();
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

    public getCellLineDefs = () => {
        return this.getCollection(this.cellLineData).then((snapshot: QuerySnapshot) => {
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
        return this.getDoc(cellId).then((doc) => doc.data());
    };

    public getFileInfoByArrayOfCellIds = (cellIds: string[]) => {
        Promise.all(cellIds.map((id) => {
            return this.getDoc(id).then((doc) => doc.data());
        }))
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

import {
    DocumentReference,
    QueryDocumentSnapshot,
    QuerySnapshot,
    DocumentSnapshot,
} from "@firebase/firestore-types";
import { reduce } from "lodash";

import {
    CELL_ID_KEY,
    CELL_LINE_DEF_NAME_KEY,
    CELL_LINE_DEF_PROTEIN_KEY,
    CELL_LINE_DEF_STRUCTURE_KEY,
} from "../../../constants";
import { CellLineDef, MetadataStateBranch } from "../../metadata/types";
import { Album } from "../../types";
import {
    ALBUMS_FILENAME,
    CELL_FEATURE_ANALYSIS_FILENAME,
    CELL_LINE_DEF_FILENAME,
} from "../constants";
import { ImageDataset } from "../types";

import { firestore } from "./configure-firebase";

class FirebaseRequest implements ImageDataset {
    private collectionRef: DocumentReference;
    constructor() {
        this.collectionRef = firestore.collection("cfe-datasets").doc("v1_1");
    }

    private getCollection = (collection: string) => {
        return this.collectionRef.collection(collection).get();
    };

    public getCellLineData = () => {
        return this.getCollection(CELL_LINE_DEF_FILENAME).then((snapshot: QuerySnapshot) => {
            const dataset: CellLineDef = {};
            snapshot.forEach((doc: QueryDocumentSnapshot) => {
                const datum = doc.data();
                dataset[datum[CELL_LINE_DEF_NAME_KEY]] = {
                    [CELL_LINE_DEF_STRUCTURE_KEY]: datum[CELL_LINE_DEF_STRUCTURE_KEY],
                    [CELL_LINE_DEF_PROTEIN_KEY]: datum[CELL_LINE_DEF_PROTEIN_KEY],
                };
            });
            return dataset;
        });
    };

    public getFileInfo = () => {
        return this.getCollection("cell-file-info")
    };

    public getFeatureData = (xDataKey: string, yDataKey: string, colorBy: string) => {
        console.log(xDataKey, yDataKey, colorBy);
        const dataset = {
            cellIds: [],
            [xDataKey]: [],
            [yDataKey]: [],
        };

        return Promise.all([
            this.collectionRef
                .collection(xDataKey)
                .get()
                .then((snapshot: QuerySnapshot) => {
                    snapshot.forEach((doc) => {
                        dataset[xDataKey].push(doc.data().value);
                        dataset.cellIds.push(doc.data()[CELL_ID_KEY]);
                    });
                    console.log(dataset.cellIds.length, dataset[xDataKey].length);
                }),
            this.collectionRef
                .collection(yDataKey)
                .get()
                .then((snapshot: QuerySnapshot) => {
                    let index = 0;
                    snapshot.forEach((doc) => {
                        dataset[yDataKey].push(doc.data().value);
                        if (doc.data()[CELL_ID_KEY] !== dataset.cellIds[index]) {
                            console.log(doc.data()[CELL_ID_KEY], dataset.cellIds[index]);
                        }
                        index++;
                    });
                    console.log(dataset.cellIds.length, dataset[yDataKey].length);
                }),
        ]).then(() => dataset);
    };

    public getMeasuredFeatureNames = async () => {
        const snapshot = await this.getCollection("measured-features-names");
        const dataset: MetadataStateBranch[] = [];
        snapshot.forEach((doc: QueryDocumentSnapshot) => {
            dataset.push(doc.data() as MetadataStateBranch);
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

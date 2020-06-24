import { DocumentReference, QueryDocumentSnapshot, QuerySnapshot } from "@firebase/firestore-types";

import {
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
        this.collectionRef = firestore.collection("cfe-datasets").doc("v1");
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

    public getFeatureData = () => {
        return this.getCollection(CELL_FEATURE_ANALYSIS_FILENAME).then(
            (snapshot: QuerySnapshot) => {
                const dataset: MetadataStateBranch[] = [];
                snapshot.forEach((doc: QueryDocumentSnapshot) => {
                    dataset.push(doc.data());
                });
                return dataset;
            }
        );
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

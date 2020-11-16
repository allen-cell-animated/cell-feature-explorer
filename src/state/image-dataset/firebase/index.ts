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
    constructor() {
        this.collectionRef = firestore.collection("cfe-datasets").doc("v1_1");
    }

    private getCollection = (collection: string) => {
        return this.collectionRef.collection(collection).get();
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

    public getFileInfo = () => {
        return this.getCollection("cell-file-info")
            .then((snapshot) => {
                const dataset: FileInfo[] = []
                snapshot.forEach((doc) => dataset.push(doc.data() as FileInfo));
                return dataset;
            });
    };

    public getFeatureData = () => {
        return this.getCollection("measured-features").then(
            (snapshot: QuerySnapshot) => {
                const dataset: MetadataStateBranch = {
                    [ARRAY_OF_CELL_IDS_KEY]: []
                };
                snapshot.forEach((doc: QueryDocumentSnapshot) => {
                    dataset[ARRAY_OF_CELL_IDS_KEY].push(doc.id);
                    const data = doc.data();
                    map(data, (value, key) => {
                        if (!dataset[key]) {
                            dataset[key] = []
                        }
                        dataset[key].push(value)
                    })
                    
                });
                return dataset;
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

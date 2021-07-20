import {
    DocumentReference,
    QueryDocumentSnapshot,
    QuerySnapshot,
    DocumentData,
} from "@firebase/firestore-types";
import axios, { AxiosResponse } from "axios";

import {
    CELL_COUNT_KEY,
    CELL_LINE_DEF_NAME_KEY,
    CELL_LINE_DEF_PROTEIN_KEY,
    CELL_LINE_DEF_STRUCTURE_KEY,
    PROTEIN_NAME_KEY,
} from "../../../constants";
import { DatasetMetaData } from "../../../constants/datasets";
import { isDevOrStagingSite } from "../../../util";
import { CellLineDef, FileInfo, MappingOfMeasuredValuesArrays, MeasuredFeatureDef } from "../../metadata/types";
import { Album } from "../../types";

import { ImageDataset } from "../types";

import { firestore } from "./configure-firebase";

const CELL_FEATURES_COLLECTION = "feature-definitions";

class FirebaseRequest implements ImageDataset {
    private collectionRef: DocumentReference;
    private featuresDataPath: string;
    private cellLineDataPath: string;
    private thumbnailRoot: string;
    private downloadRoot: string;
    private volumeViewerDataRoot: string;
    private featuresDisplayOrder: string[];
    private datasetId: string;
    private fileInfoPath: string;
    private featuresDataOrder: string[];
    private albumPath: string;
    constructor() {
        this.featuresDataPath = "";
        this.cellLineDataPath = "";
        this.thumbnailRoot = "";
        this.downloadRoot = "";
        this.volumeViewerDataRoot = "";
        this.featuresDisplayOrder = [];
        this.fileInfoPath = "";
        this.datasetId = "";
        this.featuresDataOrder = [];
        this.albumPath = "";
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
                
                snapShot.forEach((doc) => {
                    const metadata = doc.data() as DatasetMetaData;
                    /** if running the site in a local development env or on staging.cfe.allencell.org
                     * include all cards, otherwise, only include cards with a production flag.
                     * this is based on hostname instead of a build time variable so we don't
                     * need a separate build for staging and production
                     */                    
                    if (isDevOrStagingSite(location.hostname)) {
                        datasets.push(metadata)
                    } else if (metadata.production) {
                        datasets.push(metadata)
                    }
                });
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
            this.featuresDataPath = data.featuresDataPath;
            this.thumbnailRoot = data.thumbnailRoot;
            this.downloadRoot = data.downloadRoot;
            this.volumeViewerDataRoot = data.volumeViewerDataRoot;
            this.featuresDisplayOrder = data.featuresDisplayOrder;
            this.cellLineDataPath = data.cellLineDataPath;
            this.fileInfoPath = data.fileInfoPath;
            this.featuresDataOrder = data.featuresDataOrder;
            this.albumPath = data.albumPath;
            return {
                defaultXAxis: data.defaultXAxis,
                defaultYAxis: data.defaultYAxis,
                thumbnailRoot: data.thumbnailRoot,
                downloadRoot: data.downloadRoot,
                volumeViewerDataRoot: data.volumeViewerDataRoot,
            };
        });
    };

    public getCellLineDefs = () => {
        return this.getCollection(this.cellLineDataPath).then((snapshot: QuerySnapshot) => {
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

    public getMeasuredFeatureDefs = async () => {
        const displayOrder = [...this.featuresDisplayOrder];
        // TODO: request rest of features, currently only requesting non shape mode features
        // Firebase limits the array to ten items, so will need to make multiple requests for
        // more features
        const batchToRequest = displayOrder.splice(0, 10);
        const snapshot = await firestore
            .collection(CELL_FEATURES_COLLECTION)
            .where("key", "in", batchToRequest)
            .get();
        const dataset: MeasuredFeatureDef[] = [];
        snapshot.forEach((doc: QueryDocumentSnapshot) => {
            const data = doc.data() as MeasuredFeatureDef;
            const key = data.key;
            const index = this.featuresDisplayOrder.indexOf(key);
            dataset[index] = data;
        });
        return dataset;
    };

    public getFeatureData = () => {
        return axios
            .get(this.featuresDataPath)
            .then((metadata: AxiosResponse) => metadata.data)
            .then((featureData) => {
                const dataMappedByMeasuredFeatures = this.featuresDisplayOrder.reduce(
                    (acc, featureName: string) => {
                        const initArray: number[] = [];
                        acc[featureName] = initArray;
                        return acc;
                    },
                    {} as MappingOfMeasuredValuesArrays
                );
                const proteinArray: string[] = [];
                const thumbnails: string[] = [];
                const ids: string[] = [];
                for (let index = 0; index < featureData.length; index++) {
                    const datum = featureData[index];
                    datum.f.forEach((value: number, index: number) => {
                        const arrayOfValues = dataMappedByMeasuredFeatures[
                            this.featuresDataOrder[index]
                        ] as number[];
                        arrayOfValues.push(value);
                    }, {});
                    proteinArray.push(datum.p);
                    thumbnails.push(datum.t);
                    ids.push(datum.i.toString());
                }
                return {
                    values: dataMappedByMeasuredFeatures,
                    labels: {
                        [PROTEIN_NAME_KEY]: proteinArray,
                        thumbnailPaths: thumbnails,
                        cellIds: ids,
                    },
                };
            });
    };

    public getFileInfoByCellId = (cellId: string) => {
        return this.getDoc(`${this.fileInfoPath}/${cellId}`).then((doc) => {
            const data = doc.data() as FileInfo;
            if (!data) {
                return;
            }
            return {
                ...data,
                CellId: data.CellId.toString(),
                FOVId: data.FOVId.toString(),
            };
        });
    };

    public getFileInfoByArrayOfCellIds = (cellIds: string[]) => {
        return Promise.all(
            cellIds.map((id: string) => {
                return this.getDoc(`${this.fileInfoPath}/${id}`).then((doc) => {
                    const data = doc.data() as FileInfo;
                    if (!data) {
                        return;
                    }
                    return {
                        ...data,
                        CellId: data.CellId.toString(),
                        FOVId: data.FOVId.toString(),
                    };
                });
            })
        );
    };

    public getAlbumData = () => {
        if (!this.albumPath) {
            return Promise.resolve([])
        }
        return this.getCollection(this.albumPath).then((snapshot: QuerySnapshot) => {
            const dataset: Album[] = [];
            snapshot.forEach((doc: QueryDocumentSnapshot) => {
                dataset.push(doc.data() as Album);
            });
            return dataset;
        });
    };
}

export default FirebaseRequest;

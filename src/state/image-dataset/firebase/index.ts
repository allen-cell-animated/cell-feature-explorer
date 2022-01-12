import {
    DocumentReference,
    QueryDocumentSnapshot,
    QuerySnapshot,
    DocumentData,
} from "@firebase/firestore-types";
import axios, { AxiosResponse } from "axios";
import { forEach } from "lodash";

import {
    CELL_COUNT_KEY,
    CELL_LINE_DEF_NAME_KEY,
    CELL_LINE_DEF_PROTEIN_KEY,
    CELL_LINE_DEF_STRUCTURE_KEY,
    PROTEIN_NAME_KEY,
    CELL_LINE_DEF_GENE_KEY,
} from "../../../constants";
import { DatasetMetaData, Megaset } from "../../../constants/datasets";
import { isDevOrStagingSite } from "../../../util";
import {
    CellLineDef,
    FileInfo,
    MappingOfMeasuredValuesArrays,
    MeasuredFeatureDef,
} from "../../metadata/types";
import { Album } from "../../types";

import { ImageDataset } from "../types";

import { firestore } from "./configure-firebase";

import { ViewerChannelSettings } from "@aics/web-3d-viewer/type-declarations";

class FirebaseRequest implements ImageDataset {
    private collectionRef: DocumentReference;
    private featuresDataPath: string;
    private cellLineDataPath: string;
    private viewerSettingsPath: string;
    private thumbnailRoot: string;
    private downloadRoot: string;
    private volumeViewerDataRoot: string;
    private featuresDisplayOrder: string[];
    private datasetId: string;
    private fileInfoPath: string;
    private featuresDataOrder: string[];
    private albumPath: string;
    private featureDefsPath: string;
    private viewerChannelSettings?: ViewerChannelSettings;
    constructor() {
        this.featuresDataPath = "";
        this.viewerSettingsPath = "";
        this.cellLineDataPath = "";
        this.thumbnailRoot = "";
        this.downloadRoot = "";
        this.volumeViewerDataRoot = "";
        this.featuresDisplayOrder = [];
        this.fileInfoPath = "";
        this.datasetId = "";
        this.featuresDataOrder = [];
        this.albumPath = "";
        this.featureDefsPath = "";
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
                const megasets: Megaset[] = [];
                const datasets: DatasetMetaData[] = [];

                snapShot.forEach((megasetDoc) => {
                    const megasetData = megasetDoc.data() as Megaset;
                    forEach(megasetData.datasets, ((dataset: DatasetMetaData) => {
                        /** if running the site in a local development env or on staging.cfe.allencell.org
                         * include all cards, otherwise, only include cards with a production flag.
                         * this is based on hostname instead of a build time variable so we don't
                         * need a separate build for staging and production
                         */
                        if (isDevOrStagingSite(location.hostname)) {
                            datasets.push(dataset);
                        } else if (dataset.production) {
                            datasets.push(dataset);
                        }
                    }))
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
        // clear locally cached data.
        this.viewerChannelSettings = undefined;

        return this.getManifest(ref).then((data) => {
            this.featuresDataPath = data.featuresDataPath;
            this.viewerSettingsPath = data.viewerSettingsPath;
            this.thumbnailRoot = data.thumbnailRoot;
            this.downloadRoot = data.downloadRoot;
            this.volumeViewerDataRoot = data.volumeViewerDataRoot;
            this.featuresDisplayOrder = data.featuresDisplayOrder;
            this.cellLineDataPath = data.cellLineDataPath;
            this.fileInfoPath = data.fileInfoPath;
            this.featuresDataOrder = data.featuresDataOrder;
            this.featureDefsPath = data.featureDefsPath;
            this.albumPath = data.albumPath;
            return {
                defaultXAxis: data.defaultXAxis,
                defaultYAxis: data.defaultYAxis,
                defaultColorBy: data.defaultColorBy,
                thumbnailRoot: data.thumbnailRoot,
                downloadRoot: data.downloadRoot,
                volumeViewerDataRoot: data.volumeViewerDataRoot,
            };
        });
    };

    public getViewerChannelSettings = () => {
        if (this.viewerChannelSettings) {
            return Promise.resolve(this.viewerChannelSettings);
        }

        return axios
            .get(this.viewerSettingsPath)
            .then((metadata: AxiosResponse) => metadata.data)
            .then((viewerSettingsData) => {
                this.viewerChannelSettings = viewerSettingsData as ViewerChannelSettings;
                return this.viewerChannelSettings;
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
                        [CELL_LINE_DEF_GENE_KEY]: datum[CELL_LINE_DEF_GENE_KEY],
                        [CELL_COUNT_KEY]: datum[CELL_COUNT_KEY],
                    });
                }
            });
            return dataset;
        });
    };

    private requestSetOfFeatureDefs = async (
        featuresLeftToRequest: string[],
        dataset: MeasuredFeatureDef[]
    ): Promise<void> => {
        // Firebase limits the array to ten items, so will need to make multiple requests for
        // more features
        const batchToRequest = featuresLeftToRequest.splice(0, 10);

        const snapshot = await firestore
            .collection(this.featureDefsPath)
            .where("key", "in", batchToRequest)
            .get();

        snapshot.forEach((doc: QueryDocumentSnapshot) => {
            const data = doc.data() as MeasuredFeatureDef;
            const key = data.key;
            const index = this.featuresDisplayOrder.indexOf(key);
            dataset[index] = data;
        });
        if (featuresLeftToRequest.length) {
            return this.requestSetOfFeatureDefs(featuresLeftToRequest, dataset);
        }
    };

    public getMeasuredFeatureDefs = async () => {
        const listOfFeatureKeys = [...this.featuresDisplayOrder];
        const dataset: MeasuredFeatureDef[] = [];
        await this.requestSetOfFeatureDefs(listOfFeatureKeys, dataset);
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
                        ] as (number | null)[];
                        // value actually can be a number or a string, but isNaN
                        // only accepts a number, so the typing here had to identify
                        // value as a number until this point
                        if (isNaN(value)) {
                            arrayOfValues.push(null);
                        } else {
                            arrayOfValues.push(Number(value));
                        }
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
            return Promise.resolve([]);
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

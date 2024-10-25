import { ViewerChannelSettings } from "@aics/web-3d-viewer";
import { Album } from "../..";
import * as Papa from "papaparse";
import {
    DataForPlot,
    MeasuredFeatureDef,
    FileInfo,
    PerCellLabels,
    MeasuredFeaturesOption,
} from "../../metadata/types";
import { ImageDataset, InitialDatasetSelections, Megaset } from "../types";
import firebase from "firebase";
import {
    CELL_ID_KEY,
    FOV_ID_KEY,
    FOV_THUMBNAIL_PATH,
    FOV_VOLUME_VIEWER_PATH,
    GROUP_BY_KEY,
    THUMBNAIL_PATH,
    TRANSFORM,
    VOLUME_VIEWER_PATH,
} from "../../../constants";

// Some example CSV as a const here?

const exampleCsv = `${CELL_ID_KEY},${VOLUME_VIEWER_PATH},feature1,feature2,feature3,discretefeature
1,https://allencell.s3.amazonaws.com/aics/nuc-morph-dataset/hipsc_fov_nuclei_timelapse_dataset/hipsc_fov_nuclei_timelapse_data_used_for_analysis/baseline_colonies_fov_timelapse_dataset/20200323_09_small/raw.ome.zarr,1,2,3,yowie
2,https://allencell.s3.amazonaws.com/aics/nuc-morph-dataset/hipsc_fov_nuclei_timelapse_dataset/hipsc_fov_nuclei_timelapse_data_used_for_analysis/baseline_colonies_fov_timelapse_dataset/20200323_09_small/raw.ome.zarr,4,5,6,yummy`;

type CsvData = {
    [CELL_ID_KEY]: number;
    [VOLUME_VIEWER_PATH]: string;
} & Record<string, string>;

const reservedKeys = new Set([
    CELL_ID_KEY,
    FOV_ID_KEY,
    FOV_THUMBNAIL_PATH,
    FOV_VOLUME_VIEWER_PATH,
    THUMBNAIL_PATH,
    VOLUME_VIEWER_PATH,
    TRANSFORM,
]);

function isNumeric(value: string): boolean {
    if (typeof value != "string") {
        return false;
    }
    return !isNaN(Number(value)) && !isNaN(parseFloat(value));
}

class CsvRequest implements ImageDataset {
    rawCsvData: Record<string, string>[];
    cellIdToData: Record<string, CsvData>;
    featureKeys: string[];
    featureDefs: Map<string, MeasuredFeatureDef>;

    constructor() {
        // CSV parsing library?
        this.cellIdToData = {};
        this.rawCsvData = [];
        this.featureKeys = [];
        this.featureDefs = new Map();
    }

    getFeatureColumns(): string[] {
        if (!this.rawCsvData || this.rawCsvData.length === 0) {
            return [];
        }
        const keys = Object.keys(this.rawCsvData[0]);
        return keys.filter((key) => !reservedKeys.has(key));
    }

    getFeatureKeyClamped(index: number): string {
        const lastIndex = this.featureKeys.length - 1;
        return this.featureKeys[Math.min(Math.max(index, 0), lastIndex)];
    }

    // Invert from row-ordered to column-ordered data
    // This won't know if a feature is continuous or discrete, so we'll need to handle that later
    // and then parse the values as needed
    stripFeatureData(
        rawCsvData: Record<string, string>[],
        featureKeys: string[]
    ): Map<string, string[] | number[]> {
        const featureData = new Map<string, string[] | number[]>();
        for (const key of featureKeys) {
            const rawValues: string[] = [];
            let isContinuous = true;
            for (const row of rawCsvData) {
                rawValues.push(row[key]);
                if (!isNumeric(row[key])) {
                    isContinuous = false;
                }
            }

            if (isContinuous) {
                // Feature is continuous, parse all values as numeric
                const values = rawValues.map((val) => Number.parseFloat(val));
                featureData.set(key, values);
            } else {
                // Feature is discrete, return directly
                featureData.set(key, rawValues);
            }
        }
        return featureData;
    }

    getFeatureDefs(
        rawCsvData: Record<string, string>[],
        featureKeys: string[]
    ): Map<string, MeasuredFeatureDef> {
        const featureDefs: Map<string, MeasuredFeatureDef> = new Map();
        const featureData = this.stripFeatureData(rawCsvData, featureKeys);

        for (const key of featureKeys) {
            const data = featureData.get(key);
            if (!data) {
                continue;
            }
            if (typeof data[0] === "string") {
                // Treat as discrete feature, create options objects
                const options: Record<string, MeasuredFeaturesOption> = {};
                const featureValues = new Set<string>(data as string[]);
                for (const value of featureValues) {
                    options[value] = {
                        color: "#aaa",
                        name: value,
                        key: value,
                    };
                }
                featureDefs.set(key, {
                    discrete: true,
                    displayName: key,
                    description: key,
                    key,
                    options,
                    tooltip: key,
                });
            } else {
                featureDefs.set(key, {
                    discrete: false,
                    displayName: key,
                    description: key,
                    key,
                    tooltip: key,
                });
            }
        }

        return featureDefs;
    }

    parseCsvData(csvDataSrc: string): void {
        // TODO: handle URLs here
        const result = Papa.parse(csvDataSrc, { header: true }).data as Record<string, string>[];
        this.rawCsvData = result as Record<string, string>[];

        // Index data by cell ID
        for (const row of this.rawCsvData) {
            const cellId = row[CELL_ID_KEY];
            this.cellIdToData[cellId] = row as unknown as CsvData;
        }

        // TODO: Recognize BFF format and convert it to expected values?
        // Some assertion tests, throw errors if data can't be parsed
        if (this.rawCsvData.length === 0) {
            throw new Error("No data found in CSV");
        }
        if (this.rawCsvData[0][CELL_ID_KEY] === undefined) {
            throw new Error(`No ${CELL_ID_KEY} column found in CSV.`);
        }

        // Determine if features are continuous or discrete

        this.featureKeys = this.getFeatureColumns();
        this.featureDefs = this.getFeatureDefs(this.rawCsvData, this.featureKeys);
    }

    selectDataset(manifest: string): Promise<InitialDatasetSelections> {
        console.log("Selecting dataset: ", manifest);
        this.parseCsvData(exampleCsv);

        // TODO: Add a discrete feature for grouping if none is available in the dataset.

        return Promise.resolve({
            defaultXAxis: this.getFeatureKeyClamped(0),
            defaultYAxis: this.getFeatureKeyClamped(1),
            defaultColorBy: this.getFeatureKeyClamped(2),
            defaultGroupBy: "discretefeature",
            thumbnailRoot: "",
            downloadRoot: "",
            volumeViewerDataRoot: "",
        });
    }

    getAvailableDatasets(): Promise<Megaset[]> {
        // Only has the one dataset (imported CSV)

        const fakeSet: Megaset = {
            name: "csv",
            title: "CSV Dataset",
            production: false,
            dateCreated: firebase.firestore.Timestamp.now(),
            datasets: {
                csv: {
                    name: "csv",
                    title: "CSV Dataset",
                    version: "1",
                    id: "csv",
                    description: "A dataset imported from a CSV file",
                    index: 0,
                    userData: {},
                },
            },
        };

        return Promise.resolve([fakeSet]);
    }

    getViewerChannelSettings(): Promise<ViewerChannelSettings> {
        return Promise.resolve({ groups: [] });
    }

    getFeatureData(): Promise<DataForPlot | void> {
        const indices = this.rawCsvData.map((row) => Number.parseInt(row[CELL_ID_KEY]));

        const values: Record<string, number[]> = {};
        const labels: PerCellLabels = {
            thumbnailPaths: [],
            cellIds: [],
        };

        for (let i = 0; i < indices.length; i++) {
            const row = this.rawCsvData[i];

            // Copy feature values
            for (const key of this.featureKeys) {
                if (!values[key]) {
                    values[key] = [];
                }
                values[key].push(Number.parseFloat(row[key]));
            }

            // Copy label data
            labels.cellIds.push(row[CELL_ID_KEY]);
            labels.thumbnailPaths.push(row[THUMBNAIL_PATH] || "");
        }

        return Promise.resolve({
            indices,
            values,
            labels,
        });
    }

    getAlbumData(): Promise<Album[]> {
        return Promise.resolve([]);
    }

    getMeasuredFeatureDefs(): Promise<MeasuredFeatureDef[]> {
        return Promise.resolve(Array.from(this.featureDefs.values()));
    }
    getFileInfoByCellId(id: string): Promise<FileInfo | undefined> {
        // return Promise.resolve(undefined);
        const data = this.cellIdToData[id];

        console.log(data);

        if (!data) {
            return Promise.resolve(undefined);
        }
        const fileInfo = {
            [CELL_ID_KEY]: data[CELL_ID_KEY].toString(),
            [FOV_ID_KEY]: data[FOV_ID_KEY] || "",
            [FOV_THUMBNAIL_PATH]: data[FOV_THUMBNAIL_PATH] || "",
            [FOV_VOLUME_VIEWER_PATH]: data[FOV_VOLUME_VIEWER_PATH] || "",
            [THUMBNAIL_PATH]: data[THUMBNAIL_PATH] || "",
            [VOLUME_VIEWER_PATH]: data[VOLUME_VIEWER_PATH] || "",
            [GROUP_BY_KEY]: data[GROUP_BY_KEY] || "",
        };
        console.log(fileInfo);
        return Promise.resolve(fileInfo);
    }
    getFileInfoByArrayOfCellIds(ids: string[]): Promise<(FileInfo | undefined)[]> {
        const promises = ids.map((id) => this.getFileInfoByCellId(id));
        const result = Promise.all(promises);
        return Promise.resolve(result);
    }
}

export default CsvRequest;

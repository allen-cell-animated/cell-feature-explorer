import { ViewerChannelSettings } from "@aics/web-3d-viewer";
import { Album } from "../..";
import * as Papa from "papaparse";
import {
    DataForPlot,
    MeasuredFeatureDef,
    FileInfo,
    PerCellLabels,
    MeasuredFeaturesOption,
    DiscreteMeasuredFeatureDef,
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

const exampleCsv = `${CELL_ID_KEY},${VOLUME_VIEWER_PATH},${THUMBNAIL_PATH},feature1,feature2,feature3,discretefeature
potato,https://allencell.s3.amazonaws.com/aics/nuc-morph-dataset/hipsc_fov_nuclei_timelapse_dataset/hipsc_fov_nuclei_timelapse_data_used_for_analysis/baseline_colonies_fov_timelapse_dataset/20200323_09_small/raw.ome.zarr,https://i.imgur.com/qYDFpxw.png,1,2,3,yowie
garbanzo,https://allencell.s3.amazonaws.com/aics/nuc-morph-dataset/hipsc_fov_nuclei_timelapse_dataset/hipsc_fov_nuclei_timelapse_data_used_for_analysis/baseline_colonies_fov_timelapse_dataset/20200323_09_small/raw.ome.zarr,https://i.imgur.com/JNVwCaF.jpeg,7,3.4,1,yay
turnip,https://allencell.s3.amazonaws.com/aics/nuc-morph-dataset/hipsc_fov_nuclei_timelapse_dataset/hipsc_fov_nuclei_timelapse_data_used_for_analysis/baseline_colonies_fov_timelapse_dataset/20200323_05_large/raw.ome.zarr,https://i.pinimg.com/474x/59/79/64/59796458a1b0374d9860f4a62cf92cf1.jpg,4,5,6,yummy
rutabaga,https://allencell.s3.amazonaws.com/aics/nuc-morph-dataset/hipsc_fov_nuclei_timelapse_dataset/hipsc_fov_nuclei_timelapse_data_used_for_analysis/baseline_colonies_fov_timelapse_dataset/20200323_05_large/raw.ome.zarr,https://i.imgur.com/lA6dvOe.jpeg,9,2,4,yowza`;

type CsvData = {
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
    csvData: Record<string, string>[];
    idToIndex: Record<string, number>;
    featureKeys: string[];
    featureDefs: Map<string, MeasuredFeatureDef>;
    featureData: Record<string, (number | null)[]>;

    constructor() {
        // CSV parsing library?
        this.csvData = [];
        this.idToIndex = {};
        this.featureKeys = [];
        this.featureDefs = new Map();
        this.featureData = {};
        this.parseCsvData(exampleCsv);
    }

    /**
     * Returns all of the column names that are not reserved for metadata, with the
     * assumption that they are features.
     */
    private getNonReservedFeatureColumns(csvData: Record<string, string>[]): string[] {
        if (!csvData || csvData.length === 0) {
            return [];
        }
        const keys = Object.keys(csvData[0]);
        return keys.filter((key) => !reservedKeys.has(key));
    }

    /**
     * Used for default initialization. Returns the feature key at the given index,
     * clamped to the length of the features array.
     */
    private getFeatureKeyClamped(featureKeys: string[], index: number): string {
        const lastIndex = this.featureKeys.length - 1;
        return featureKeys[Math.min(Math.max(index, 0), lastIndex)];
    }

    /**
     * Returns the feature data as a map from the feature name to a array of either
     * numeric or string values.
     * @param csvData
     * @param featureKeys
     * @returns
     */
    private getFeatureDataAsColumns(
        csvData: Record<string, string>[],
        featureKeys: string[]
    ): Map<string, string[] | number[]> {
        const featureData = new Map<string, string[] | number[]>();
        for (const key of featureKeys) {
            const rawValues: string[] = [];
            let isContinuous = true;
            for (const row of csvData) {
                rawValues.push(row[key]);
                if (!isNumeric(row[key])) {
                    isContinuous = false;
                }
            }

            if (isContinuous) {
                // Feature is continuous, parse all values as numeric
                const values = rawValues.map((val) => Number.parseFloat(val));
                featureData.set(key, values);
                // TODO: Create additional feature metadata for continuous vs discrete features?
            } else {
                // Feature is discrete, return directly
                featureData.set(key, rawValues);
            }
        }
        return featureData;
    }

    private parseDiscreteFeature(
        key: string,
        data: string[]
    ): { def: DiscreteMeasuredFeatureDef; data: (number | null)[] } {
        // Treat as discrete feature, create options objects
        const options: Record<string, MeasuredFeaturesOption> = {};
        const uniqueValuesSet = new Set<string>(data as string[]);
        const colors = ["#e9ebee", "#c51b8a", "#fed98e", "#66c2a4", "#7f48f3", "#838383"];
        const uniqueValues = Array.from(uniqueValuesSet);

        const valueNameToIndex = new Map<string, number>();
        for (let i = 0; i < uniqueValues.length; i++) {
            const value = uniqueValues[i];
            valueNameToIndex.set(value, i);
            // Options must be indexed by string integer
            options[i.toString()] = {
                color: colors[i % colors.length],
                name: value,
                key: value,
            };
        }

        const mappedData = data.map((val) => valueNameToIndex.get(val) ?? null);

        return {
            def: {
                discrete: true,
                displayName: key,
                description: key,
                key,
                options,
                tooltip: key,
            },
            data: mappedData,
        };
    }

    private parseFeatures(csvData: Record<string, string>[]): void {
        const featureKeys = this.getNonReservedFeatureColumns(csvData);
        const featureDefs: Map<string, MeasuredFeatureDef> = new Map();
        const rawFeatureData = this.getFeatureDataAsColumns(csvData, featureKeys);
        const newFeatureData: Record<string, (number | null)[]> = {};

        for (const key of featureKeys) {
            const data = rawFeatureData.get(key);
            if (!data) {
                continue;
            }
            if (typeof data[0] === "string") {
                const { def, data: discreteData } = this.parseDiscreteFeature(
                    key,
                    data as string[]
                );
                featureDefs.set(key, def);
                // Overwrite string data with new mapped indices
                newFeatureData[key] = discreteData;
            } else {
                // TODO: same as above, but for continuous features
                featureDefs.set(key, {
                    discrete: false,
                    displayName: key,
                    description: key,
                    key,
                    tooltip: key,
                });
                newFeatureData[key] = data as number[];
            }
        }

        this.featureDefs = featureDefs;
        this.featureKeys = featureKeys;
        this.featureData = newFeatureData;
    }

    private parseCsvData(csvDataSrc: string): void {
        // TODO: handle URLs here
        const result = Papa.parse(csvDataSrc, { header: true }).data as Record<string, string>[];
        this.csvData = result as Record<string, string>[];

        // Map from cell IDs to row index. If no cell ID is provided, assign the row number.
        for (let i = 0; i < this.csvData.length; i++) {
            const row = this.csvData[i];
            if (row[CELL_ID_KEY] === undefined) {
                // Substitute with index if no cell ID is provided
                row[CELL_ID_KEY] = i.toString();
                this.idToIndex[i.toString()] = i;
            } else {
                this.idToIndex[row[CELL_ID_KEY]] = i;
            }
        }

        // TODO: Recognize BFF format and convert it to expected values?
        // Some assertion tests, throw errors if data can't be parsed
        if (this.csvData.length === 0) {
            throw new Error("No data found in CSV");
        }

        this.parseFeatures(this.csvData);
    }

    selectDataset(manifest: string): Promise<InitialDatasetSelections> {
        console.log("Selecting dataset: ", manifest);

        // TODO: Add a discrete feature for grouping if none is available in the dataset.

        return Promise.resolve({
            defaultXAxis: this.getFeatureKeyClamped(this.featureKeys, 0),
            defaultYAxis: this.getFeatureKeyClamped(this.featureKeys, 1),
            defaultColorBy: this.getFeatureKeyClamped(this.featureKeys, 2),
            defaultGroupBy: "discretefeature",
            // TODO: Provide thumbnail root as folder of the CSV URL.
            // TODO: Discard thumbnail/download/volumeviewer root if the
            // path is a HTTP(S) URL.
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
        // By default, enable first three channels
        // TODO: Have this constant exposed by w3cv?
        return Promise.resolve({
            groups: [
                {
                    name: "Channels",
                    channels: [
                        { match: [0, 1, 2], enabled: true },
                        { match: "(.+)", enabled: false },
                    ],
                },
            ],
        });
    }

    getFeatureData(): Promise<DataForPlot | void> {
        const indices = this.csvData.map((row) => Number.parseInt(row[CELL_ID_KEY]));

        const values: Record<string, (number | null)[]> = this.featureData;
        const labels: PerCellLabels = {
            thumbnailPaths: [],
            cellIds: [],
        };

        for (let i = 0; i < indices.length; i++) {
            // TODO: Calculate in advance
            const row = this.csvData[i];
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
        console.log("Getting file info for cell ID: ", id);
        const rowIndex = this.idToIndex[id];
        if (rowIndex === undefined) {
            return Promise.resolve(undefined);
        }
        const data = this.csvData[rowIndex];

        if (!data) {
            return Promise.resolve(undefined);
        }
        const fileInfo = {
            [CELL_ID_KEY]: data[CELL_ID_KEY],
            [FOV_ID_KEY]: data[FOV_ID_KEY] || "",
            [FOV_THUMBNAIL_PATH]: data[FOV_THUMBNAIL_PATH] || "",
            [FOV_VOLUME_VIEWER_PATH]: data[FOV_VOLUME_VIEWER_PATH] || "",
            [THUMBNAIL_PATH]: data[THUMBNAIL_PATH] || "",
            [VOLUME_VIEWER_PATH]: data[VOLUME_VIEWER_PATH] || "",
            [GROUP_BY_KEY]: data[GROUP_BY_KEY] || "discretefeature",
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

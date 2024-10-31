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
    ContinuousMeasuredFeatureDef,
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
garbanzo,https://allencell.s3.amazonaws.com/aics/nuc-morph-dataset/hipsc_fov_nuclei_timelapse_dataset/hipsc_fov_nuclei_timelapse_data_used_for_analysis/baseline_colonies_fov_timelapse_dataset/20200323_09_small/raw.ome.zarr,https://i.imgur.com/JNVwCaF.jpeg,7,3.4,1,yowza
turnip,https://allencell.s3.amazonaws.com/aics/nuc-morph-dataset/hipsc_fov_nuclei_timelapse_dataset/hipsc_fov_nuclei_timelapse_data_used_for_analysis/baseline_colonies_fov_timelapse_dataset/20200323_05_large/raw.ome.zarr,https://i.pinimg.com/474x/59/79/64/59796458a1b0374d9860f4a62cf92cf1.jpg,4,5,6,yummy
rutabaga,https://allencell.s3.amazonaws.com/aics/nuc-morph-dataset/hipsc_fov_nuclei_timelapse_dataset/hipsc_fov_nuclei_timelapse_data_used_for_analysis/baseline_colonies_fov_timelapse_dataset/20200323_05_large/raw.ome.zarr,https://i.imgur.com/lA6dvOe.jpeg,9,2.8,4,yowza`;

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

function isStringArray(data: string[] | (number | null)[]): data is string[] {
    return data.length > 0 && typeof data[0] === "string";
}

const enum FeatureType {
    CONTINUOUS,
    DISCRETE,
}

type FeatureInfo =
    | {
          type: FeatureType.CONTINUOUS;
          def: ContinuousMeasuredFeatureDef;
          data: (number | null)[];
      }
    | {
          type: FeatureType.DISCRETE;
          def: DiscreteMeasuredFeatureDef;
          data: (number | null)[];
      };

class CsvRequest implements ImageDataset {
    csvData: Record<string, string>[];
    idToIndex: Record<string, number>;
    featureInfo: Map<string, FeatureInfo>;

    defaultGroupByFeatureKey: string | null;

    constructor() {
        // CSV parsing library?
        this.csvData = [];
        this.idToIndex = {};
        this.featureInfo = new Map();
        this.parseCsvData(exampleCsv);
        this.defaultGroupByFeatureKey = null;
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
        const lastIndex = featureKeys.length - 1;
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
        const seenValues = new Map<string, { index: number; count: number }>();
        const remappedValues: (number | null)[] = [];

        // Iterate through all values and count them. Replace the values with their
        // corresponding index.
        for (let i = 0; i < data.length; i++) {
            const value = data[i];

            if (!seenValues.has(value)) {
                // Assign new index to this value
                seenValues.set(value, { index: seenValues.size, count: 0 });
            }

            seenValues.get(value)!.count++;
            remappedValues.push(seenValues.get(value)!.index);
        }

        const options: Record<string, MeasuredFeaturesOption> = {};
        const colors = ["#e9ebee", "#c51b8a", "#fed98e", "#66c2a4", "#7f48f3", "#838383"];

        for (const [value, { index, count }] of seenValues.entries()) {
            options[index.toString()] = {
                color: colors[index % colors.length],
                name: value,
                key: value,
                count: count,
            };
        }

        return {
            def: {
                discrete: true,
                displayName: key,
                description: key,
                key,
                options,
                tooltip: key,
            },
            data: remappedValues,
        };
    }

    private parseFeatures(csvData: Record<string, string>[]): void {
        this.featureInfo.clear();

        const featureKeys = this.getNonReservedFeatureColumns(csvData);
        const rawFeatureData = this.getFeatureDataAsColumns(csvData, featureKeys);

        for (const key of featureKeys) {
            const data = rawFeatureData.get(key);
            if (!data) {
                continue;
            }
            if (isStringArray(data)) {
                const { def, data: discreteData } = this.parseDiscreteFeature(key, data);
                this.featureInfo.set(key, {
                    type: FeatureType.DISCRETE,
                    def,
                    data: discreteData,
                });
            } else {
                const def: ContinuousMeasuredFeatureDef = {
                    discrete: false,
                    displayName: key,
                    description: key,
                    key,
                    tooltip: key,
                };
                this.featureInfo.set(key, {
                    type: FeatureType.CONTINUOUS,
                    def,
                    data: data,
                });
            }
        }

        // TODO: Feature defs can include units. Should we strip that from the feature column name?

        // Assign the first discrete feature as the default group-by feature. If none exists, construct
        // an artificial discrete feature for grouping.
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
        const featureKeys = Array.from(this.featureInfo.keys());
        return Promise.resolve({
            defaultXAxis: this.getFeatureKeyClamped(featureKeys, 0),
            defaultYAxis: this.getFeatureKeyClamped(featureKeys, 1),
            defaultColorBy: this.getFeatureKeyClamped(featureKeys, 2),
            defaultGroupBy: "discretefeature",
            // TODO: Provide the containing folder of the CSV if the values for the columns (thumbnails,
            // downloads, volumes) are relative paths and not HTTPS URLs.
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

    private getFeatureKeyToData(): Record<string, (number | null)[]> {
        const featureKeyToData: Record<string, (number | null)[]> = {};
        for (const [key, info] of this.featureInfo.entries()) {
            featureKeyToData[key] = info.data;
        }
        return featureKeyToData;
    }

    getFeatureData(): Promise<DataForPlot | void> {
        const indices = this.csvData.map((row) => Number.parseInt(row[CELL_ID_KEY]));

        const values: Record<string, (number | null)[]> = this.getFeatureKeyToData();
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
        const featureDefsArray = Array.from(this.featureInfo.values()).map((info) => info.def);
        return Promise.resolve(featureDefsArray);
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

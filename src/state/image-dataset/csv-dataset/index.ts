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

export const DEFAULT_CSV_DATASET_KEY = "csv";

const METADATA_KEYS = new Set([
    CELL_ID_KEY,
    FOV_ID_KEY,
    FOV_THUMBNAIL_PATH,
    FOV_VOLUME_VIEWER_PATH,
    THUMBNAIL_PATH,
    VOLUME_VIEWER_PATH,
    TRANSFORM,
]);

// Adobe palette of high-contrast colors for denoting different categories
// Used for categorical data
const DEFAULT_COLORS = [
    "#27B4AE",
    "#4047C4",
    "#F48730",
    "#DB4281",
    "#7E84F4",
    "#78DF76",
    "#1C7AED",
    "#7129CD",
    "#E7C73B",
    "#C95F1E",
    "#188E61",
    "#BEE952",
];

function isNumeric(value: string): boolean {
    if (typeof value != "string") {
        return false;
    }
    if (value.trim().toLowerCase() === "nan") {
        return true;
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

/**
 * Parses and mocks an ImageDataset from a provided CSV string with a header row.
 *
 * The CSV must contain:
 * - URL paths to volume data, under the column name "volumeViewerPath"
 *
 * Optionally, the CSV can contain:
 * - Thumbnail paths, under the column name "thumbnailPath"
 * - Cell IDs, under the column name "CellId"
 * - FOV IDs, under the column name "FOVId"
 * - FOV thumbnail paths, under the column name "fovThumbnailPath"
 * - FOV volume data, under the column name "fovVolumeviewerPath"
 *
 * Some data will be ignored by default:
 * - Transform data, under the column name "transform"
 *
 * Any other columns will be interpreted as features:
 * - Columns containing only numbers will be treated as numeric ("continuous") data.
 * - Columns containing any non-numeric data will be treated as category ("discrete") data.
 */
class CsvRequest implements ImageDataset {
    csvData: Record<string, string>[];
    idToIndex: Record<string, number>;
    featureInfo: Map<string, FeatureInfo>;

    defaultGroupByFeatureKey: string;

    constructor(csvFileContents: string) {
        this.csvData = [];
        this.idToIndex = {};
        this.featureInfo = new Map();
        // TODO: Automatically detect a discrete feature and replace the group
        // by feature with it.
        this.defaultGroupByFeatureKey = CELL_ID_KEY;
        this.parseCsvData(csvFileContents);
    }

    /**
     * Returns all of the column names that are not reserved for metadata, with the
     * assumption that they are features.
     */
    private getFeatureKeysFromColumnNames(csvData: Record<string, string>[]): string[] {
        const keys = Object.keys(csvData[0]);
        return keys.filter((key) => !METADATA_KEYS.has(key));
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
                // TODO: Handle empty/blank values
                const values = rawValues.map((val) => Number.parseFloat(val));
                featureData.set(key, values);
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
        const strValueToIndex = new Map<string, { index: number; count: number }>();
        const remappedValues: (number | null)[] = [];

        // Iterate through all values and count them. Replace the values with their
        // corresponding index.
        for (let i = 0; i < data.length; i++) {
            const value = data[i];
            let indexInfo = strValueToIndex.get(value);
            if (!indexInfo) {
                // Assign new index to this value
                indexInfo = { index: strValueToIndex.size, count: 0 };
                strValueToIndex.set(value, indexInfo);
            }

            indexInfo.count++;
            remappedValues.push(indexInfo.index);
        }

        const options: Record<string, MeasuredFeaturesOption> = {};
        for (const [value, { index, count }] of strValueToIndex.entries()) {
            options[index.toString()] = {
                color: DEFAULT_COLORS[index % DEFAULT_COLORS.length],
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

        const featureKeys = this.getFeatureKeysFromColumnNames(csvData);
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
    }

    private parseCsvData(csvDataSrc: string): void {
        // TODO: handle URLs and files here: they need to be handled via async callbacks.
        // https://www.papaparse.com/docs#strings
        const result = Papa.parse(csvDataSrc, { header: true }).data;
        this.csvData = result as Record<string, string>[];

        if (this.csvData.length === 0) {
            throw new Error("No data found in CSV");
        }

        let useOriginalKey = true;
        // Check if all rows have a cell ID. If not, we must use the row index
        // instead to prevent duplicate values from being added to the map.
        for (let i = 0; i < this.csvData.length; i++) {
            const row = this.csvData[i];
            if (row[CELL_ID_KEY] === undefined) {
                useOriginalKey = false;
                break;
            }
        }

        // Map from cell IDs to row index. If no cell ID is provided, assign the row number.
        for (let i = 0; i < this.csvData.length; i++) {
            const row = this.csvData[i];
            if (!useOriginalKey) {
                row[CELL_ID_KEY] = i.toString();
            }
            this.idToIndex[row[CELL_ID_KEY]] = i;
        }

        this.parseFeatures(this.csvData);
    }

    selectDataset(): Promise<InitialDatasetSelections> {
        const featureKeys = Array.from(this.featureInfo.keys());
        return Promise.resolve({
            defaultXAxis: this.getFeatureKeyClamped(featureKeys, 0),
            defaultYAxis: this.getFeatureKeyClamped(featureKeys, 1),
            defaultColorBy: this.defaultGroupByFeatureKey,
            defaultGroupBy: this.defaultGroupByFeatureKey,
            // TODO: Provide the containing folder of the CSV if the values for the columns (thumbnails,
            // downloads, volumes) are relative paths and not HTTPS URLs.
            thumbnailRoot: "",
            downloadRoot: "",
            volumeViewerDataRoot: "",
        });
    }

    getAvailableDatasets(): Promise<Megaset[]> {
        // Only has one dataset (imported CSV)
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
                    id: DEFAULT_CSV_DATASET_KEY,
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
        // TODO: Have this constant be exposed by w3cv?
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
        const indices = this.csvData.map((_row, index) => index);
        const values: Record<string, (number | null)[]> = this.getFeatureKeyToData();
        const labels: PerCellLabels = {
            thumbnailPaths: [],
            cellIds: [],
        };

        for (let i = 0; i < indices.length; i++) {
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
        const rowIndex = this.idToIndex[id];
        if (rowIndex === undefined) {
            return Promise.resolve(undefined);
        }
        const data = this.csvData[rowIndex];

        if (!data) {
            return Promise.resolve(undefined);
        }
        const fileInfo = {
            [CELL_ID_KEY]: data[CELL_ID_KEY] || "",
            [FOV_ID_KEY]: data[FOV_ID_KEY] || "",
            [FOV_THUMBNAIL_PATH]: data[FOV_THUMBNAIL_PATH] || "",
            [FOV_VOLUME_VIEWER_PATH]: data[FOV_VOLUME_VIEWER_PATH] || "",
            [THUMBNAIL_PATH]: data[THUMBNAIL_PATH] || "",
            [VOLUME_VIEWER_PATH]: data[VOLUME_VIEWER_PATH] || "",
            [GROUP_BY_KEY]: data[GROUP_BY_KEY] || this.defaultGroupByFeatureKey,
        };
        return Promise.resolve(fileInfo);
    }

    getFileInfoByArrayOfCellIds(ids: string[]): Promise<(FileInfo | undefined)[]> {
        const promises = ids.map((id) => this.getFileInfoByCellId(id));
        const result = Promise.all(promises);
        return Promise.resolve(result);
    }
}

export default CsvRequest;

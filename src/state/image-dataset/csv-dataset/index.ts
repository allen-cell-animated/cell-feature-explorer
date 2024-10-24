import { ViewerChannelSettings } from "@aics/web-3d-viewer";
import { Album } from "../..";
import * as Papa from "papaparse";
import { DataForPlot, MeasuredFeatureDef, FileInfo, PerCellLabels } from "../../metadata/types";
import { ImageDataset, InitialDatasetSelections, Megaset } from "../types";
import firebase from "firebase";
import {
    CELL_ID_KEY,
    FOV_ID_KEY,
    FOV_THUMBNAIL_PATH,
    FOV_VOLUME_VIEWER_PATH,
    THUMBNAIL_PATH,
    TRANSFORM,
    VOLUME_VIEWER_PATH,
} from "../../../constants";

// Some example CSV as a const here?

const exampleCsv = `${CELL_ID_KEY},${VOLUME_VIEWER_PATH},feature1,feature2,feature3
1,https://allencell.s3.amazonaws.com/aics/nuc-morph-dataset/hipsc_fov_nuclei_timelapse_dataset/hipsc_fov_nuclei_timelapse_data_used_for_analysis/baseline_colonies_fov_timelapse_dataset/20200323_09_small/raw.ome.zarr,1,2,3, 
2,https://allencell.s3.amazonaws.com/aics/nuc-morph-dataset/hipsc_fov_nuclei_timelapse_dataset/hipsc_fov_nuclei_timelapse_data_used_for_analysis/baseline_colonies_fov_timelapse_dataset/20200323_09_small/raw.ome.zarr,4,5,6`;

type CsvData = {
    cell_id: number;
    url: string;
};

const reservedKeys = new Set([
    CELL_ID_KEY,
    FOV_ID_KEY,
    FOV_THUMBNAIL_PATH,
    FOV_VOLUME_VIEWER_PATH,
    THUMBNAIL_PATH,
    VOLUME_VIEWER_PATH,
    TRANSFORM,
]);

class CsvRequest implements ImageDataset {
    csvData: Record<string, string>[];
    featureKeys: string[];

    constructor() {
        // CSV parsing library?
        this.csvData = [];
        this.featureKeys = [];
    }

    getFeatureColumns(): string[] {
        if (!this.csvData || this.csvData.length === 0) {
            return [];
        }
        const keys = Object.keys(this.csvData[0]);
        return keys.filter((key) => !reservedKeys.has(key));
    }

    getFeatureKeyClamped(index: number): string {
        const lastIndex = this.featureKeys.length - 1;
        return this.featureKeys[Math.min(Math.max(index, 0), lastIndex)];
    }

    selectDataset(manifest: string): Promise<InitialDatasetSelections> {
        // Load the CSV data from the "manifest" param
        // this.csvData = manifest;
        const result = Papa.parse(exampleCsv, { header: true }).data;
        this.csvData = result as Record<string, string>[];

        // TODO: Recognize BFF format and convert it to expected values?
        // Some assertion tests, throw errors if data can't be parsed
        if (this.csvData.length === 0) {
            throw new Error("No data found in CSV");
        }
        if (this.csvData[0][CELL_ID_KEY] === undefined) {
            throw new Error(`No ${CELL_ID_KEY} column found in CSV.`);
        }

        this.featureKeys = this.getFeatureColumns();

        return Promise.resolve({
            defaultXAxis: this.getFeatureKeyClamped(0),
            defaultYAxis: this.getFeatureKeyClamped(1),
            defaultColorBy: this.getFeatureKeyClamped(2),
            defaultGroupBy: "",
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
        const indices = this.csvData.map((row) => Number.parseInt(row[CELL_ID_KEY]));

        const values: Record<string, number[]> = {};
        const labels: PerCellLabels = {
            thumbnailPaths: [],
            cellIds: [],
        };

        for (let i = 0; i < indices.length; i++) {
            const row = this.csvData[i];

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
        return Promise.resolve([]);
    }
    getFileInfoByCellId(id: string): Promise<FileInfo | undefined> {
        throw new Error("Method not implemented.");
    }
    getFileInfoByArrayOfCellIds(ids: string[]): Promise<(FileInfo | undefined)[]> {
        throw new Error("Method not implemented.");
    }
}

export default CsvRequest;

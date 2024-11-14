import { expect } from "chai";
import CsvRequest from "..";

const testCsv =
    "CellId,volumeviewerPath,thumbnailPath,feature1,feature2,feature3,discretefeature" +
    "\npotato,https://example.com/1/raw.ome.zarr,https://example.com/1.png,1,2,3,A" +
    "\ngarbanzo,https://example.com/2/raw.ome.zarr,https://example.com/2.jpeg,7,3.4,1,B" +
    "\nturnip,https://example.com/3/raw.ome.zarr,https://example.com/3.jpeg,4,5,6,B" +
    "\nrutabaga,https://example.com/4/raw.ome.zarr,https://example.com/4.jpeg,9,2.8,NaN,C";

describe("CsvRequest", () => {
    it("can be initialized with test data", () => {
        new CsvRequest(testCsv);
    });

    it("extracts feature data", async () => {
        const csvDataset = new CsvRequest(testCsv);

        const featureData = await csvDataset.getFeatureData();
        expect(featureData).to.deep.equal({
            indices: [0, 1, 2, 3],
            values: {
                feature1: [1, 7, 4, 9],
                feature2: [2, 3.4, 5, 2.8],
                feature3: [3, 1, 6, NaN],
                discretefeature: [0, 1, 1, 2],
            },
            labels: {
                thumbnailPaths: [
                    "https://example.com/1.png",
                    "https://example.com/2.jpeg",
                    "https://example.com/3.jpeg",
                    "https://example.com/4.jpeg",
                ],
                cellIds: ["potato", "garbanzo", "turnip", "rutabaga"],
            },
        });
    });
    /**
     * TODO:
     * - Check for spaces in CSV input
     * - Check for empty values in CSV input
     * - Check for null/NaN values in CSV input
     * - Check for behavior when there is no discrete feature column -> validate groupby
     * - Check for handling of BFF-specific column names (they should be remapped)
     * - Check that metadata-related columns are not parsed as features
     */
});

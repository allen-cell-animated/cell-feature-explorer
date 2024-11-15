import { expect } from "chai";
import CsvRequest, { DEFAULT_GROUPBY_NONE } from "..";
import { DiscreteMeasuredFeatureDef, MeasuredFeatureDef } from "../../../metadata/types";

const testCsv = `CellId,volumeviewerPath,thumbnailPath,feature1,feature2,feature3,discretefeature
potato,https://example.com/1/raw.ome.zarr,https://example.com/1.png,1,2,3,A
garbanzo,https://example.com/2/raw.ome.zarr,https://example.com/2.jpeg,7,3.4,1,B
turnip,https://example.com/3/raw.ome.zarr,https://example.com/3.jpeg,4,5,6,B
rutabaga,https://example.com/4/raw.ome.zarr,https://example.com/4.jpeg,9,2.8,NaN,C`;

const bffCsv = `File ID,File Name,Cell Line,Structure,Gene,Colony Position,Instrument Id,Plate Barcode,Well Name,File Path,Thumbnail,File Size,Uploaded
35,3500000635_100X_20170227_F07_P23.ome.tiff,AICS-12,Microtubules,TUBA1B,center,5,3500000635,F7,https://animatedcell-test-data.s3.us-west-2.amazonaws.com/variance/35.zarr,https://s3-us-west-2.amazonaws.com/bisque.allencell.org/v2.0.0/Cell-Viewer_Thumbnails/AICS-12/AICS-12_35.png,0,0
37,3500000635_100X_20170227_F06_P30.ome.tiff,AICS-12,Microtubules,TUBA1B,Center,5,3500000635,F6,https://animatedcell-test-data.s3.us-west-2.amazonaws.com/variance/37.zarr,https://s3-us-west-2.amazonaws.com/bisque.allencell.org/v2.0.0/Cell-Viewer_Thumbnails/AICS-12/AICS-12_37.png,0,0
40,3500000635_100X_20170227_E08_P12.ome.tiff,AICS-12,Microtubules,TUBA1B,center,5,3500000635,E8,https://animatedcell-test-data.s3.us-west-2.amazonaws.com/variance/40.zarr,https://s3-us-west-2.amazonaws.com/bisque.allencell.org/v2.0.0/Cell-Viewer_Thumbnails/AICS-12/AICS-12_40.png,0,0
44,3500000635_100X_20170227_F07_P25.ome.tiff,AICS-12,Microtubules,TUBA1B,center,5,3500000635,F7,https://animatedcell-test-data.s3.us-west-2.amazonaws.com/variance/44.zarr,https://s3-us-west-2.amazonaws.com/bisque.allencell.org/v2.0.0/Cell-Viewer_Thumbnails/AICS-12/AICS-12_44.png,0,0"
`;

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

    it("detects discrete vs. numeric features", async () => {
        const csvDataset = new CsvRequest(testCsv);

        const featureDefs = (await csvDataset.getMeasuredFeatureDefs()).reduce((acc, def) => {
            acc[def.key] = def;
            return acc;
        }, {} as Record<string, MeasuredFeatureDef>);
        expect(featureDefs["feature1"].discrete).to.be.false;
        expect(featureDefs["feature2"].discrete).to.be.false;
        expect(featureDefs["feature3"].discrete).to.be.false;
        expect(featureDefs["discretefeature"].discrete).to.be.true;

        const discreteDef = featureDefs["discretefeature"] as DiscreteMeasuredFeatureDef;
        const options = discreteDef.options;
        expect(options["0"].name).to.equal("A");
        expect(options["0"].key).to.equal("A");
        expect(options["0"].count).to.equal(1);

        expect(options["1"].name).to.equal("B");
        expect(options["1"].key).to.equal("B");
        expect(options["1"].count).to.equal(2);

        expect(options["2"].name).to.equal("C");
        expect(options["2"].key).to.equal("C");
        expect(options["2"].count).to.equal(1);
    });

    it("handles spaces in CSV input", async () => {
        const csvString = ` feature1, feature2, discrete feature 
        1 , 2 , A
        7,\t2, B  `;
        const csvDataset = new CsvRequest(csvString);
        const featureData = await csvDataset.getFeatureData();
        expect(featureData.values["feature1"]).to.deep.equal([1, 7]);
        expect(featureData.values["feature2"]).to.deep.equal([2, 2]);
        expect(featureData.values["discrete feature"]).to.deep.equal([0, 1]);

        // Discrete feature options should not have spaces
        const discreteDef = (await csvDataset.getMeasuredFeatureDefs()).find(
            (def) => def.key === "discrete feature"
        ) as DiscreteMeasuredFeatureDef;
        const options = discreteDef.options;
        expect(options["0"].name).to.equal("A");
        expect(options["1"].name).to.equal("B");
    });

    it("drops empty header columns", async () => {
        const csvString = `feature1,,feature3
        1,2,A
        4,5,B`;
        const csvDataset = new CsvRequest(csvString);
        const featureData = await csvDataset.getFeatureData();
        expect(featureData.values).to.deep.equal({
            feature1: [1, 4],
            feature3: [0, 1], // A->0 B->1
        });
    });

    it("handles NaN values", async () => {
        const csvString = `feature1,feature2,feature3
        1,NaN,A
        nan,5,B`;
        const csvDataset = new CsvRequest(csvString);
        const featureData = await csvDataset.getFeatureData();
        expect(featureData.values).to.deep.equal({
            feature1: [1, NaN],
            feature2: [NaN, 5],
            feature3: [0, 1], // A->0 B->1
        });
    });

    it("handles empty values", async () => {
        const csvString = `feature1,feature2,feature3
        1,,A
        ,5,B
        6,`;
        const csvDataset = new CsvRequest(csvString);
        const featureData = await csvDataset.getFeatureData();
        expect(featureData.values).to.deep.equal({
            feature1: [1, null, 6],
            feature2: [null, 5, null],
            feature3: [0, 1, null], // A->0 B->1
        });
    });

    it("drops features with no valid values", async () => {
        const csvString = `feature1,feature2,feature3
        A,,
        B,`;
        const csvDataset = new CsvRequest(csvString);
        const featureData = await csvDataset.getFeatureData();
        expect(featureData.values).to.deep.equal({
            feature1: [0, 1],
        });
    });

    it("drops empty rows", async () => {
        const csvString = `feature1,feature2\nA,1\n   \n\t\nB,2\n`;
        const csvDataset = new CsvRequest(csvString);
        const featureData = await csvDataset.getFeatureData();
        expect(featureData.values).to.deep.equal({
            feature1: [0, 1],
            feature2: [1, 2],
        });
    });

    it("distinguishes capitalization", () => {
        const csvString = `feature1
        A
        a
        B
        b`;
        const csvDataset = new CsvRequest(csvString);
        // All values have unique indices
        csvDataset.getFeatureData().then((featureData) => {
            expect(featureData.values["feature1"]).to.deep.equal([0, 1, 2, 3]);
        });
    });

    describe("groupby behavior", () => {
        it("uses the BFF default group by key if present", async () => {
            const csvString = `Cell Line,Structure
            A,Structure1
            B,Structure2,
            B,Structure3
            `;
            const csvDataset = new CsvRequest(csvString);
            const selectedDataset = await csvDataset.selectDataset();
            expect(selectedDataset.defaultGroupBy).to.equal("Cell Line");
        });

        it("uses first discrete feature as groupby feature", async () => {
            const csvDataset = new CsvRequest(testCsv);
            const selectedDataset = await csvDataset.selectDataset();

            expect(selectedDataset.defaultGroupBy).to.equal("discretefeature");
        });

        it("creates default groupby feature if no discrete feature is present", async () => {
            const csvString = `Feature1,Feature2
            0,1
            3,2
            123,1`;
            const csvDataset = new CsvRequest(csvString);
            const selectedDataset = await csvDataset.selectDataset();
            expect(selectedDataset.defaultGroupBy).to.equal(DEFAULT_GROUPBY_NONE);
        });
    });

    // describe("handles BioFile Finder CSVs", () => {
    //     it("ignores reserved metadata keys when determining features", () => {
    //         throw new Error("Test not implemented");
    //     });

    //     it("parses expected features", () => {
    //         throw new Error("Test not implemented");
    //     });

    //     it("extracts thumbnail, cell ID, and file path", () => {
    //         throw new Error("Test not implemented");
    //     });
    // });

    /**
     * TODO:
     * - Check for empty values in CSV input
     * - Check for null/NaN values in CSV input
     * - Check for handling of BFF-specific column names (they should be remapped)
     * - Check that metadata columns are parsed correctly
     * - Check that metadata-related columns are not parsed as features
     */
});

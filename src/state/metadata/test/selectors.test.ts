import { expect } from "chai";

import { mockState } from "../../test/mocks";
import { State } from "../../types";
import { compareVersions, getDatasetsByNewest, getMeasuredFeaturesKeys, getProteinNames } from "../selectors";

describe("Metadata branch selectors", () => {
    describe("getMeasuredFeaturesKeys", () => {
        it("returns the keys of measured features data", () => {
            const state: State = {
                ...mockState,
            };
            const result: string[] = getMeasuredFeaturesKeys(state);
            expect(result).to.deep.equal([
                "apical-proximity",
                "cell-segmentation",
                "cellular-surface-area",
                "missing-data",
            ]);
        });
    });
    describe("getProteinNames", () => {
        it("returns names of the proteins in the dataset", () => {
            const state: State = {
                ...mockState,
            };
            const result: string[] = getProteinNames(state).sort((a: string, b: string) => {
                return b > a ? 1 : -1;
            });
            expect(result).to.deep.equal([
                "Nucleophosmin",
                "Delta-actin",
                "Beta-catenin",
                "Beta-actin",
                "Alpha-actinin-1",
            ]);
        });
    });

    describe("compareVersions", () => {
        it("returns a negative if the major version of the first item is greater", () => {
            const result = compareVersions("2021.1", "2020.1");
            const resultNoMinor = compareVersions("2021", "2020");

            expect(result).to.be.lessThan(0);
            expect(resultNoMinor).to.be.lessThan(0);
        })
        it("returns a negative if the first item has a minor version and the second doesn't", () => {
            const result = compareVersions("2021.1", "2021");
            
            expect(result).to.be.lessThan(0);
        });
        it("returns negative if the minor version of the first item is greater", () => {
            const result = compareVersions("2020.2", "2020.1");
            const resultDoubleDigit = compareVersions("2020.10", "2020.1");
            
            expect(result).to.be.lessThan(0);
            expect(resultDoubleDigit).to.be.lessThan(0);
        });
        it("returns negative if the patch version of the first item is greater", () => {
            const result = compareVersions("2020.2.2", "2020.1.0");
            const resultDoubleDigit = compareVersions("2020.10", "2020.1");
            
            expect(result).to.be.lessThan(0);
            expect(resultDoubleDigit).to.be.lessThan(0);
        });
        it("returns 0 if versions are the same", () => {
            const resultMajor = compareVersions("2020", "2020");
            const resultMinor = compareVersions("2020.1", "2020.1");
            const resultPatch = compareVersions("2020.1.1", "2020.1.1");

            expect(resultMajor).to.equal(0);
            expect(resultMinor).to.equal(0);
            expect(resultPatch).to.equal(0);

        });
    })

    describe("getDatasetsByNewest", () => {
        it("returns the dataset card data in the order of newest to oldest", () => {
            const dataset1 = {
                name: "name1",
                version: "2020.1",
            };
            const dataset2 = {
                name: "name1",
                version: "2021.1",
            };
            const state: State = {
                ...mockState,
                metadata: {
                    datasets: [dataset1, dataset2],
                },
            };
            const result: string[] = getDatasetsByNewest(state);
            expect(result).to.deep.equal([dataset2, dataset1]);
        });
        it("returns the dataset card data in the order of newest to oldest", () => {
            const dataset1 = {
                name: "name1",
                version: "2021.1",
            };
            const dataset2 = {
                name: "name1",
                version: "2021.2",
            };
            const state: State = {
                ...mockState,
                metadata: {
                    datasets: [dataset1, dataset2],
                },
            };
            const result: string[] = getDatasetsByNewest(state);
            expect(result).to.deep.equal([dataset2, dataset1]);
        });
        it("returns the dataset card data with datasets grouped by name", () => {
            const newerName1 = {
                name: "name1",
                version: "2021.2",
            };
            const dataset2 = {
                name: "name2",
                version: "2021.2",
            };
            const olderName1 = {
                name: "name1",
                version: "2021.1",
            };
            const state: State = {
                ...mockState,
                metadata: {
                    datasets: [newerName1, dataset2, olderName1],
                },
            };
            const result: string[] = getDatasetsByNewest(state);
            expect(result).to.deep.equal([dataset2, newerName1, olderName1]);
        });
    });
});

import { expect } from "chai";

import { mockState } from "../../test/mocks";
import { State } from "../../types";
import { getDatasetsByNewest, getMeasuredFeaturesKeys, getProteinNames } from "../selectors";

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

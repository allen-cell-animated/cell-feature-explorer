import { expect } from "chai";

import { State } from "../../types";

import { mockState } from "../../test/mocks";
import {
    getFeatureNames,
    getProteinNames, getProteinTotals,
} from "../selectors";

describe("Metadata branch selectors", () => {
    describe("getFeatureNames", () => {
        it("returns the keys of measured features data", () => {
            const state: State = {
                ...mockState,
            };
            const result: string[] = getFeatureNames(state);
            expect(result).to.deep.equal(["feature1", "feature2", "feature3"]);
        });
    });

    describe("getProteinNames", () => {
        it("returns names of the proteins in the dataset", () => {
            const state: State = {
                ...mockState,
            };
            const result: string[] = getProteinNames(state);
            expect(result).to.deep.equal(["protein2", "protein1"]);
        });
    });

    describe("getProteinTotals", () => {
        it("returns array the totals for each protein name", () => {
            const state: State = {
                ...mockState,
            };
            const result: number[] = getProteinTotals(state);
            expect(result).to.deep.equal([2, 2]);
        });
    });

});

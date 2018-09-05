import { expect } from "chai";
import { uniq } from "lodash";

import { State } from "../../types";

import { mockState } from "../../test/mocks";
import {
    getFeatureNames,
    getProteinNames, getProteinTotals,
} from "../selectors";

describe("Metadata branch selectors", () => {
    const cellIDs = ["AICS-1", "AICS-2", "AICS-3", "AICS-4"];
    const proteinNames = ["protein1", "protein2", "protein1", "protein2"];
    const newMockState = mockState(cellIDs, proteinNames);
    describe("getFeatureNames", () => {
        it("returns the keys of measured features data", () => {
            const state: State = {
                ...newMockState,
            };
            const result: string[] = getFeatureNames(state);
            expect(result).to.deep.equal(["feature1", "feature2", "feature3"]);
        });
    });

    describe("getProteinNames", () => {
        it("returns names of the proteins in the dataset", () => {
            const state: State = {
                ...newMockState,
            };
            const result: string[] = getProteinNames(state).sort((a: string, b: string) => {
                return b > a ? 1 : -1;
            });
            expect(result).to.deep.equal(uniq(proteinNames).sort((a: string, b: string) => {
                return b > a ? 1 : -1;
            }));
        });
    });

    describe("getProteinTotals", () => {
        it("returns array the totals for each protein name", () => {
            const state: State = {
                ...newMockState,
            };
            const result: number[] = getProteinTotals(state);
            expect(result).to.deep.equal([2, 2]);
        });
    });

});

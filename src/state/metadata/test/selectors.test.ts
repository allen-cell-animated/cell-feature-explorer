import { expect } from "chai";
import { uniq } from "lodash";

import { mockState } from "../../test/mocks";
import { State } from "../../types";
import {
    getProteinNames,
} from "../selectors";

describe("Metadata branch selectors", () => {
    const cellIDs = ["AICS-1_1_1", "AICS-2_2_2", "AICS-3_3_3", "AICS-4_4_4"];
    const proteinNames = ["protein1", "protein2", "protein1", "protein2"];
    const feature1Values = [1, 4, 2, 1];
    const feature2Values = [2, 4, 2, 4];
    const newMockState = mockState(cellIDs, proteinNames, feature1Values, feature2Values);
    describe("getFeatureNames", () => {
        it("returns the keys of measured features data", () => {
            const state: State = {
                ...newMockState,
            };
            const result: string[] = getFeatureNames(state);
            expect(result).to.deep.equal(["feature1", "feature2"]);
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

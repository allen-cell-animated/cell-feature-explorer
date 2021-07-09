import { expect } from "chai";

import { mockState } from "../../test/mocks";
import { State } from "../../types";
import { getMeasuredFeaturesKeys, getProteinNames } from "../selectors";

describe("Metadata branch selectors", () => {

    describe("getMeasuredFeaturesKeys", () => {
        it("returns the keys of measured features data", () => {
            const state: State = {
                ...mockState,
            };
            const result: string[] = getMeasuredFeaturesKeys(state);
            expect(result).to.deep.equal(["apical-proximity", "cell-segmentation", "cellular-surface-area"]);
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
            expect(result).to.deep.equal(["Nucleophosmin", "Delta-actin", "Beta-catenin", "Beta-actin", "Alpha-actinin-1"]);
        });
    });

});

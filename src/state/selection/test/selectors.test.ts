import { expect } from "chai";

import { mockState } from "../../test/mocks";
import { NumberOrString, State } from "../../types";
import {
    getSelectedGroupKeys,
    getSelectedSetTotals,
    getFilteredXValues,
    getFilteredYValues,
    getGroupingCategoryNames,
} from "../selectors";

describe("Selection selectors", () => {
    const newMockState = mockState;

    describe("getFilteredXValues selector", () => {
        it("returns an array of values that correspond to the currently selected x value", () => {
            const state: State = {
                ...newMockState,
                selection: {
                    ...newMockState.selection,
                    plotByOnX: "apical-proximity",
                },
            };
            const result: (number | null)[] = getFilteredXValues(state);
            const newState = {
                ...state,
                selection: {
                    ...newMockState.selection,
                    plotByOnX: "cell-segmentation",
                },
            };
            const feature1Values = [-0.25868651080317, -0.1];
            const feature2Values = [1, 0];

            const newResult: (number | null)[] = getFilteredXValues(newState);
            expect(result).to.deep.equal(feature1Values);
            expect(newResult).to.deep.equal(feature2Values);
            expect(result.length).to.equal(newResult.length);
        });
    });
    describe("getFilteredYValues selector", () => {
        it("returns an array of values that correspond to the currently selected y value", () => {
            const state: State = {
                ...newMockState,
                selection: {
                    ...newMockState.selection,
                    plotByOnY: "apical-proximity",
                },
            };
            const result: (number | null)[] = getFilteredYValues(state);
            const newState = {
                ...state,
                selection: {
                    ...newMockState.selection,
                    plotByOnY: "cell-segmentation",
                },
            };
            const newResult: (number | null)[] = getFilteredYValues(newState);
            expect(result).to.not.deep.equal(newResult);
            expect(result.length).to.equal(newResult.length);
        });
    });
    describe("getSelectedGroupKeys selector", () => {
        it("it returns the keys of the selected groups, may be strings or numbers", () => {
            const state: State = {
                ...newMockState,
                selection: {
                    ...newMockState.selection,
                    selectedGroups: {
                        id1: [1, 2, 3, 4],
                        id2: [2, 3, 4, 5],
                    },
                },
            };

            const result: NumberOrString[] = getSelectedGroupKeys(state);
            expect(result).to.deep.equal(["id1", "id2"]);
        });
        it("it returns an empty array if no selected groups", () => {
            const state: State = {
                ...newMockState,
            };

            const result: NumberOrString[] = getSelectedGroupKeys(state);
            expect(result).to.deep.equal([]);
        });
    });
    describe("getSelectedSetTotals selector", () => {
        it("it returns an array where each value is the total number of points in that group", () => {
            const state: State = {
                ...newMockState,
                selection: {
                    ...newMockState.selection,
                    selectedGroups: {
                        id1: [1, 2, 3, 4],
                        id2: [2, 3, 4, 5, 6, 7, 8],
                    },
                },
            };
            const total1 = state.selection.selectedGroups.id1.length;
            const total2 = state.selection.selectedGroups.id2.length;

            const result: number[] = getSelectedSetTotals(state);
            expect(result).to.deep.equal([total1, total2]);
        });
    });
    describe("getGroupingCategoryNames", () => {
        it("returns names of the categories in the dataset", () => {
            const state: State = {
                ...mockState,
            };
            const result: string[] = getGroupingCategoryNames(state);

            expect(result).to.deep.equal([
                "Actin filaments",
                "Endoplasmic reticulum",
                "Matrix adhesions",
                "Microtubules",
                "Mitochondria",
            ]);
        });
    });
});

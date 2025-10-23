import { describe, it, expect } from "vitest";

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
                    plotByOnX: "anaphase-segmentation-complete",
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
                    plotByOnY: "anaphase-segmentation-complete",
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
                        id1: [
                            { cellId: "1", pointIndex: 0 },
                            { cellId: "2", pointIndex: 1 },
                            { cellId: "3", pointIndex: 2 },
                            { cellId: "4", pointIndex: 3 },
                        ],
                        id2: [
                            { cellId: "2", pointIndex: 1 },
                            { cellId: "3", pointIndex: 3 },
                            { cellId: "4", pointIndex: 3 },
                            { cellId: "5", pointIndex: 4 },
                        ],
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
                        id1: [
                            { cellId: "1", pointIndex: 0 },
                            { cellId: "2", pointIndex: 1 },
                            { cellId: "3", pointIndex: 2 },
                            { cellId: "4", pointIndex: 3 },
                        ],
                        id2: [
                            { cellId: "2", pointIndex: 1 },
                            { cellId: "3", pointIndex: 3 },
                            { cellId: "4", pointIndex: 3 },
                            { cellId: "5", pointIndex: 4 },
                            { cellId: "6", pointIndex: 5 },
                            { cellId: "7", pointIndex: 6 },
                            { cellId: "8", pointIndex: 7 },
                        ],
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

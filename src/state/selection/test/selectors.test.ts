import { expect } from "chai";

import { mockState } from "../../test/mocks";
import {
    Annotation,
    NumberOrString,
    State,
    Thumbnail,
} from "../../types";

import {
    getAnnotations,
    getSelectedGroupKeys,
    getSelectedSetTotals,
    getThumbnails,
    getXValues,
    getYValues,
} from "../selectors";

describe("Selection selectors", () => {
    const cellIDs = ["AICS-1_1_1", "AICS-2_2_2", "AICS-3_3_3", "AICS-4_4_4"];
    const proteinNames = ["protein1", "protein2", "protein1", "protein2"];
    const feature1Values = [1, 4, 2, 1];
    const feature2Values = [2, 4, 2, 4];

    const newMockState = mockState(cellIDs, proteinNames, feature1Values, feature2Values);
    describe("getXValues selector", () => {
        it("returns an array of values that correspond to the currently selected x value", () => {

                const state: State = {
                    ...newMockState,
                    selection: {
                        ...newMockState.selection,
                        plotByOnX: "feature1",
                    },
                };
                const result: number[] = getXValues(state);
                const newState = {
                    ...state,
                    selection: {
                        ...newMockState.selection,
                        plotByOnX: "feature2",
                    },
                };
                const newResult: number[] = getXValues(newState);
                expect(result).to.deep.equal(feature1Values);
                expect(newResult).to.deep.equal(feature2Values);
                expect(result.length).to.equal(newResult.length);
        });
    });
    describe("getYValues selector", () => {
        it("returns an array of values that correspond to the currently selected y value", () => {

            const state: State = {
                ...newMockState,
                selection: {
                    ...newMockState.selection,
                    plotByOnY: "feature1",
                },
            };
            const result: number[] = getYValues(state);
            const newState = {
                ...state,
                selection: {
                    ...newMockState.selection,
                    plotByOnY: "feature2",
                },
            };
            const newResult: number[] = getYValues(newState);
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

    describe("getThumbnails selector", () => {
        it("it returns a thumbnail object for every index in selectedPoints array", () => {

            const state: State = {
                ...newMockState,
                selection: {
                    ...newMockState.selection,
                    selectedPoints: [1, 2],
                },
            };

            const result: Thumbnail[] = getThumbnails(state);
            expect(result).to.have.lengthOf(2);
        });

    });

    describe("getAnnotations selector", () => {
        it("it returns an Annotation object for every index in selectedPoints array", () => {

            const state: State = {
                ...newMockState,
                selection: {
                    ...newMockState.selection,
                    plotByOnX: "feature1",
                    plotByOnY: "feature2",
                    selectedPoints: [1, 2],
                },
            };
            const result: Annotation[] = getAnnotations(state);
            expect(result).to.have.lengthOf(2);
        });

    });
});

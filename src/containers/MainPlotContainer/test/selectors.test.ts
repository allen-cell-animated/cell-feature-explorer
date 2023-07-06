import { expect } from "chai";

import { mockState, selectedCellFileInfo } from "../../../state/test/mocks";
import { Annotation, State } from "../../../state/types";
import { getAnnotations, handleNullValues } from "../selectors";

describe("Selection selectors", () => {
    const newMockState = mockState;

    describe("handleNullValues helper function", () => {
        it("syncs null values between two arrays", () => {
            const array1 = [null, 3, 5, null];
            const array2 = [2, 4, null, null];
            const result = handleNullValues(array1, array2);

            expect(result.xValues).to.deep.equal([null, 3, null, null]);
            expect(result.yValues).to.deep.equal([null, 4, null, null]);
        });
        it("replaces arrays full of nulls with empty arrays", () => {
            const array1 = [null, 3, 5, null];
            const array2 = [2, null, null, null];
            const result = handleNullValues(array1, array2);

            expect(result.xValues).to.deep.equal([]);
            expect(result.yValues).to.deep.equal([]);
        });
    });
    describe("getAnnotations selector", () => {
        it("it returns an Annotation object for every index in selectedPoints array", () => {
            const state: State = {
                ...newMockState,
                selection: {
                    ...newMockState.selection,
                    plotByOnX: "apical-proximity",
                    plotByOnY: "apical-proximity",
                    selectedPoints: selectedCellFileInfo,
                },
            };
            const result: Annotation[] = getAnnotations(state);
            expect(result).to.have.lengthOf(2);
        });
    });
    describe("getAnnotations selector", () => {
        it("it filters out non visible points", () => {
            const state: State = {
                ...newMockState,
                selection: {
                    ...newMockState.selection,
                    plotByOnX: "apical-proximity",
                    plotByOnY: "missing-data",
                    selectedPoints: selectedCellFileInfo,
                },
            };
            const result: Annotation[] = getAnnotations(state);
            expect(result).to.have.lengthOf(0);
        });
    });
    describe("getAnnotations selector", () => {
        it("it still shows points whose values are zero", () => {
            const state: State = {
                ...newMockState,
                selection: {
                    ...newMockState.selection,
                    plotByOnX: "apical-proximity",
                    plotByOnY: "anaphase-segmentation-complete",
                    selectedPoints: selectedCellFileInfo,
                },
            };
            const result: Annotation[] = getAnnotations(state);
            expect(result).to.have.lengthOf(2);
        });
    });
});

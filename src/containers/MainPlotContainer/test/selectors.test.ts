import { expect } from "chai";

import { mockState, selectedCellFileInfo } from "../../../state/test/mocks";
import { Annotation, State } from "../../../state/types";
import { getAnnotations } from "../selectors";

describe("Selection selectors", () => {
    const newMockState = mockState;

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
                    plotByOnY: "cell-segmentation",
                    selectedPoints: selectedCellFileInfo,
                },
            };
            const result: Annotation[] = getAnnotations(state);
            expect(result).to.have.lengthOf(2);
        });
    });
});

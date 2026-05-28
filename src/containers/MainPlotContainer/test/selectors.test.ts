import { describe, it, expect } from "vitest";

import { mockState, selectedCellFileInfo } from "../../../state/test/mocks";
import type { State, AnnotationData } from "../../../state/types";
import { getAnnotations, handleNullValues, makeAnnotations } from "../selectors";
import type { PlotlyAnnotation } from "../../../components/MainPlot";
import { PALETTE } from "../../../constants";

describe("MainPlotContainer selectors", () => {
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
            const result: PlotlyAnnotation[] = getAnnotations(state);
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
            const result: PlotlyAnnotation[] = getAnnotations(state);
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
            const result: PlotlyAnnotation[] = getAnnotations(state);
            expect(result).to.have.lengthOf(2);
        });
    });
    describe("makeAnnotations", () => {
        const baseAnnotation: AnnotationData = {
            cellID: "cell-42",
            fovID: "fov-1",
            hovered: false,
            pointIndex: 3,
            thumbnailPath: "/some/path",
            x: 1.5,
            y: 2.5,
        };

        it("returns non-hovered annotation with translucent white arrow/border, empty text, and ay of 0", () => {
            const result = makeAnnotations([{ ...baseAnnotation, hovered: false }]);
            expect(result).to.have.lengthOf(1);
            const annotation = result[0];
            expect(annotation.arrowcolor).to.equal(PALETTE.translucentWhite);
            expect(annotation.bordercolor).to.equal(PALETTE.translucentWhite);
            expect(annotation.text).to.equal("");
            expect(annotation.ay).to.equal(0);
        });

        it("returns hovered annotation with bright green arrow/border, cell ID text, and ay of -20", () => {
            const result = makeAnnotations([{ ...baseAnnotation, hovered: true }]);
            expect(result).to.have.lengthOf(1);
            const annotation = result[0];
            expect(annotation.arrowcolor).to.equal(PALETTE.brightGreen);
            expect(annotation.bordercolor).to.equal(PALETTE.brightGreen);
            expect(annotation.text).to.equal(`ID: ${baseAnnotation.cellID}`);
            expect(annotation.ay).to.equal(-20);
        });

        it("preserves x, y, cellID, fovID, and pointIndex on the annotation", () => {
            const result = makeAnnotations([baseAnnotation]);
            const annotation = result[0];
            expect(annotation.x).to.equal(baseAnnotation.x);
            expect(annotation.y).to.equal(baseAnnotation.y);
            expect(annotation.cellID).to.equal(baseAnnotation.cellID);
            expect(annotation.fovID).to.equal(baseAnnotation.fovID);
            expect(annotation.pointIndex).to.equal(baseAnnotation.pointIndex);
        });
    });
});

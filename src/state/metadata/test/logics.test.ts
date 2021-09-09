import { expect } from "chai";
import { findVisibleDataPoint } from "../logics";
import { MappingOfMeasuredValuesArraysWithNulls } from "../types";

const length = 4;
const plotByOnX = "plotOnX";
const plotByOnY = "plotOnY";

const testDataWithValues1: MappingOfMeasuredValuesArraysWithNulls = {
    plotOnX: [0, 1, 3, 4],
    plotOnY: [0, null, null, null],
};
const testDataWithValues2: MappingOfMeasuredValuesArraysWithNulls = {
    plotOnX: [0, 1, 3, 4],
    plotOnY: [0, 3, null, null],
};

const testDataWithValues3: MappingOfMeasuredValuesArraysWithNulls = {
    plotOnX: [0, 1, 3, 4],
    plotOnY: [0, 3, 4, null],
};
const testDataWithValues4: MappingOfMeasuredValuesArraysWithNulls = {
    plotOnX: [0, 1, 3, 4],
    plotOnY: [0, 3, 4, 2],
};

const testDataNoValues1: MappingOfMeasuredValuesArraysWithNulls = {
    plotOnX: [0, 1, 3, 4],
    plotOnY: [null, null, null, null],
};

const testDataNoValues2: MappingOfMeasuredValuesArraysWithNulls = {
    plotOnX: [null, null, 3, 4],
    plotOnY: [0, 1, null, null],
};

describe("Metadata logic", () => {
    describe("findIndexWithValues", () => {
        it("returns a number within the given length", () => {
            const result: number[] = [
                findVisibleDataPoint(
                    length,
                    testDataWithValues1[plotByOnX],
                    testDataWithValues1[plotByOnY]
                ),
                findVisibleDataPoint(
                    length,
                    testDataWithValues2[plotByOnX],
                    testDataWithValues2[plotByOnY]
                ),
                findVisibleDataPoint(
                    length,
                    testDataWithValues3[plotByOnX],
                    testDataWithValues3[plotByOnY]
                ),
                findVisibleDataPoint(
                    length,
                    testDataWithValues4[plotByOnX],
                    testDataWithValues4[plotByOnY]
                ),
            ];
            const lessThanLength = result.filter((value) => value < length);

            expect(result.length).to.deep.equal(lessThanLength.length);
        });
        it("will return zero if there are no values for the selected set", () => {

            const result = [
                findVisibleDataPoint(
                    length,
                    testDataNoValues1[plotByOnX],
                    testDataNoValues1[plotByOnY]
                ),
                findVisibleDataPoint(
                    length,
                    testDataNoValues2[plotByOnX],
                    testDataNoValues2[plotByOnY]
                ),
            ];
            expect(result).to.deep.equal([0, 0]);
        });
        it("will return an index that has a value for both x and y", () => {
            const result1 = findVisibleDataPoint(
                length,
                testDataWithValues4[plotByOnX],
                testDataWithValues4[plotByOnY]
            );

            expect(testDataWithValues4[plotByOnX][result1]).to.not.be.null;
            expect(testDataWithValues4[plotByOnY][result1]).to.not.be.null;

            const result2 = findVisibleDataPoint(
                length,
                testDataWithValues4[plotByOnX],
                testDataWithValues4[plotByOnY]
            );

            expect(testDataWithValues4[plotByOnX][result2]).to.not.be.null;
            expect(testDataWithValues4[plotByOnY][result2]).to.not.be.null;
        });
    });
});

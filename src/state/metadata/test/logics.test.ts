import { expect } from "chai";
import { findIndexWithValues } from "../logics";
import { MappingOfMeasuredValuesArraysWithNulls } from "../types";

const length = 4;
const startIndex = 2;
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
let alreadyChecked = new Map();

describe("Metadata logic", () => {
    beforeEach(() => {
        alreadyChecked = new Map();
    });
    describe("findIndexWithValues", () => {
        it("returns a number within the given length", () => {
            const result: number[] = [
                findIndexWithValues(
                    length,
                    startIndex,
                    plotByOnX,
                    plotByOnY,
                    alreadyChecked,
                    testDataWithValues1
                ),
                findIndexWithValues(
                    length,
                    startIndex,
                    plotByOnX,
                    plotByOnY,
                    alreadyChecked,
                    testDataWithValues2
                ),
                findIndexWithValues(
                    length,
                    startIndex,
                    plotByOnX,
                    plotByOnY,
                    alreadyChecked,
                    testDataWithValues3
                ),
                findIndexWithValues(
                    length,
                    startIndex,
                    plotByOnX,
                    plotByOnY,
                    alreadyChecked,
                    testDataWithValues4
                ),
            ];
            const lessThanLength = result.filter((value) => value < length);

            expect(result.length).to.deep.equal(lessThanLength.length);
        });
        it("will return zero if there are no values for the selected set", () => {
            const alreadyChecked = new Map();

            const result = [
                findIndexWithValues(
                    length,
                    startIndex,
                    plotByOnX,
                    plotByOnY,
                    alreadyChecked,
                    testDataNoValues1
                ),
                findIndexWithValues(
                    length,
                    startIndex,
                    plotByOnX,
                    plotByOnY,
                    alreadyChecked,
                    testDataNoValues2
                ),
            ];
            expect(result).to.deep.equal([0, 0]);
        });
        it("will return an index that has a value for both x and y", () => {
            const alreadyChecked1 = new Map();
            const result1 = findIndexWithValues(
                length,
                startIndex,
                plotByOnX,
                plotByOnY,
                alreadyChecked1,
                testDataWithValues4
            );

            expect(testDataWithValues4[plotByOnX][result1]).to.not.be.null;
            expect(testDataWithValues4[plotByOnY][result1]).to.not.be.null;

            const alreadyChecked2 = new Map();
            const result2 = findIndexWithValues(
                length,
                startIndex,
                plotByOnX,
                plotByOnY,
                alreadyChecked2,
                testDataWithValues4
            );

            expect(testDataWithValues4[plotByOnX][result2]).to.not.be.null;
            expect(testDataWithValues4[plotByOnY][result2]).to.not.be.null;
        });
    });
});

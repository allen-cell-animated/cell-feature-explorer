import { expect } from "chai";
import { findIndexWithValues } from "../logics";
import { MappingOfMeasuredValuesArrays } from "../types";

const length = 4;
const startIndex = 2;
const plotByOnX = "plotOnX";
const plotByOnY = "plotOnY";
const testDataWithValues1 = {
    plotOnX: [0, 1, 3, 4],
    plotOnY: [0, null, null, null],
};
const testDataWithValues2 = {
    plotOnX: [0, 1, 3, 4],
    plotOnY: [0, 3, null, null],
};

const testDataWithValues3 = {
    plotOnX: [0, 1, 3, 4],
    plotOnY: [0, 3, 4, null],
};
const testDataWithValues4 = {
    plotOnX: [0, 1, 3, 4],
    plotOnY: [0, 3, 4, 2],
};

const testDataNoValues1 = {
    plotOnX: [0, 1, 3, 4],
    plotOnY: [null, null, null, null],
};

const testDataNoValues2 = {
    plotOnX: [null, null, 3, 4],
    plotOnY: [0, 1, null, null],
};
let alreadyChecked = new Map();

describe("Metadata logic", () => {
    beforeEach(() => {
        alreadyChecked = new Map();

    })
    describe("findIndexWithValues", () => {
        it("returns a number within the given length", () => {

            const result: number[] = [
                findIndexWithValues(
                    length,
                    startIndex,
                    plotByOnX,
                    plotByOnY,
                    alreadyChecked,
                    testDataWithValues1 as MappingOfMeasuredValuesArrays
                ),
                findIndexWithValues(
                    length,
                    startIndex,
                    plotByOnX,
                    plotByOnY,
                    alreadyChecked,
                    testDataWithValues2 as MappingOfMeasuredValuesArrays
                ),
                findIndexWithValues(
                    length,
                    startIndex,
                    plotByOnX,
                    plotByOnY,
                    alreadyChecked,
                    testDataWithValues3 as MappingOfMeasuredValuesArrays
                ),
                findIndexWithValues(
                    length,
                    startIndex,
                    plotByOnX,
                    plotByOnY,
                    alreadyChecked,
                    testDataWithValues4 as MappingOfMeasuredValuesArrays
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
                    testDataNoValues1 as MappingOfMeasuredValuesArrays
                ),
                findIndexWithValues(
                    length,
                    startIndex,
                    plotByOnX,
                    plotByOnY,
                    alreadyChecked,
                    testDataNoValues2 as MappingOfMeasuredValuesArrays
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
                    testDataWithValues4 as MappingOfMeasuredValuesArrays
                )
              
                
            expect(testDataWithValues4[plotByOnX][result1]).to.not.be.null;
            expect(testDataWithValues4[plotByOnY][result1]).to.not.be.null;
            
            const alreadyChecked2 = new Map();
            const result2 = findIndexWithValues(
                length,
                startIndex,
                plotByOnX,
                plotByOnY,
                alreadyChecked2,
                testDataWithValues4 as MappingOfMeasuredValuesArrays
            );

            expect(testDataWithValues4[plotByOnX][result2]).to.not.be.null;
            expect(testDataWithValues4[plotByOnY][result2]).to.not.be.null;

        });
    });
});

import { expect } from "chai";

import { mockState } from "../../../state/test/mocks";
import {
    State,
    Thumbnail,
} from "../../../state/types";
import {
    getThumbnails,
} from "../selectors";

describe("Thumbnail selectors", () => {
    const cellIDs = ["AICS-1_1_1", "AICS-2_2_2", "AICS-3_3_3", "AICS-4_4_4"];
    const proteinNames = ["protein1", "protein2", "protein1", "protein2"];
    const feature1Values = [1, 4, 2, 1];
    const feature2Values = [2, 4, 2, 4];

    const newMockState = mockState(cellIDs, proteinNames, feature1Values, feature2Values);

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

});

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

    const newMockState = {...mockState};

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

import { describe, it, expect } from "vitest";
import {
    CELL_ID_KEY,
    FOV_ID_KEY,
    FOV_THUMBNAIL_PATH,
    FOV_VOLUME_VIEWER_PATH,
    THUMBNAIL_PATH,
    VOLUME_VIEWER_PATH,
} from "../../../constants";

import { mockState } from "../../../state/test/mocks";
import { State, Thumbnail } from "../../../state/types";
import { getThumbnails } from "../selectors";

describe("Thumbnail selectors", () => {
    const newMockState = { ...mockState };

    describe("getThumbnails selector", () => {
        it("it returns a thumbnail object for every index in selectedPoints array", () => {
            const state: State = {
                ...newMockState,
                selection: {
                    ...newMockState.selection,
                    selectedPoints: [
                        {
                            [CELL_ID_KEY]: "1",
                            [FOV_ID_KEY]: "12762",
                            [FOV_THUMBNAIL_PATH]: "path",
                            [FOV_VOLUME_VIEWER_PATH]: "path",
                            [THUMBNAIL_PATH]: "path",
                            [VOLUME_VIEWER_PATH]: "path",
                        },
                        {
                            [CELL_ID_KEY]: "2",
                            [FOV_ID_KEY]: "12762",
                            [FOV_THUMBNAIL_PATH]: "path",
                            [FOV_VOLUME_VIEWER_PATH]: "path",
                            [THUMBNAIL_PATH]: "path",
                            [VOLUME_VIEWER_PATH]: "path",
                        },
                    ],
                },
            };
            const result: Thumbnail[] = getThumbnails(state);
            expect(result).to.have.lengthOf(2);
        });
    });
});

import { expect } from "chai";
import { Timestamp } from "firebase/firestore/";

import { mockState } from "../../test/mocks";
import { State } from "../../types";
import { Megaset } from "../../image-dataset/types";
import { getMeasuredFeaturesKeys, getMegasetsByNewest } from "../selectors";

describe("Metadata branch selectors", () => {
    describe("getMeasuredFeaturesKeys", () => {
        it("returns the keys of measured features data", () => {
            const state: State = {
                ...mockState,
            };
            const result: string[] = getMeasuredFeaturesKeys(state);
            expect(result).to.deep.equal([
                "cell-line",
                "apical-proximity",
                "anaphase-segmentation-complete",
                "cellular-surface-area",
                "missing-data",
            ]);
        });
    });

    describe("getMegasetsByNewest", () => {
        it("returns an array of Megaset objects sorted by dateCreated, newest first", () => {
            const megasetsFromState: Megaset[] = [
                {
                    production: false,
                    name: "middle megaset",
                    datasets: {},
                    title: "Title for middle megaset",
                    dateCreated: new Timestamp(1700000000, 0),
                },
                {
                    production: false,
                    name: "oldest megaset",
                    datasets: {},
                    title: "Title for oldest megaset",
                    dateCreated: new Timestamp(1600000000, 0),
                },
                {
                    production: false,
                    name: "newest megaset",
                    datasets: {},
                    title: "Title for newest megaset",
                    dateCreated: new Timestamp(1800000000, 0),
                },
            ];
            const expected: Megaset[] = [
                {
                    production: false,
                    name: "newest megaset",
                    datasets: {},
                    title: "Title for newest megaset",
                    dateCreated: new Timestamp(1800000000, 0),
                },
                {
                    production: false,
                    name: "middle megaset",
                    datasets: {},
                    title: "Title for middle megaset",
                    dateCreated: new Timestamp(1700000000, 0),
                },
                {
                    production: false,
                    name: "oldest megaset",
                    datasets: {},
                    title: "Title for oldest megaset",
                    dateCreated: new Timestamp(1600000000, 0),
                },
            ];

            const result = getMegasetsByNewest.resultFunc(megasetsFromState);
            expect(result).to.deep.equal(expected);
        });
    });
});

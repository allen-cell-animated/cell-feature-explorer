import { expect } from "chai";
import { firestore } from "firebase";
const { Timestamp } = firestore;

import { mockState } from "../../test/mocks";
import { State } from "../../types";
import { Megaset } from "../../image-dataset/types";
import { getMeasuredFeaturesKeys, getProteinNames, getMegasetsByNewest } from "../selectors";

describe("Metadata branch selectors", () => {
    describe("getMeasuredFeaturesKeys", () => {
        it("returns the keys of measured features data", () => {
            const state: State = {
                ...mockState,
            };
            const result: string[] = getMeasuredFeaturesKeys(state);
            expect(result).to.deep.equal([
                "apical-proximity",
                "cell-segmentation",
                "cellular-surface-area",
                "missing-data",
            ]);
        });
    });
    describe("getProteinNames", () => {
        it("returns names of the proteins in the dataset", () => {
            const state: State = {
                ...mockState,
            };
            const result: string[] = getProteinNames(state).sort((a: string, b: string) => {
                return b > a ? 1 : -1;
            });
            expect(result).to.deep.equal([
                "Nucleophosmin",
                "Delta-actin",
                "Beta-catenin",
                "Beta-actin",
                "Alpha-actinin-1",
            ]);
        });
    });

    describe("getMegasetsByNewest", () => {
        it("returns an array of Megaset objects sorted by dateCreated, newest first", () => {
            const megasetsFromState: Megaset[] = [
                {
                    "production": false,
                    "name": "middle megaset",
                    "datasets": {},
                    "title": "Title for middle megaset",
                    "dateCreated": new Timestamp(1700000000, 0)
                },
                {
                    "production": false,
                    "name": "oldest megaset",
                    "datasets": {},
                    "title": "Title for oldest megaset",
                    "dateCreated": new Timestamp(1600000000, 0)
                },
                {
                    "production": false,
                    "name": "newest megaset",
                    "datasets": {},
                    "title": "Title for newest megaset",
                    "dateCreated": new Timestamp(1800000000, 0)
                },
            ];
            const expected: Megaset[] = [
                {
                    "production": false,
                    "name": "newest megaset",
                    "datasets": {},
                    "title": "Title for newest megaset",
                    "dateCreated": new Timestamp(1800000000, 0)
                },
                {
                    "production": false,
                    "name": "middle megaset",
                    "datasets": {},
                    "title": "Title for middle megaset",
                    "dateCreated": new Timestamp(1700000000, 0)
                },
                {
                    "production": false,
                    "name": "oldest megaset",
                    "datasets": {},
                    "title": "Title for oldest megaset",
                    "dateCreated": new Timestamp(1600000000, 0)
                },
            ]

            const result = getMegasetsByNewest.resultFunc(megasetsFromState);
            expect(result).to.deep.equal(expected);
        })
    })
});

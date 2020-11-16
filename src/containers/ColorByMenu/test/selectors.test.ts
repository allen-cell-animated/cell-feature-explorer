import { expect } from "chai";
import { map, reduce, uniq } from "lodash";

import { DOWNLOAD_CONFIG_TYPE_PROTEIN } from "../../../constants/index";
import { mockState } from "../../../state/test/mocks";
import { State } from "../../../state/types";
import {
    getInteractivePanelData,
    getListOfCellIdsByDownloadConfig,
    getSelectionPanelData
} from "../selectors";
import { PanelData } from "../types";

describe("ColorByMenu selectors", () => {

    const newMockState = mockState;

    describe("getInteractivePanelData", () => {

        it("returns an set of props for each protein in state", () => {

            const result: PanelData[] = getInteractivePanelData(newMockState);

        });
    });

    describe("getSelectionPanelData", () => {
        it("returns an empty array if no selections", () => {
            const result: PanelData[] = getSelectionPanelData(newMockState);
            expect(result.length).to.deep.equal(0);
        });

        it("returns an array of panel props", () => {
            const state: State = {
                ...newMockState,
                selection: {
                    ...newMockState.selection,
                    selectedGroups: {
                        id1: [1, 2, 3, 4],
                        id2: [2, 3, 4, 5],
                    },
                },
            };
            const result: PanelData[] = getSelectionPanelData(state);
            expect(result.length).to.deep.equal(2);

        });

    });

    describe("getListOfCellIdsByDownloadConfig", () => {

        it("returns an empty array if there is no download config", () => {
            const result: string[] = getListOfCellIdsByDownloadConfig(newMockState);
            expect(result.length).to.deep.equal(0);
        });

        it("returns an array of cell ids that match the protein name if that is the download config type", () => {
            const state: State = {
                ...newMockState,
                selection: {
                    ...newMockState.selection,
                    downloadConfig : {
                        // key: proteinNames[0],
                        type: DOWNLOAD_CONFIG_TYPE_PROTEIN,
                    },
                },
            };

            const init: number[] = [];
            // const expectedIndexes = reduce(proteinNames,
            //     (acc, cur, index) => {
            //     if (cur === proteinNames[0]) {
            //         acc.push(index);
            //     }
            //     return acc;
            //         }, init);
            // const expectedIds: string[] = map(expectedIndexes, (index: number) => `C${cellIDs[index].split("_")[2]}`);

            const result: string[] = getListOfCellIdsByDownloadConfig(state);
            expect(result).to.deep.equal([]);

        });
    });

});

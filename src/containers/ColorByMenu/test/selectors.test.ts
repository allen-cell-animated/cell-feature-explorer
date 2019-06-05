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
    const cellIDs = ["AICS-1_1_1", "AICS-2_2_2", "AICS-3_3_3", "AICS-4_4_4"];
    const proteinNames = ["protein1", "protein2", "protein1", "protein2"];
    const feature1Values = [1, 4, 2, 1];
    const feature2Values = [2, 4, 2, 4];
    const newMockState = mockState(cellIDs, proteinNames, feature1Values, feature2Values);

    describe("getInteractivePanelData", () => {

        it("returns an set of props for each protein in state", () => {
            const newCellIDs = [...cellIDs, "AICS-5_5_5"];
            const newProteinNames = [...proteinNames, "protein3"];
            const anotherState = mockState(newCellIDs, newProteinNames, feature1Values, feature2Values);
            const result: PanelData[] = getInteractivePanelData(newMockState);
            const anotherResult: PanelData[] = getInteractivePanelData(anotherState);
            expect(result.length).to.deep.equal(uniq(proteinNames).length);
            expect(anotherResult.length).to.deep.equal(uniq(newProteinNames).length);

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
                        key: proteinNames[0],
                        type: DOWNLOAD_CONFIG_TYPE_PROTEIN,
                    },
                },
            };

            const init: number[] = [];
            const expectedIndexes = reduce(proteinNames,
                (acc, cur, index) => {
                if (cur === proteinNames[0]) {
                    acc.push(index);
                }
                return acc;
                    }, init);
            const expectedIds: string[] = map(expectedIndexes, (index: number) => `C${cellIDs[index].split("_")[2]}`);

            const result: string[] = getListOfCellIdsByDownloadConfig(state);
            expect(result).to.deep.equal(expectedIds);

        });
    });

});

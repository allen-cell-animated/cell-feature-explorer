import { expect } from "chai";

import { DOWNLOAD_CONFIG_TYPE_PROTEIN } from "../../../constants/index";
import { mockState } from "../../../state/test/mocks";
import { State } from "../../../state/types";
import {
    disambiguateCategoryNames,
    getInteractivePanelData,
    getListOfCellIdsByDownloadConfig,
    getSelectionPanelData,
} from "../selectors";
import { PanelData } from "../types";

describe("ColorByMenu selectors", () => {
    const newMockState = mockState;

    describe("disambiguateCategoryNames", () => {
        it("attaches the key to each non-unique name", () => {
            const mockData = [
                {
                    name: "same name",
                    key: "1",
                    color: "#ffffff",
                },
                {
                    name: "same name",
                    key: "2",
                    color: "#ffffff",
                },
                {
                    name: "diff name",
                    key: "3",
                    color: "#ffffff",
                },
            ];
            const result = disambiguateCategoryNames(mockData);

            /* Without disambiguation, names would be:
            [
                "same name",
                "same nam",
                "diff name",
            ]
            */
            const expected = ["same name (1)", "same name (2)", "diff name"];
            expect(result).to.deep.equal(expected);
        });
    });

    describe("getInteractivePanelData", () => {
        it("returns an set of props for each category in state", () => {
            const result: PanelData[] = getInteractivePanelData(newMockState);
            const data = [
                {
                    checked: true,
                    color: "#FF96FF",
                    disabled: false,
                    id: "Alpha-actinin-1",
                    name: "Actin filaments",
                    total: 0,
                },
                {
                    checked: true,
                    color: "#6e6e6e",
                    disabled: true,
                    id: "Sec61 beta",
                    name: "Endoplasmic reticulum",
                    total: 0,
                },
                {
                    checked: true,
                    color: "#77207C",
                    disabled: false,
                    id: "Paxillin",
                    name: "Matrix adhesions",
                    total: 0,
                },
                {
                    checked: true,
                    color: "#6e6e6e",
                    disabled: true,
                    id: "Alpha-tubulin",
                    name: "Microtubules",
                    total: 0,
                },
                {
                    checked: true,
                    color: "#6e6e6e",
                    disabled: true,
                    id: "Tom20",
                    name: "Mitochondria",
                    total: 0,
                },
            ];
            expect(result).to.deep.equal(data);
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

        it("returns an array of cell ids that match the category name if that is the download config type", () => {
            const state: State = {
                ...newMockState,
                selection: {
                    ...newMockState.selection,
                    downloadConfig: {
                        key: "protein1",
                        type: DOWNLOAD_CONFIG_TYPE_PROTEIN,
                    },
                },
            };

            const result: string[] = getListOfCellIdsByDownloadConfig(state);
            expect(result).to.deep.equal(["C1"]);
        });
    });
});

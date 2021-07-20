import { expect } from "chai";

import { DOWNLOAD_CONFIG_TYPE_PROTEIN } from "../../../constants/index";
import { mockState } from "../../../state/test/mocks";
import { State } from "../../../state/types";
import {
    disambiguateStructureNames,
    getInteractivePanelData,
    getListOfCellIdsByDownloadConfig,
    getSelectionPanelData
} from "../selectors";
import { PanelData } from "../types";

describe("ColorByMenu selectors", () => {

    const newMockState = mockState;

    describe("disambiguateStructureNames", () => {
        it("attaches the protein name to each non-unique structure name", () => {
            const result = disambiguateStructureNames(newMockState.metadata.cellLineDefs);
            
            /* Without disambiguation, structure names would be:
            [
                "Nucleolus (Granular Component)",
                "Actin filaments",
                "Actin filaments",
                "Actin filaments",
                "Adherens junctions",
            ]
            */
            const expected = [
                "Nucleolus (Granular Component)",
                "Actin filaments (Alpha-actinin-1)",
                "Actin filaments (Beta-actin)",
                "Actin filaments (Delta-actin)",
                "Adherens junctions",
            ];
            expect(result).to.deep.equal(expected);
        });
    });
    
    describe("getInteractivePanelData", () => {

        it("returns an set of props for each protein in state", () => {

            const result: PanelData[] = getInteractivePanelData(newMockState);
            const data = [
                {
                    checked: true,
                    color: "#bbcd22",
                    gene: "ABC-2",
                    id: "Alpha-actinin-1",
                    name: "Actin filaments (Alpha-actinin-1)",
                    total: 1809,
                },
                {
                    checked: true,
                    color: "#ff9900",
                    gene: "ABC-3",
                    id: "Beta-actin",
                    name: "Actin filaments (Beta-actin)",
                    total: 1039,
                },
                {
                    checked: true,
                    color: "#FFEE1E",
                    gene: "ABC-5",
                    id: "Beta-catenin",
                    name: "Adherens junctions",
                    total: 2343,
                },
                {
                    checked: true,
                    color: "#FD92B6",
                    gene: "ABC-4",
                    id: "Delta-actin",
                    name: "Actin filaments (Delta-actin)",
                    total: 2003,
                },
                {
                    checked: true,
                    color: "#33a02c",
                    gene: "ABC-1",
                    id: "Nucleophosmin",
                    name: "Nucleolus (Granular Component)",
                    total: 3470,
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

        it("returns an array of cell ids that match the protein name if that is the download config type", () => {
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

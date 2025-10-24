import { describe, it, expect } from "vitest";
import {
    CELL_ID_KEY,
    FOV_ID_KEY,
    FOV_THUMBNAIL_PATH,
    FOV_VOLUME_VIEWER_PATH,
    THUMBNAIL_PATH,
    VOLUME_VIEWER_PATH,
} from "../../../constants";
import { State } from "../../../state";
import { FileInfo } from "../../../state/metadata/types";
import { mockState } from "../../../state/test/mocks";
import { getPropsForVolumeViewer } from "../selectors";

const fileInfo: FileInfo[] = [
    {
        [CELL_ID_KEY]: "1",
        [FOV_ID_KEY]: "12762",
        [FOV_THUMBNAIL_PATH]: "fovThumbnailPath",
        [FOV_VOLUME_VIEWER_PATH]: "fovVolumeviewerPath",
        [THUMBNAIL_PATH]: "thumbnailPath",
        [VOLUME_VIEWER_PATH]: "volumeviewerPath",
    },
    {
        [CELL_ID_KEY]: "2",
        [FOV_ID_KEY]: "12762",
        [FOV_THUMBNAIL_PATH]: "fovThumbnailPath",
        [FOV_VOLUME_VIEWER_PATH]: "fovVolumeviewerPath",
        [THUMBNAIL_PATH]: "",
        [VOLUME_VIEWER_PATH]: "",
    },
];

const stateWithSelections: State = {
    ...mockState,
    selection: {
        ...mockState.selection,
        cellSelectedFor3D: "1",
        dataset: "dataset_v2021.1",
        volumeViewerDataRoot: "url",
        selectedPoints: fileInfo,
    },
};
describe("Viewer selectors", () => {
    describe("getPropsForVolumeViewer", () => {
        it("for a cell with both sc and fov data, returns all the data in a format that can be passed to the viewer as props", () => {
            const result = getPropsForVolumeViewer(stateWithSelections);
            expect(result).to.deep.equal({
                cellId: "1",
                baseUrl: "url/",
                cellDownloadHref: "dlurl/&id=C1",
                cellPath: "volumeviewerPath",
                fovDownloadHref: "dlurl/&id=F12762",
                fovPath: "fovVolumeviewerPath",
                viewerChannelSettings: {},
                metadata: {
                    "Anaphase segmentation complete": "Complete",
                    "Apical Proximity": "-0.25868651080317",
                    "Cell Surface area": "702.3191 µm²",
                    "Labeled Structure": "Matrix adhesions",
                    "Missing data": "null",
                },
                transform: undefined,
                appProps: undefined,
                viewerSettings: undefined,
            });
        });
        it("if there is no single cell data, returns fov info as main info", () => {
            const stateWithCell2Selected = {
                ...stateWithSelections,
                selection: {
                    ...stateWithSelections.selection,
                    cellSelectedFor3D: "2",
                },
            };
            const result = getPropsForVolumeViewer(stateWithCell2Selected);

            expect(result).to.deep.equal({
                cellId: "12762",
                baseUrl: "url/",
                cellDownloadHref: "dlurl/&id=F12762",
                cellPath: "fovVolumeviewerPath",
                fovDownloadHref: "",
                fovPath: "",
                viewerChannelSettings: {},
                metadata: {
                    "Anaphase segmentation complete": "Incomplete",
                    "Apical Proximity": "-0.1",
                    "Cell Surface area": "702.3191 µm²",
                    "Labeled Structure": "Actin filaments",
                    "Missing data": "null",
                },
                transform: undefined,
                appProps: undefined,
                viewerSettings: undefined,
            });
        });
        it("if dataset has channelNameMapping data, it will be included", () => {
            const stateWithCell2Selected = {
                ...stateWithSelections,
                selection: {
                    ...stateWithSelections.selection,
                    cellSelectedFor3D: "2",
                    dataset: "aics_hipsc_v2020",
                },
            };
            const result = getPropsForVolumeViewer(stateWithCell2Selected);
            expect(result.viewerChannelSettings).to.be.an("object");
        });
    });
});

import {
    find,
    reduce,
} from "lodash";
import { createSelector } from "reselect";

import {
    DOWNLOAD_URL_PREFIX,
    PROTEIN_NAME_KEY,
} from "../../constants";

import {
    getAllAlbumData,
    getFileInfo,
} from "../../state/metadata/selectors";
import { FileInfo } from "../../state/metadata/types";
import {
    getClickedScatterPoints,
    getSelectedAlbum,
} from "../../state/selection/selectors";
import {
    Album,
    Thumbnail,
} from "../../state/types";
import {
    convertFileInfoToAICSId,
    convertFileInfoToImgSrc,
    getFileInfoDatumFromCellId,
} from "../../state/util";

export const getSelectedAlbumData = createSelector(
    [
        getAllAlbumData,
        getSelectedAlbum,
    ],
    (
        albumData: Album[],
        selectedAlbum: number
    ): (Album | undefined ) => {
        return find(albumData, {album_id: selectedAlbum});
    });

export const getSelectedAlbumName = createSelector([getSelectedAlbumData],
    (selectedAlbumData: Album | undefined): string => {
    return selectedAlbumData ? selectedAlbumData.title : "My Selections";
});

export const getIdsToShow = createSelector(
    [getSelectedAlbumData, getClickedScatterPoints],
    (
        selectedAlbumData: (Album | undefined),
        clickedScatterPointIDs: number[]): number[] => (
             selectedAlbumData ? selectedAlbumData.cell_ids : clickedScatterPointIDs
    ));

export const getThumbnails = createSelector([
        getFileInfo,
        getIdsToShow,
    ],
    (fileInfo: FileInfo[], idsToShow: number[]): Thumbnail[] => {
        const init: Thumbnail[] = [];
        return reduce(idsToShow, (acc: Thumbnail[], cellID: number) => {
            const cellData: FileInfo | undefined = getFileInfoDatumFromCellId(fileInfo, cellID);
            if (cellData) {
                const src = convertFileInfoToImgSrc(cellData);
                const downloadHref = `${DOWNLOAD_URL_PREFIX}&id=${convertFileInfoToAICSId(cellData)}`;
                acc.push({
                    cellID: Number(cellID),
                    downloadHref,
                    labeledStructure: cellData[PROTEIN_NAME_KEY],
                    src,
                });
            }
            return acc;
        }, init);
    }
);

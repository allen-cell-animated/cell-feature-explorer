import { find, isEmpty, map } from "lodash";
import { createSelector } from "reselect";

import {
    ARRAY_OF_CELL_IDS_KEY,
    CELL_ID_KEY,
    FOV_ID_KEY,
    PROTEIN_NAME_KEY,
} from "../../constants";
import {
    getAllAlbumData,
    getPerCellDataForPlot,
    getMitoticKeyPerCell,
} from "../../state/metadata/selectors";
import { DataForPlot, FileInfo } from "../../state/metadata/types";
import {
    getClickedCellsFileInfo,
    getDownloadRoot,
    getSelectedAlbum,
    getSelectedAlbumFileInfo,
    getThumbnailRoot,
} from "../../state/selection/selectors";
import {
    Album,
    Thumbnail,
} from "../../state/types";
import {
    convertFullFieldIdToDownloadId,
    convertSingleImageIdToDownloadId,
    formatDownloadOfSingleImage,
    formatThumbnailSrc,
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
        // eslint-disable-next-line @typescript-eslint/camelcase
        return find(albumData, {album_id: selectedAlbum});
    });

export const getSelectedAlbumName = createSelector([getSelectedAlbumData],
    (selectedAlbumData: Album | undefined): string => {
    return selectedAlbumData ? selectedAlbumData.title : "My Selections";
});


export const getFileInfoToShow = createSelector(
    [getSelectedAlbumData, getClickedCellsFileInfo, getSelectedAlbumFileInfo],
    (
        selectedAlbumData: Album | undefined,
        clickedScatterPointIDs: FileInfo[],
        albumFileInfo: FileInfo[]
    ): FileInfo[] => (selectedAlbumData ? albumFileInfo : clickedScatterPointIDs)
);

export const getThumbnails = createSelector(
    [getPerCellDataForPlot, getMitoticKeyPerCell, getFileInfoToShow, getDownloadRoot, getThumbnailRoot],
    (
        perCellPlotData: DataForPlot,
        mitoticKeysArray: number[],
        fileInfoOfSelectedCells: FileInfo[],
        downloadRoot: string,
        thumbnailRoot: string,
    ): Thumbnail[] => {
        if (isEmpty(perCellPlotData.labels) || !fileInfoOfSelectedCells.length) {
            return [];
        }
        return map(fileInfoOfSelectedCells, (fileInfoForCell: FileInfo) => {
            if (isNaN(fileInfoForCell[CELL_ID_KEY])) {
                return {} as Thumbnail;
            }
            const cellID = fileInfoForCell[CELL_ID_KEY].toString();
            const cellIndex = perCellPlotData.labels[ARRAY_OF_CELL_IDS_KEY].indexOf(cellID);
            if (cellIndex < 0) {
                return {} as Thumbnail;
            }
            const mitoticKey = mitoticKeysArray[cellIndex];
            const fovId = fileInfoForCell[FOV_ID_KEY];
            const downloadHref = formatDownloadOfSingleImage(downloadRoot, 
                convertSingleImageIdToDownloadId(cellID)
            );
            const fullFieldDownloadHref = formatDownloadOfSingleImage(downloadRoot, 
                convertFullFieldIdToDownloadId(fovId)
            );
            const thumbnailSrc = formatThumbnailSrc(thumbnailRoot, fileInfoForCell);
            return {
                cellID,
                downloadHref,
                fullFieldDownloadHref,
                labeledStructure: fileInfoForCell[PROTEIN_NAME_KEY],
                mitoticStage: mitoticKey,
                src: thumbnailSrc,
            };
        });
    }
);
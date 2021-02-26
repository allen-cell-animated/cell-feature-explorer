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
    getMeasuredFeatureValues,
    getMitoticKeyPerCell,
} from "../../state/metadata/selectors";
import { FileInfo, MetadataStateBranch } from "../../state/metadata/types";
import {
    getClickedCellsFileInfo,
    getSelectedAlbum,
    getSelectedAlbumFileInfo,
} from "../../state/selection/selectors";
import {
    Album,
    Thumbnail,
} from "../../state/types";
import {
    convertFileInfoToImgSrc,
    convertFullFieldIdToDownloadId,
    convertSingleImageIdToDownloadId,
    formatDownloadOfSingleImage,
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
    [getMeasuredFeatureValues, getMitoticKeyPerCell, getFileInfoToShow],
    (
        measuredFeatures: MetadataStateBranch,
        mitoticKeysArray: number[],
        fileInfoOfSelectedCells: FileInfo[]
    ): Thumbnail[] => {
        if (isEmpty(measuredFeatures) || isEmpty(fileInfoOfSelectedCells)) {
            return [];
        }
        return map(fileInfoOfSelectedCells, (fileInfoForCell: FileInfo) => {
            const cellID = fileInfoForCell[CELL_ID_KEY];
            console.log(cellID)
            const cellIndex = measuredFeatures[ARRAY_OF_CELL_IDS_KEY].indexOf(cellID);
            const mitoticKey = mitoticKeysArray[cellIndex] as number;
            const cellData = fileInfoForCell;
            const src = convertFileInfoToImgSrc(cellData);
            const fovId = cellData[FOV_ID_KEY];
            const downloadHref = formatDownloadOfSingleImage(
                convertSingleImageIdToDownloadId(cellID)
            );
            const fullFieldDownloadHref = formatDownloadOfSingleImage(
                convertFullFieldIdToDownloadId(fovId)
            );
            return {
                cellID,
                downloadHref,
                fullFieldDownloadHref,
                labeledStructure: cellData[PROTEIN_NAME_KEY],
                mitoticStage: mitoticKey,
                src,
            };
        });
    }
);
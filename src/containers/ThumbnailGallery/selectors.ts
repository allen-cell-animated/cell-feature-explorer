import { find, reduce, isEmpty } from "lodash";
import { createSelector } from "reselect";

import {
    ARRAY_OF_CELL_IDS_KEY,
    CELL_ID_KEY,
    FOV_ID_KEY,
    PROTEIN_NAME_KEY,
} from "../../constants";
import {
    getAllAlbumData,
    getFileInfo,
    getMeasuredFeatureValues,
    getMitoticKeyPerCell,
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
    convertFullFieldIdToDownloadId,
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

export const getIdsToShow = createSelector(
    [getSelectedAlbumData, getClickedScatterPoints],
    (
        selectedAlbumData: (Album | undefined),
        clickedScatterPointIDs: number[]): number[] => (
             selectedAlbumData ? selectedAlbumData.cell_ids : clickedScatterPointIDs
    ));

export const getThumbnails = createSelector([
        getFileInfo,
        getMeasuredFeatureValues,
        getMitoticKeyPerCell,
        getIdsToShow,
    ],
    (fileInfoArray: FileInfo[], measuredFeatures, mitoticKeysArray, idsToShow: number[]): Thumbnail[] => {
        const init: Thumbnail[] = [];
        if (isEmpty(measuredFeatures)) {
            return []
        }
        return reduce(idsToShow, (acc: Thumbnail[], cellID: number) => {
            if (!cellID || isNaN(cellID)) {
                return acc;
            }
            const fileInfoForCell = find(fileInfoArray, (datum) => datum[CELL_ID_KEY] === cellID);
            const cellIndex = measuredFeatures[ARRAY_OF_CELL_IDS_KEY].indexOf(cellID.toString());
            const mitoticKey = mitoticKeysArray[cellIndex] as number;
            if (fileInfoForCell) {
                const cellData = fileInfoForCell;
                const src = convertFileInfoToImgSrc(cellData);
                const fovId = cellData[FOV_ID_KEY];
                const downloadHref = formatDownloadOfSingleImage(convertFileInfoToAICSId(cellData));
                const fullFieldDownloadHref = formatDownloadOfSingleImage(convertFullFieldIdToDownloadId((fovId)));
                acc.push({
                    cellID: Number(cellID),
                    downloadHref,
                    fullFieldDownloadHref,
                    labeledStructure: cellData[PROTEIN_NAME_KEY],
                    mitoticStage: mitoticKey,
                    src,
                });
            }
            return acc;
        }, init);
    }
);

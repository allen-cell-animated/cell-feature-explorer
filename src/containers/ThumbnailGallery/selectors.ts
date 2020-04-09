import {
    find,
    reduce,
} from "lodash";
import { createSelector } from "reselect";

import {
    CELL_ID_KEY,
    FOV_ID_KEY,
    MITOTIC_STAGE_KEY,
    PROTEIN_NAME_KEY,
} from "../../constants";
import {
    getAllAlbumData,
    getFullMetaDataArray,
} from "../../state/metadata/selectors";
import { MetaData } from "../../state/metadata/types";
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
        getFullMetaDataArray,
        getIdsToShow,
    ],
    (metaDataArray: MetaData[], idsToShow: number[]): Thumbnail[] => {
        const init: Thumbnail[] = [];
        return reduce(idsToShow, (acc: Thumbnail[], cellID: number) => {
            const fullCellData = find(metaDataArray, (datum) => (datum.file_info[CELL_ID_KEY] === cellID));
            if (fullCellData) {
                const cellData = fullCellData.file_info;
                const src = convertFileInfoToImgSrc(cellData);
                const fovId = cellData[FOV_ID_KEY];
                const downloadHref = formatDownloadOfSingleImage(convertFileInfoToAICSId(cellData));
                const fullFieldDownloadHref = formatDownloadOfSingleImage(convertFullFieldIdToDownloadId((fovId)));
                const mitoticKey: number = fullCellData.measured_features[MITOTIC_STAGE_KEY];
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

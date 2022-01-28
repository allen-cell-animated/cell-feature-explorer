import { find, isEmpty, map } from "lodash";
import { createSelector } from "reselect";

import {
    ARRAY_OF_CELL_IDS_KEY,
    CELL_ID_KEY,
    FOV_ID_KEY,
    FOV_VOLUME_VIEWER_PATH,
    VOLUME_VIEWER_PATH,
} from "../../constants";
import {
    getAllAlbumData,
    getPerCellDataForPlot,
    getMitoticKeyPerCell,
    getMitoticStageNames,
} from "../../state/metadata/selectors";
import { DataForPlot, FileInfo, MeasuredFeatureDef, MeasuredFeaturesOptions } from "../../state/metadata/types";
import {
    getClickedCellsFileInfo,
    getDownloadRoot,
    getGroupByFeatureDef,
    getSelectedAlbum,
    getSelectedAlbumFileInfo,
    getThumbnailRoot,
} from "../../state/selection/selectors";
import { Album, Thumbnail } from "../../state/types";
import {
    convertFullFieldIdToDownloadId,
    convertSingleImageIdToDownloadId,
    formatDownloadOfIndividualFile,
    formatThumbnailSrc,
} from "../../state/util";

export const getSelectedAlbumData = createSelector(
    [getAllAlbumData, getSelectedAlbum],
    (albumData: Album[], selectedAlbum: number): Album | undefined => {
        return find(albumData, { album_id: selectedAlbum });
    }
);

export const getSelectedAlbumName = createSelector(
    [getSelectedAlbumData],
    (selectedAlbumData: Album | undefined): string => {
        return selectedAlbumData ? selectedAlbumData.title : "My Selections";
    }
);

export const getFileInfoToShow = createSelector(
    [getSelectedAlbumData, getClickedCellsFileInfo, getSelectedAlbumFileInfo],
    (
        selectedAlbumData: Album | undefined,
        clickedScatterPointIDs: FileInfo[],
        albumFileInfo: FileInfo[]
    ): FileInfo[] => (selectedAlbumData ? albumFileInfo : clickedScatterPointIDs)
);

export const getThumbnails = createSelector(
    [
        getGroupByFeatureDef,
        getPerCellDataForPlot,
        getMitoticKeyPerCell,
        getFileInfoToShow,
        getDownloadRoot,
        getThumbnailRoot,
        getMitoticStageNames,
    ],
    (
        groupByFeatureDef: MeasuredFeatureDef,
        perCellPlotData: DataForPlot,
        mitoticKeysArray: number[],
        fileInfoOfSelectedCells: FileInfo[],
        downloadRoot: string,
        thumbnailRoot: string,
        mitoticStageNames: MeasuredFeaturesOptions
    ): Thumbnail[] => {
        if (isEmpty(perCellPlotData.labels) || !fileInfoOfSelectedCells.length) {
            return [];
        }
        const groupByValues = perCellPlotData.values[groupByFeatureDef.key];
        return map(fileInfoOfSelectedCells, (fileInfoForCell: FileInfo) => {
            const cellID = fileInfoForCell[CELL_ID_KEY];
            const cellIndex = perCellPlotData.labels[ARRAY_OF_CELL_IDS_KEY].indexOf(cellID);
            if (cellIndex < 0) {
                return {} as Thumbnail;
            }

            let mitoticStage = "";
            if (!isEmpty(mitoticStageNames) && mitoticKeysArray.length) {
                const mitoticKey = mitoticKeysArray[cellIndex];
                mitoticStage = mitoticStageNames[mitoticKey] ? mitoticStageNames[mitoticKey].name : "";
            }
            

            let downloadHref = "";
            if (fileInfoForCell[VOLUME_VIEWER_PATH]) {
                downloadHref = formatDownloadOfIndividualFile(
                    downloadRoot,
                    convertSingleImageIdToDownloadId(cellID)
                );
            }

            const fovId = fileInfoForCell[FOV_ID_KEY];
            let fullFieldDownloadHref = "";
            if (fileInfoForCell[FOV_VOLUME_VIEWER_PATH]) {
                fullFieldDownloadHref = formatDownloadOfIndividualFile(
                    downloadRoot,
                    convertFullFieldIdToDownloadId(fovId)
                );
            }

            const thumbnailSrc = formatThumbnailSrc(thumbnailRoot, fileInfoForCell);
            const groupCategoryInfo = groupByFeatureDef.options[groupByValues[cellIndex]];
            return {
                cellID,
                downloadHref,
                fullFieldDownloadHref,
                labeledStructure: groupCategoryInfo.key || groupCategoryInfo.name,
                mitoticStage,
                src: thumbnailSrc,
            };
        });
    }
);

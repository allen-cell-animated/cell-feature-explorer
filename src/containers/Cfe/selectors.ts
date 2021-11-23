import { isEmpty } from "lodash";
import { createSelector } from "reselect";
import { FileInfo } from "../../state/metadata/types";
import {
    getDownloadRoot,
    getSelected3DCellFileInfo,
    getSelected3DCellLabeledProtein,
    getSelected3DCellLabeledStructure,
    getSelectedDatasetName,
    getVolumeViewerDataRoot,
} from "../../state/selection/selectors";
import {
    convertFullFieldIdToDownloadId,
    convertSingleImageIdToDownloadId,
    formatDownloadOfIndividualFile,
} from "../../state/util";

import { VIEWER_CHANNEL_SETTINGS, NO_SETTINGS } from "../../constants";

export interface VolumeViewerProps {
    cellId: string;
    baseUrl: string;
    cellPath: string;
    fovPath: string;
    fovDownloadHref: string;
    cellDownloadHref: string;
    channelNameMapping?: { label: string; test: RegExp }[] | "";
    groupToChannelNameMap?: { [key: string]: string[] } | "";
    channelsEnabled?: number[];
    initialChannelSettings?: { [key: string]: { color: string } };
}

export const getPropsForVolumeViewer = createSelector(
    [getSelected3DCellFileInfo, getVolumeViewerDataRoot, getDownloadRoot, getSelectedDatasetName],
    (fileInfo: FileInfo, dataRoot, downloadRoot, selectedDatasetName): VolumeViewerProps => {
        if (isEmpty(fileInfo)) {
            return {} as VolumeViewerProps;
        }
        const channelSettings = VIEWER_CHANNEL_SETTINGS[selectedDatasetName] || { ...NO_SETTINGS };

        const formatPathForViewer = (path: string) => path.split("_atlas.json")[0];

        /**
         * If there is not both single cell volume data and full field volume data
         * in the dataset, use the full field data as the default/main image
         */
        let cellId = fileInfo.CellId;
        let mainCellPath = "";
        let parentCellPath = "";
        let mainDownloadHref = "";
        let parentDownloadHref = "";
        if (fileInfo.volumeviewerPath) {
            mainCellPath = formatPathForViewer(fileInfo.volumeviewerPath);
            mainDownloadHref = formatDownloadOfIndividualFile(
                downloadRoot,
                convertSingleImageIdToDownloadId(fileInfo ? fileInfo.CellId : "")
            );
            if (fileInfo.fovVolumeviewerPath) {
                parentCellPath = formatPathForViewer(fileInfo.fovVolumeviewerPath);
                parentDownloadHref = formatDownloadOfIndividualFile(
                    downloadRoot,
                    convertFullFieldIdToDownloadId(fileInfo ? fileInfo.FOVId : "")
                );
            }
        } else {
            mainCellPath = formatPathForViewer(fileInfo.fovVolumeviewerPath);
            cellId = fileInfo.FOVId;
            mainDownloadHref = formatDownloadOfIndividualFile(
                downloadRoot,
                convertFullFieldIdToDownloadId(fileInfo ? fileInfo.FOVId : "")
            );
        }

        const props = {
            cellId: cellId,
            baseUrl: dataRoot,
            cellPath: mainCellPath,
            fovPath: parentCellPath,
            cellDownloadHref: mainDownloadHref,
            fovDownloadHref: parentDownloadHref,
            ...channelSettings,
        };
        return props;
    }
);

export const getViewerHeader = createSelector(
           [
               getSelectedDatasetName,
               getSelected3DCellFileInfo,
               getSelected3DCellLabeledStructure,
               getSelected3DCellLabeledProtein,
           ],
           (
               selectedDatasetName,
               fileInfo,
               structureName,
               protein
           ): { cellId: string; label: string; value: string } => {
               let label = "";
               let value = "";
               if (isEmpty(fileInfo) || !structureName) {
                   return { cellId: "", label, value };
               }
               const cellId = fileInfo.volumeviewerPath ? fileInfo.CellId : fileInfo.FOVId;
               // TODO: figure out a data driven solution for this.
               console.log(selectedDatasetName);
               if (selectedDatasetName === "cellsystems_fish") {
                   label = "Gene pair";
                   value = protein;
               } else {
                   label = "Labeled structure (protein)";
                   value = `${structureName} (${protein})`;
               }
               return {
                   cellId,
                   label,
                   value,
               };
           }
       );

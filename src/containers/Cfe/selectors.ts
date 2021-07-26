import { isEmpty } from "lodash";
import { createSelector } from "reselect";
import { FileInfo } from "../../state/metadata/types";
import {
    getDownloadRoot,
    getSelected3DCellFileInfo,
    getSelectedDataset,
    getVolumeViewerDataRoot,
} from "../../state/selection/selectors";
import {
    convertFullFieldIdToDownloadId,
    convertSingleImageIdToDownloadId,
    formatDownloadOfSingleImage,
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
}

export const getPropsForVolumeViewer = createSelector(
           [getSelected3DCellFileInfo, getVolumeViewerDataRoot, getDownloadRoot, getSelectedDataset],
           (fileInfo: FileInfo, dataRoot, downloadRoot, selectedDataset): VolumeViewerProps => {
               if (isEmpty(fileInfo)) {
                   return {} as VolumeViewerProps
               }
               const selectedDatasetName = selectedDataset.split("_v")[0];
               const channelSettings = VIEWER_CHANNEL_SETTINGS[selectedDatasetName] || {...NO_SETTINGS};
               
               const formatPathForViewer = (path: string) => path.split("_atlas.json")[0];

               /**
                * If there is not both single cell volume data and full field volume data
                * in the dataset, use the full field data as the default/main image
                */
               let cellId = fileInfo.CellId;
               let mainCellPath = "";
               let parentCellPath = "";
               if (fileInfo.volumeviewerPath) {
                    mainCellPath = formatPathForViewer(fileInfo.volumeviewerPath);
                    if (fileInfo.fovVolumeviewerPath) {
                        parentCellPath = formatPathForViewer(fileInfo.fovVolumeviewerPath);
                    }
               } else {
                   mainCellPath = formatPathForViewer(fileInfo.fovVolumeviewerPath);
                   cellId = fileInfo.FOVId
               }
             

               const props = {
                   cellId: cellId,
                   baseUrl: dataRoot,
                   cellPath: mainCellPath,
                   fovPath: parentCellPath,
                   fovDownloadHref: formatDownloadOfSingleImage(
                       downloadRoot,
                       convertFullFieldIdToDownloadId(fileInfo ? fileInfo.FOVId : "")
                   ),
                   cellDownloadHref: formatDownloadOfSingleImage(
                       downloadRoot,
                       convertSingleImageIdToDownloadId(fileInfo ? fileInfo.CellId : "")
                   ),
                   ...channelSettings,
               };
               return props;
           }
       );

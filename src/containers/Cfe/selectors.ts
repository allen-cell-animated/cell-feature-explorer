import { isEmpty } from "lodash";
import { createSelector } from "reselect";
import { FileInfo } from "../../state/metadata/types";
import {
    getDownloadRoot,
    getSelected3DCellFileInfo,
    getVolumeViewerDataRoot,
} from "../../state/selection/selectors";
import {
    convertFullFieldIdToDownloadId,
    convertSingleImageIdToDownloadId,
    formatDownloadOfSingleImage,
} from "../../state/util";

export interface VolumeViewerProps {
    cellId: string,
    baseUrl: string,
    cellPath: string,
    fovPath: string,
    fovDownloadHref: string,
    cellDownloadHref: string,
}

export const getPropsForVolumeViewer = createSelector(
           [getSelected3DCellFileInfo, getVolumeViewerDataRoot, getDownloadRoot],
           (fileInfo: FileInfo, dataRoot, downloadRoot): VolumeViewerProps => {
               if (isEmpty(fileInfo)) {
                   return {} as VolumeViewerProps
               }
               const formatPathForViewer = (path: string) => path.split("_atlas.json")[0];

               /**
                * By if there is not both single cell volume data and full field volume data
                * in the dataset, use the full field data as the default/main image
                */
               const mainCellPath = fileInfo.volumeviewerPath
                   ? formatPathForViewer(fileInfo.volumeviewerPath)
                   : formatPathForViewer(fileInfo.fovVolumeviewerPath);

               const parentCellPath =
                   fileInfo.volumeviewerPath && fileInfo.fovVolumeviewerPath
                       ? formatPathForViewer(fileInfo.fovVolumeviewerPath)
                       : "";

               const props = {
                   cellId: fileInfo.CellId,
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
               };
               return props;
           }
       );

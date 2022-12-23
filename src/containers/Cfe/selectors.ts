import { isEmpty } from "lodash";
import { createSelector } from "reselect";
import { MeasuredFeatureDef } from "../../state/metadata/types";
import {
    getAlignActive,
    getDownloadRoot,
    getGroupByFeatureDef,
    getSelected3DCellFileInfo,
    getVolumeViewerDataRoot,
} from "../../state/selection/selectors";
import {
    convertFullFieldIdToDownloadId,
    convertSingleImageIdToDownloadId,
    formatDownloadOfIndividualFile,
} from "../../state/util";

import { ViewerChannelSettings } from "@aics/web-3d-viewer/type-declarations";
import { getViewerChannelSettings } from "../../state/metadata/selectors";
import { GROUP_BY_KEY } from "../../constants";

export interface VolumeViewerProps {
    cellId: string;
    baseUrl: string;
    cellPath: string;
    fovPath: string;
    fovDownloadHref: string;
    cellDownloadHref: string;
    viewerChannelSettings?: ViewerChannelSettings;
    transform?: {
        translation: [number, number, number];
        rotation: [number, number, number];
    };
    onControlPanelToggle?(collapsed: boolean): void;
}

export const getPropsForVolumeViewer = createSelector(
    [
        getSelected3DCellFileInfo,
        getVolumeViewerDataRoot,
        getDownloadRoot,
        getViewerChannelSettings,
        getAlignActive,
    ],
    (fileInfo, dataRoot, downloadRoot, viewerChannelSettings, alignActive): VolumeViewerProps => {
        if (isEmpty(fileInfo)) {
            return {} as VolumeViewerProps;
        }

        const formatPathForViewer = (path: string) => path;

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
        if (!dataRoot.endsWith("/")) {
            dataRoot = dataRoot + "/";
        }
        const props = {
            cellId: cellId,
            baseUrl: dataRoot,
            cellPath: mainCellPath,
            fovPath: parentCellPath,
            cellDownloadHref: mainDownloadHref,
            fovDownloadHref: parentDownloadHref,
            transform: alignActive ? fileInfo.transform : undefined,
            viewerChannelSettings,
        };
        return props;
    }
);

export const getViewerHeader = createSelector(
    [getSelected3DCellFileInfo, getGroupByFeatureDef],
    (
        fileInfo,
        groupByFeatureDef: MeasuredFeatureDef
    ): { cellId: string; label: string; value: string } => {
        let label = "";
        let value = "";
        if (isEmpty(fileInfo)) {
            return { cellId: "", label, value };
        }
        const cellId = fileInfo.volumeviewerPath ? fileInfo.CellId : fileInfo.FOVId;
        label = groupByFeatureDef.displayName;
        value = fileInfo[GROUP_BY_KEY] || "";
        return { cellId, label, value };
    }
);

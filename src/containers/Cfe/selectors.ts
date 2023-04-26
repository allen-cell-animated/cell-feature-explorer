import { isEmpty } from "lodash";
import { createSelector } from "reselect";
import { MeasuredFeatureDef } from "../../state/metadata/types";
import {
    getAlignActive,
    getDownloadRoot,
    getGroupByFeatureDef,
    getSelected3DCellFeatureData,
    getSelected3DCellFileInfo,
    getVolumeViewerDataRoot,
} from "../../state/selection/selectors";
import {
    convertFullFieldIdToDownloadId,
    convertSingleImageIdToDownloadId,
    formatDownloadOfIndividualFile,
} from "../../state/util";

import { ViewerChannelSettings } from "@aics/web-3d-viewer/type-declarations";
import { getMeasuredFeaturesDefs, getViewerChannelSettings } from "../../state/metadata/selectors";
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
    metadata?: { [key: string]: string | number | null };
    metadataFormat?: { [key: string]: { displayName?: string; unit?: string; tooltip?: string } };
    onControlPanelToggle?(collapsed: boolean): void;
}

const getCellMetadata = createSelector(
    [getSelected3DCellFeatureData, getMeasuredFeaturesDefs],
    (featureData, featureDefs) => {
        const metadata: { [key: string]: number | string | null } = {};
        const metadataFormat: {
            [key: string]: { displayName?: string; tooltip?: string; unit?: string };
        } = {};
        for (const feature of featureDefs) {
            const { key, displayName, tooltip, unit } = feature;
            metadataFormat[key] = {
                displayName,
                tooltip,
                unit: unit === "unitless" || unit === "stage" ? undefined : unit,
            };

            const rawValue = featureData[key];
            metadata[key] =
                feature.discrete && rawValue !== null ? feature.options[rawValue]?.name : rawValue;
        }
        return { metadata, metadataFormat };
    }
);

export const getPropsForVolumeViewer = createSelector(
    [
        getSelected3DCellFileInfo,
        getVolumeViewerDataRoot,
        getDownloadRoot,
        getViewerChannelSettings,
        getAlignActive,
        ,
        getCellMetadata,
    ],
    (
        fileInfo,
        dataRoot,
        downloadRoot,
        viewerChannelSettings,
        alignActive,
        cellMetadata
    ): VolumeViewerProps => {
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
        return {
            cellId: cellId,
            baseUrl: dataRoot,
            cellPath: mainCellPath,
            fovPath: parentCellPath,
            cellDownloadHref: mainDownloadHref,
            fovDownloadHref: parentDownloadHref,
            transform: alignActive ? fileInfo.transform : undefined,
            metadata: cellMetadata.metadata,
            metadataFormat: cellMetadata.metadataFormat,
            viewerChannelSettings,
        };
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

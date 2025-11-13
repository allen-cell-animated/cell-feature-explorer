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

import { AppProps, ViewerChannelSettings, ViewerState } from "@aics/vole-app";
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
    onControlPanelToggle?(collapsed: boolean): void;
    appProps?: Partial<AppProps>;
    viewerSettings?: Partial<ViewerState>;
}

function formatFeatureValue(featureValue: number | null, featureDef: MeasuredFeatureDef): string {
    const { unit, discrete } = featureDef;

    if (featureValue === null || featureValue === undefined) {
        return `${featureValue}`;
    }
    if (discrete) {
        if (!featureDef.options) {
            return featureValue.toString();
        }
        return `${featureDef.options[featureValue.toString()]?.name}`;
    }

    /** Replace these unit names with a shorter symbol */
    const unitSymbols: Record<string, string> = {
        degrees: "deg",
    };
    /** Do not include these units at all */
    const noSymbolUnits = ["unitless", "stage"];

    if (unit && !noSymbolUnits.includes(unit)) {
        return `${featureValue} ${unitSymbols[unit] || unit}`;
    }
    return `${featureValue}`;
}

const getCellMetadata = createSelector(
    [getSelected3DCellFeatureData, getMeasuredFeaturesDefs],
    (featureData, featureDefs) => {
        const metadata: { [key: string]: number | string | null } = {};
        for (const featureDef of featureDefs) {
            const featureValue = featureData[featureDef.key];
            metadata[featureDef.displayName] = formatFeatureValue(featureValue, featureDef);
        }
        return { metadata };
    }
);

export const getPropsForVolumeViewer = createSelector(
    [
        getSelected3DCellFileInfo,
        getVolumeViewerDataRoot,
        getDownloadRoot,
        getViewerChannelSettings,
        getAlignActive,
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

        // Discard data root if it's an empty string so it doesn't add a "/" to
        // the front of all HTTP(S) URLs. (ex: "/http://example.com" is invalid)
        if (dataRoot !== "" && !dataRoot.endsWith("/")) {
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
            viewerChannelSettings,
            appProps: fileInfo.voleUrlParams?.args,
            viewerSettings: fileInfo.voleUrlParams?.viewerSettings,
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

import { ImageViewerApp } from "@aics/web-3d-viewer";
import { includes } from "lodash";
import React from "react";

import {
    BRIGHT_FIELD_NAMES,
    OBS_DNA_NAMES,
    OBS_MEMBRANE_NAMES,
    OBS_STRUCTURE_NAMES,
} from "../../constants/index";
import { FileInfo } from "../../state/metadata/types";

const styles = require("./style.css");

interface CellViewerProps extends FileInfo{
    fovDownloadHref: string;
    cellDownloadHref: string;
    volumeViewerDataRoot: string;
}

const CellViewer: React.FunctionComponent<CellViewerProps> = ({
    CellId,
    structureProteinName,
    volumeviewerPath,
    fovDownloadHref,
    fovVolumeviewerPath,
    cellDownloadHref,
    volumeViewerDataRoot,
}) => {
    if (!CellId || !structureProteinName) {
        return null;
    }

    const standardizeNames = (name: string) => {
        if (includes(OBS_MEMBRANE_NAMES, name)) {
            return OBS_MEMBRANE_NAMES[0];
        }
        if (includes(OBS_STRUCTURE_NAMES, name)) {
            return OBS_STRUCTURE_NAMES[0];
        }
        if (includes(OBS_DNA_NAMES, name)) {
            return OBS_DNA_NAMES[0];
        }
        if (includes(BRIGHT_FIELD_NAMES, name)) {
            return BRIGHT_FIELD_NAMES[0];
        }
        return name;
    };
    return (
        <div className={styles.cellViewer}>
            <ImageViewerApp
                cellId={CellId}
                baseUrl={volumeViewerDataRoot}
                cellPath={volumeviewerPath.split("_atlas.json")[0]} //TODO: remove this formatting from the viewer
                fovPath={fovVolumeviewerPath.split("_atlas.json")[0]} //TODO: remove this formatting from the viewer
                defaultVolumesOn={[0, 1, 2]}
                defaultSurfacesOn={[]}
                channelNameClean={standardizeNames}
                appHeight="90vh"
                fovDownloadHref={fovDownloadHref}
                cellDownloadHref={cellDownloadHref}
            />
        </div>
    );
};

export default CellViewer;

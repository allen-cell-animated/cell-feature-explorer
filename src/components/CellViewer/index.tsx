import { ImageViewerApp } from "ac-3d-viewer";
import { includes } from "lodash";
import React from "react";

import {
    BRIGHT_FIELD_NAMES,
    OBS_DNA_NAMES,
    OBS_MEMBRANE_NAMES,
    OBS_STRUCTURE_NAMES,
    THUMBNAIL_BASE_URL,
} from "../../constants/index";

const styles = require("./style.css");

interface CellViewerProps {
    cellId: string;
    cellLineName: string;
    fovId: string;
}

const CellViewer: React.SFC<CellViewerProps> = ({ cellId, cellLineName, fovId }) => {
    if (!cellId || !cellLineName) {
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
                cellId={cellId}
                baseUrl={`${THUMBNAIL_BASE_URL}`}
                cellPath={`${cellLineName}/${cellLineName}_${fovId}_${cellId}`}
                fovPath={`${cellLineName}/${cellLineName}_${fovId}`}
                defaultVolumesOn={[0, 1, 2]}
                defaultSurfacesOn={[]}
                channelNameClean={standardizeNames}
                appHeight="90vh"
            />

        </div>
    );
};

export default CellViewer;

import { ImageViewerApp } from "ac-3d-viewer";
import { includes } from "lodash";
import React from "react";

import {
    BRIGHT_FIELD_NAMES,
    OBS_DNA_NAMES,
    OBS_MEMBRANE_NAMES,
    OBS_STRUCTURE_NAMES,
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

    const cleanName = (name: string) => {
        if (includes(OBS_MEMBRANE_NAMES, name)) {
            return "CMDRP";
        }
        if (includes(OBS_STRUCTURE_NAMES, name)) {
            return "EGFP";
        }
        if (includes(OBS_DNA_NAMES, name)) {
            return "H3342";
        }
        if (includes(BRIGHT_FIELD_NAMES, name)) {
            return "Bright_100";
        }
        return name;
    };

    return (
        <div className={styles.cellViewer}>
            <ImageViewerApp
                cellId={cellId}
                baseUrl={"https://s3-us-west-2.amazonaws.com/bisque.allencell.org/v1.3.0/Cell-Viewer_Thumbnails"}
                cellPath={`${cellLineName}/${cellLineName}_${fovId}_${cellId}`}
                fovPath={`${cellLineName}/${cellLineName}_${fovId}`}
                defaultVolumesOn={[0, 1, 2]}
                defaultSurfacesOn={[]}
                channelNameClean={cleanName}
            />

        </div>
    );
};

export default CellViewer;

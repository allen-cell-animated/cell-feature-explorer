import { ImageViewerApp } from "@aics/web-3d-viewer";
import { includes } from "lodash";
import React from "react";

import {
    BRIGHT_FIELD_NAMES,
    OBS_DNA_NAMES,
    OBS_MEMBRANE_NAMES,
    OBS_STRUCTURE_NAMES,
} from "../../constants/index";
import { VolumeViewerProps } from "../../containers/Cfe/selectors";

const styles = require("./style.css");


const CellViewer: React.FunctionComponent<VolumeViewerProps> = (
    props) => {
    if (!props.cellId) {
        return null;
    }

    // TODO maybe this function could be pushed out closer to the "dataset" implementation code
    // !! Really it would be nice to have the names standardized BEFORE data is read. !!
    // So this transformation COULD be done at dataset generation time and error out if it finds
    // a name it doesn't recognize
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
                cellId={props.cellId}
                baseUrl={props.baseUrl}
                cellPath={props.cellPath}
                fovDownloadHref={props.fovDownloadHref}
                cellDownloadHref={props.cellDownloadHref}
                fovPath={props.fovPath}
                defaultVolumesOn={[0, 1, 2]}
                defaultSurfacesOn={[]}
                channelNameClean={standardizeNames}
                appHeight="90vh"
            />
        </div>
    );
};

export default CellViewer;

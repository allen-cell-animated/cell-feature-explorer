import React from "react";

import { CELL_VIEWER_URL } from "../../constants/index";
import { getCellLineFromLegacyCellID } from "../../util/index";

const styles = require("./style.css");

interface CellViewerProps {
    cellId: string;
    cellLineName: string;
    fovId: string;
}

const CellViewer: React.SFC<CellViewerProps> = ({ cellId, cellLineName, fovId }) => {
    if (!cellId) {
        return null;
    }
    let query = "";
    if (!fovId) {
        // Assume cellId has the form:
        // ?legacyName_1_2=2017_03_08_Struct_First_Pass_Seg/AICS-10/AICS-10_5_5
        // After release, actual legacy links will look like : ?legacyName_1_2=AICS-10_5_5
        // TODO this needs to be updated before release, when we flatten the directory
        // structure of the bucket containing legacy version 1.2 images
        query = `legacyName_1_2=${cellId}`;
    } else {
        query = `fovId=${fovId}&cellId=${cellId}&cellLine=${cellLineName}`;
    }

    return (
        <iframe
            frameBorder={0}
            className={styles.cellViewer}
            src={`${CELL_VIEWER_URL}?${query}`}

        />
    );
};

export default CellViewer;

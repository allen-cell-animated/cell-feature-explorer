import React from "react";

import { CELL_VIEWER_URL } from "../../constants/index";
import { getCellLineFromLegacyCellID } from "../../util/index";

const styles = require("./style.css");

interface CellViewerProps {
    cellName: string;
    selected3DCellDir: string;
}

const CellViewer: React.SFC<CellViewerProps> = ({ cellName, selected3DCellDir }) => {
    // ?legacyName_1_2=AICS-10/AICS-10_5_5
    if (!cellName) {
        return null;
    }
    const cellLine = getCellLineFromLegacyCellID(cellName);

    return (
        <iframe
            frameBorder={0}
            className={styles.cellViewer}
            src={`${CELL_VIEWER_URL}?legacyName_1_2=${selected3DCellDir}/${cellLine}/${cellName}`}

        />
    );
};

export default CellViewer;

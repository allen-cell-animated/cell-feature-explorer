import React from "react";

import { CELL_VIEWER_URL } from "../../constants/index";
import { ImageViewerApp } from "ac-3d-viewer";

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

    return (
        <div className={styles.cellViewer}>
            <ImageViewerApp
                cellId={cellId}
                cellLine={cellLineName}
                fovId={fovId}
                isLegacyName={!fovId}
            />

        </div>
    );
};

export default CellViewer;

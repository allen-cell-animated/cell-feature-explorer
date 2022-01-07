import { ImageViewerApp } from "@aics/web-3d-viewer";
import React from "react";
// Need to import this stylesheet for the Drawer component used by the viewer
// TODO: Fix viewer so this is unnecessary?
import "antd/lib/drawer/style/index.less";

import { VolumeViewerProps } from "../../containers/Cfe/selectors";

import styles from "./style.css";

const CellViewer: React.FunctionComponent<VolumeViewerProps> = (props) => {
    if (!props.cellId) {
        return null;
    }

    return (
        <div className={styles.cellViewer}>
            <ImageViewerApp
                cellId={props.cellId}
                baseUrl={props.baseUrl}
                cellPath={props.cellPath}
                fovDownloadHref={props.fovDownloadHref}
                cellDownloadHref={props.cellDownloadHref}
                fovPath={props.fovPath}
                viewerChannelSettings={props.viewerChannelSettings}
                appHeight="90vh"
                canvasMargin="0 120px 0 0"
            />
        </div>
    );
};

export default CellViewer;

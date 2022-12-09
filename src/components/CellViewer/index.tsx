import { ImageViewerApp } from "@aics/web-3d-viewer";
import React from "react";
// Need to import this stylesheet for the Drawer component used by the viewer
// TODO: Fix viewer so this is unnecessary?
import "antd/lib/drawer/style/index.less";

import { VolumeViewerProps } from "../../containers/Cfe/selectors";

const CONTAINER_STYLE = {
    flex: 1,
    width: "100%",
    height: "100%",
    backgroundColor: "red",
};

const CellViewer: React.FunctionComponent<VolumeViewerProps> = (props) => {
    if (!props.cellId) {
        return null;
    }

    return (
        <div style={CONTAINER_STYLE}>
            <ImageViewerApp
                cellId={props.cellId}
                baseUrl={props.baseUrl}
                cellPath={props.cellPath}
                fovDownloadHref={props.fovDownloadHref}
                cellDownloadHref={props.cellDownloadHref}
                fovPath={props.fovPath}
                viewerChannelSettings={props.viewerChannelSettings}
                onControlPanelToggle={props.onControlPanelToggle}
                metadata={props.metadata}
                metadataFormat={props.metadataFormat}
                appHeight="100%"
                canvasMargin="0 120px 0 0"
            />
        </div>
    );
};

export default CellViewer;

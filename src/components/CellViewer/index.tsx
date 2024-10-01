import { ImageViewerApp, ViewerStateProvider } from "@aics/web-3d-viewer";
import React from "react";

import styles from "./style.css";

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
        <div className={styles.cellViewerContainer} style={CONTAINER_STYLE}>
            <ViewerStateProvider>
                <ImageViewerApp
                    cellId={props.cellId}
                    imageUrl={props.baseUrl + props.cellPath}
                    imageDownloadHref={props.cellDownloadHref}
                    parentImageUrl={props.fovPath ? props.baseUrl + props.fovPath : ""}
                    parentImageDownloadHref={props.fovDownloadHref}
                    viewerChannelSettings={props.viewerChannelSettings}
                    transform={props.transform}
                    onControlPanelToggle={props.onControlPanelToggle}
                    metadata={props.metadata}
                    appHeight="100%"
                    canvasMargin="0 0 0 0"
                />
            </ViewerStateProvider>
        </div>
    );
};

export default CellViewer;

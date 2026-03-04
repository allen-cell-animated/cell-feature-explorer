import { ImageViewerApp, ViewerStateProvider } from "@aics/vole-app";
import React from "react";

import styles from "./style.css";

import { VolumeViewerProps } from "../../containers/Cfe/selectors";


const CellViewer: React.FunctionComponent<VolumeViewerProps> = (props) => {
    if (!props.cellId) {
        return <div className={styles.emptyOverlay}>Select a cell in gallery to view it in 3D</div>;
    }

    return (
        <div className={styles.cellViewerContainer} >
            <ViewerStateProvider viewerSettings={props.viewerSettings}>
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
                    {...props.appProps}
                />
            </ViewerStateProvider>
        </div>
    );
};

export default CellViewer;

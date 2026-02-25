import { ImageViewerApp, ViewerStateProvider } from "@aics/vole-app";
import React, { useEffect, useState } from "react";

import styles from "./style.css";

import { VolumeViewerProps } from "../../containers/Cfe/selectors";

const FORCE_RERENDER_DELAY_MS = 1000;

const INITIAL_DUMMY_PROPS: VolumeViewerProps = {
    cellId: "103437",
    cellPath: "AICS-57/AICS-57_13104_103437_atlas.json",
    cellDownloadHref:
        "https://files.allencell.org/api/2.0/file/download?collection=cellviewer-1-4&id=C103437",
    fovDownloadHref:
        "https://files.allencell.org/api/2.0/file/download?collection=cellviewer-1-4&id=F13104",
    fovPath: "AICS-57/AICS-57_13104_atlas.json",
    baseUrl:
        "https://s3-us-west-2.amazonaws.com/bisque.allencell.org/v1.4.0/Cell-Viewer_Thumbnails/",
    viewerSettings: {},
    transform: undefined,
    metadata: undefined,
    appProps: {},
};

const CellViewer: React.FunctionComponent<VolumeViewerProps> = (props) => {
    ///** There is a bug in the viewer where when it mounts with initial data, it doesn't show anything
    // however, switching between data works correctly
    // this temporary code makes sure the viewer always shows data, but lines 31-51 should be deleted
    // once the bug is fixed */
    const [prevCellId, setPrevCellId] = useState<string | undefined>(props.cellId);

    const [propsToUse, setPropsToUse] = useState(INITIAL_DUMMY_PROPS);
    useEffect(() => {
        setPrevCellId(props.cellId);
    }, [props.cellId]);

    useEffect(() => {
        if (!props.cellId) {
            return;
        }
        if (prevCellId === undefined) {
            const timeout = setTimeout(() => {
                setPropsToUse(props);
            }, FORCE_RERENDER_DELAY_MS);

            return () => clearTimeout(timeout);
        } else {
            setPropsToUse(props);
        }
    }, [props.cellId]);

    if (!props.cellId) {
        return <div className={styles.emptyOverlay}>Select a cell in gallery to view it in 3D</div>;
    }

    return (
        <div className={styles.cellViewerContainer}>
            <ViewerStateProvider viewerSettings={propsToUse.viewerSettings}>
                <ImageViewerApp
                    cellId={propsToUse.cellId}
                    imageUrl={propsToUse.baseUrl + propsToUse.cellPath}
                    imageDownloadHref={propsToUse.cellDownloadHref}
                    parentImageUrl={
                        propsToUse.fovPath ? propsToUse.baseUrl + propsToUse.fovPath : ""
                    }
                    parentImageDownloadHref={propsToUse.fovDownloadHref}
                    viewerChannelSettings={propsToUse.viewerChannelSettings}
                    transform={propsToUse.transform}
                    onControlPanelToggle={propsToUse.onControlPanelToggle}
                    metadata={propsToUse.metadata}
                    appHeight="100%"
                    canvasMargin="0 0 0 0"
                    {...propsToUse.appProps}
                />
            </ViewerStateProvider>
        </div>
    );
};

export default CellViewer;

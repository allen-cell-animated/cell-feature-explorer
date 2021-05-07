import {
    Affix,
    Layout,
} from "antd";
import { uniq } from "lodash";
import * as React from "react";
import { ActionCreator, connect } from "react-redux";

import CellViewer from "../../components/CellViewer/index";
import SmallScreenWarning from "../../components/SmallScreenWarning";
import ColorByMenu from "../ColorByMenu";
import selectionStateBranch from "../../state/selection";
import { BoolToggleAction } from "../../state/selection/types";
import { State } from "../../state/types";
import {
    convertFullFieldIdToDownloadId,
    convertSingleImageIdToDownloadId,
    formatDownloadOfSingleImage
} from "../../state/util";
import MainPlotContainer from "../MainPlotContainer";
import ThumbnailGallery from "../ThumbnailGallery";
import { FileInfo } from "../../state/metadata/types";

const {
    Content,
    Header,
    Sider,
} = Layout;

const styles = require("./style.css");
const SMALL_SCREEN_WARNING_BREAKPOINT = 768;

interface CfeProps {
    galleryCollapsed: boolean;
    selected3DCell: string;
    selected3DCellFOV: string;
    selected3DCellCellLine: string;
    selected3DCellStructureName: string;
    selected3DCellProteinName: string;
    toggleGallery: ActionCreator<BoolToggleAction>;
    selected3DCellFileInfo: FileInfo;
    thumbnailRoot: string;
    downloadRoot: string;
    volumeViewerDataRoot: string;
}

class Cfe extends React.Component<CfeProps, {}> {
    private static panelKeys = ["proteinNames", "selections", "clusters"];
    public state = {
        defaultActiveKey: [Cfe.panelKeys[0]],
        dontShowSmallScreenWarningAgain: false,
        openKeys: [Cfe.panelKeys[0]],
        showSmallScreenWarning: window.innerWidth <= SMALL_SCREEN_WARNING_BREAKPOINT,
        width: window.innerWidth,
    };

    public componentDidMount = () => {
        window.addEventListener("resize", this.updateDimensions);
    }

    public updateDimensions = () => {
        if (window.innerWidth === this.state.width) {
            // listener is triggered on scroll in some mobile devices
            return;
        }
        const shouldShow = window.innerWidth <= SMALL_SCREEN_WARNING_BREAKPOINT &&
            !this.state.dontShowSmallScreenWarningAgain;
        this.setState({
            showSmallScreenWarning: shouldShow,
            width: window.innerWidth,
        });
    }

    public onSelectionToolUsed = () => {
        this.setState({ openKeys: uniq([...this.state.openKeys, Cfe.panelKeys[1]]) });
    }

    public onPanelClicked = (value: string[]) => {
        this.setState({ openKeys: value });
    }

    public handleClose = () => {
        this.setState({
            showSmallScreenWarning: false,
        });
        // this.props.requestAvailableDatasets();
    }

    public onDismissCheckboxChecked = (value: boolean) => {
        this.setState({ dontShowSmallScreenWarningAgain: value });
    }

    public render() {
        const {
            galleryCollapsed,
            selected3DCell,
            downloadRoot,
            volumeViewerDataRoot,
            selected3DCellProteinName,
            selected3DCellStructureName,
            toggleGallery,
            selected3DCellFileInfo,
        } = this.props;

        const {
            openKeys,
            defaultActiveKey,
        } = this.state;
        return (
            <Layout>
                <Affix>
                    <Sider
                        width="100%"
                        collapsible={true}
                        collapsed={galleryCollapsed}
                        onCollapse={toggleGallery}
                        defaultCollapsed={true}
                        collapsedWidth={100}
                        className={styles.sider}
                        reverseArrow={true}
                    >
                        <ThumbnailGallery
                            collapsed={galleryCollapsed}
                            toggleGallery={toggleGallery}
                        />
                    </Sider>
                </Affix>
                <Layout className={galleryCollapsed ? styles.noBlur : styles.blur}>
                    <Header className={styles.headerMain}>
                        <h1>Cell Feature Explorer</h1>
                    </Header>
                    <Header className={styles.headerSection}>
                        <h2>Plot</h2>
                    </Header>
                    <Layout>
                        <SmallScreenWarning
                            handleClose={this.handleClose}
                            onDismissCheckboxChecked={this.onDismissCheckboxChecked}
                            visible={this.state.showSmallScreenWarning}
                        />
                        <Sider
                            className={styles.colorMenu}
                            width={450}
                            collapsible={false}
                            collapsedWidth={250}
                        >
                            <ColorByMenu
                                panelKeys={Cfe.panelKeys}
                                openKeys={openKeys}
                                defaultActiveKey={defaultActiveKey}
                                onPanelClicked={this.onPanelClicked}
                            />
                        </Sider>
                        <Content className={styles.content}>
                            <div className={styles.plotView}>
                                <MainPlotContainer
                                    handleSelectionToolUsed={this.onSelectionToolUsed}
                                />
                            </div>
                        </Content>
                        {/* spacer for the gallery overlay */}
                        <Sider width={120} />
                    </Layout>
                    <div className={styles.cellViewerContainer}>
                        <Header className={styles.headerSection}>
                            <h2 className={styles.header}>3D Viewer</h2>
                            {selected3DCell && selected3DCellStructureName && (
                                <h4 className={styles.selectedInfo}>
                                    <span className={styles.label}>Viewing cell:</span>{" "}
                                    {selected3DCell},
                                    <span className={styles.label}> Protein (structure): </span>
                                    {selected3DCellProteinName} ({selected3DCellStructureName})
                                </h4>
                            )}
                        </Header>
                        <CellViewer
                            {...selected3DCellFileInfo}
                            volumeViewerDataRoot={volumeViewerDataRoot}
                            fovDownloadHref={formatDownloadOfSingleImage(
                                downloadRoot,
                                convertFullFieldIdToDownloadId(
                                    selected3DCellFileInfo ? selected3DCellFileInfo.FOVId : ""
                                )
                            )}
                            cellDownloadHref={formatDownloadOfSingleImage(
                                downloadRoot,
                                convertSingleImageIdToDownloadId(
                                    selected3DCellFileInfo ? selected3DCellFileInfo.CellId : ""
                                )
                            )}
                        />
                    </div>
                </Layout>
            </Layout>
        );
    }

}

function mapStateToProps(state: State) {
    return {
        galleryCollapsed: selectionStateBranch.selectors.getGalleryCollapsed(state),
        selected3DCell: selectionStateBranch.selectors.getSelected3DCell(state),
        selected3DCellFileInfo: selectionStateBranch.selectors.getSelected3DCellFileInfo(state),
        selected3DCellCellLine: selectionStateBranch.selectors.getSelected3DCellCellLine(state),
        selected3DCellFOV: selectionStateBranch.selectors.getSelected3DCellFOV(state),
        selected3DCellProteinName: selectionStateBranch.selectors.getSelected3DCellLabeledProtein(
            state
        ),
        selected3DCellStructureName: selectionStateBranch.selectors.getSelected3DCellLabeledStructure(
            state
        ),
        thumbnailRoot: selectionStateBranch.selectors.getThumbnailRoot(state),
        volumeViewerDataRoot: selectionStateBranch.selectors.getVolumeViewerDataRoot(state),
        downloadRoot: selectionStateBranch.selectors.getDownloadRoot(state),
    };
}

const dispatchToPropsMap = {
    toggleGallery: selectionStateBranch.actions.toggleGallery,
};

export default connect(mapStateToProps, dispatchToPropsMap)(Cfe);

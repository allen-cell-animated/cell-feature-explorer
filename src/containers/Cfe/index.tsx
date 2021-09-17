import { Affix, Layout } from "antd";
import { uniq } from "lodash";
import * as React from "react";
import { ActionCreator, connect } from "react-redux";

import CellViewer from "../../components/CellViewer/index";
import SmallScreenWarning from "../../components/SmallScreenWarning";
import ColorByMenu from "../ColorByMenu";
import selectionStateBranch from "../../state/selection";
import { BoolToggleAction } from "../../state/selection/types";
import metadataStateBranch from "../../state/metadata";
import { State } from "../../state/types";
import MainPlotContainer from "../MainPlotContainer";
import ThumbnailGallery from "../ThumbnailGallery";
import { SetSmallScreenWarningAction, RequestAction } from "../../state/metadata/types";
import { getPropsForVolumeViewer, getViewerHeader, VolumeViewerProps } from "./selectors";

const { Content, Header, Sider } = Layout;

import styles from "./style.css";
const SMALL_SCREEN_WARNING_BREAKPOINT = 768;

interface CfeProps {
    galleryCollapsed: boolean;
    toggleGallery: ActionCreator<BoolToggleAction>;
    volumeViewerProps: VolumeViewerProps;
    thumbnailRoot: string;
    showSmallScreenWarning: boolean;
    setShowSmallScreenWarning: ActionCreator<SetSmallScreenWarningAction>;
    requestFeatureData: ActionCreator<RequestAction>;
    viewerHeader: { cellId: string; label: string; value: string };
}

class Cfe extends React.Component<CfeProps, {}> {
    private static panelKeys = ["proteinNames", "selections", "clusters"];
    public state = {
        defaultActiveKey: [Cfe.panelKeys[0]],
        dontShowSmallScreenWarningAgain: false,
        openKeys: [Cfe.panelKeys[0]],
        width: window.innerWidth,
    };

    public componentDidMount = () => {
        this.props.setShowSmallScreenWarning(window.innerWidth <= SMALL_SCREEN_WARNING_BREAKPOINT);
        window.addEventListener("resize", this.updateDimensions);
    };

    public updateDimensions = () => {
        if (window.innerWidth === this.state.width) {
            // listener is triggered on scroll in some mobile devices
            return;
        }
        const shouldShow =
            window.innerWidth <= SMALL_SCREEN_WARNING_BREAKPOINT &&
            !this.state.dontShowSmallScreenWarningAgain;
        this.setState({ width: window.innerWidth });
        this.props.setShowSmallScreenWarning(shouldShow);
    };

    public onSelectionToolUsed = () => {
        this.setState({ openKeys: uniq([...this.state.openKeys, Cfe.panelKeys[1]]) });
    };

    public onPanelClicked = (value: string[]) => {
        this.setState({ openKeys: value });
    };

    public handleClose = () => {
        this.props.setShowSmallScreenWarning(false);
        this.props.requestFeatureData();
    };

    public onDismissCheckboxChecked = (value: boolean) => {
        this.setState({ dontShowSmallScreenWarningAgain: value });
    };

    public render() {
        const {
            galleryCollapsed,
            viewerHeader,
            toggleGallery,
            volumeViewerProps,
            showSmallScreenWarning,
        } = this.props;

        const { openKeys, defaultActiveKey } = this.state;
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
                    <Header className={styles.headerSection}>
                        <h2>Plot</h2>
                    </Header>
                    <Layout>
                        <SmallScreenWarning
                            handleClose={this.handleClose}
                            onDismissCheckboxChecked={this.onDismissCheckboxChecked}
                            visible={showSmallScreenWarning}
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
                            {viewerHeader.cellId && (
                                <h4 className={styles.selectedInfo}>
                                    <span className={styles.label}>Viewing cell:</span>{" "}
                                    {viewerHeader.cellId},{" "}
                                    <span className={styles.label}>{viewerHeader.label}:</span>{" "}
                                    {viewerHeader.value}
                                </h4>
                            )}
                        </Header>
                        <CellViewer {...volumeViewerProps} />
                    </div>
                </Layout>
            </Layout>
        );
    }
}

function mapStateToProps(state: State) {
    return {
        galleryCollapsed: selectionStateBranch.selectors.getGalleryCollapsed(state),
        volumeViewerProps: getPropsForVolumeViewer(state),
        thumbnailRoot: selectionStateBranch.selectors.getThumbnailRoot(state),
        showSmallScreenWarning: metadataStateBranch.selectors.getShowSmallScreenWarning(state),
        viewerHeader: getViewerHeader(state),
    };
}

const dispatchToPropsMap = {
    toggleGallery: selectionStateBranch.actions.toggleGallery,
    setShowSmallScreenWarning: metadataStateBranch.actions.setShowSmallScreenWarning,
    requestFeatureData: metadataStateBranch.actions.requestFeatureData,
};

export default connect(mapStateToProps, dispatchToPropsMap)(Cfe);

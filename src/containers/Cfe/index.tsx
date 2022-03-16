import { Affix, Layout, Menu } from "antd";
import { ClickParam } from "antd/lib/menu";
import { uniq } from "lodash";
import * as React from "react";
import { ActionCreator, connect } from "react-redux";
import classNames from "classnames";

import CellViewer from "../../components/CellViewer/index";
import SmallScreenWarning from "../../components/SmallScreenWarning";
import selectionStateBranch from "../../state/selection";
import { BoolToggleAction } from "../../state/selection/types";
import metadataStateBranch from "../../state/metadata";
import { State } from "../../state/types";
import ThumbnailGallery from "../ThumbnailGallery";
import PlotTab from "../../components/PlotTab";
import { SetSmallScreenWarningAction, RequestAction } from "../../state/metadata/types";
import { getPropsForVolumeViewer, getViewerHeader, VolumeViewerProps } from "./selectors";

const { Content, Sider } = Layout;

import styles from "./style.css";
const SMALL_SCREEN_WARNING_BREAKPOINT = 768;
const PLOT_TAB_KEY = "plot";
const VIEWER_TAB_KEY = "3d-viewer";

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

interface CfeState {
    defaultActiveKey: string[];
    dontShowSmallScreenWarningAgain: boolean;
    openKeys: string[];
    width: number;
    currentTab: string;
}

class Cfe extends React.Component<CfeProps, CfeState> {
    private static panelKeys = ["groupings", "selections"];
    public state: CfeState = {
        defaultActiveKey: [Cfe.panelKeys[0]],
        dontShowSmallScreenWarningAgain: false,
        openKeys: [Cfe.panelKeys[0]],
        width: window.innerWidth,
        currentTab: PLOT_TAB_KEY
    };

    public componentDidMount = () => {
        this.props.setShowSmallScreenWarning(window.innerWidth <= SMALL_SCREEN_WARNING_BREAKPOINT);
        window.addEventListener("resize", this.updateDimensions);
    };

    public componentDidUpdate = (prevProps: CfeProps, prevState: CfeState) => {
        const { currentTab } = this.state;
        if (prevState.currentTab !== currentTab && currentTab === VIEWER_TAB_KEY) {
            // Need to manually trigger events that depend on the window resizing,
            // otherwise the 3D viewer canvas will have 0 height and 0 width.
            window.dispatchEvent(new Event('resize'));

            // Add selected cell info on top left corner of canvas
            const { viewerHeader } = this.props;
            const parent = document.querySelector(".cell-viewer-wrapper .ant-layout-content");
            const wrapper = document.createElement("div");
            wrapper.className = "image-info-wrapper";
            if (parent) {
                parent.appendChild(wrapper);
                wrapper.innerHTML = `
                    <h4 className=${styles.selectedInfo}>
                        <span className=${styles.label}>Viewing cell:</span>${" "}
                        ${viewerHeader.cellId},${" "}
                        <span className=${styles.label}>${viewerHeader.label}:</span>${" "}
                        ${viewerHeader.value}
                    </h4>
                `
            }
        }
    }

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

    private handleTabClick = (event: ClickParam) => {
        this.setState({ currentTab: event.key });
    }

    public render() {
        const {
            galleryCollapsed,
            // viewerHeader,
            toggleGallery,
            volumeViewerProps,
            showSmallScreenWarning,
        } = this.props;
        const { currentTab } = this.state;

        const viewerClassNames = classNames([
            styles.content, 
            {[styles.hidden]: currentTab !== VIEWER_TAB_KEY}
        ]);
        const plotClassNames = classNames([
            {[styles.hidden]: currentTab === VIEWER_TAB_KEY}
        ]);

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
                            openViewerTab={() => this.setState({ currentTab: VIEWER_TAB_KEY })}
                        />
                    </Sider>
                </Affix>
                <Layout className={galleryCollapsed ? styles.noBlur : styles.blur}>
                    <Menu 
                        className={styles.tabbedMenu}
                        onClick={this.handleTabClick}
                        selectedKeys={[this.state.currentTab]}
                        mode="horizontal"
                    >
                        <Menu.Item key={PLOT_TAB_KEY}>
                            <span 
                                className={classNames([
                                    "icon-moon",
                                    "anticon",
                                    styles.iconPlot
                                ])}
                            />
                            Plot
                        </Menu.Item>
                        <Menu.Item key={VIEWER_TAB_KEY}>
                            <span
                                className={classNames([
                                    "icon-moon",
                                    "anticon",
                                    styles.iconCube
                                ])}
                            />
                            3D Viewer
                        </Menu.Item>
                    </Menu>
                    <SmallScreenWarning
                        handleClose={this.handleClose}
                        onDismissCheckboxChecked={this.onDismissCheckboxChecked}
                        visible={showSmallScreenWarning}
                    />
                    <Layout className={plotClassNames}>
                        <PlotTab />
                    </Layout>
                    <Content className={viewerClassNames}>
                        <CellViewer {...volumeViewerProps} />
                    </Content>
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

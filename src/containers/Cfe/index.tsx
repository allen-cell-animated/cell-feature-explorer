import AllenCellHeader from "@aics/allencell-nav-bar";
import "@aics/allencell-nav-bar/style/style.css";
import {
    Affix,
    Layout,
} from "antd";
import { uniq } from "lodash";
import * as React from "react";
import { ActionCreator, connect } from "react-redux";
import classNames from "classnames";

import BackToPlot from "../../components/BackToPlot/index";
import CellViewer from "../../components/CellViewer/index";
import LoadingOverlay from "../../components/LoadingOverlay";
import ColorByMenu from "../ColorByMenu";
import selectionStateBranch from "../../state/selection";
import metadataStateBranch from "../../state/metadata";
import { BoolToggleAction } from "../../state/selection/types";
import { State } from "../../state/types";
import {
    convertFullFieldIdToDownloadId,
    convertSingleImageIdToDownloadId,
    formatDownloadOfSingleImage
} from "../../state/util";
import MainPlotContainer from "../MainPlotContainer";
import ThumbnailGallery from "../ThumbnailGallery";

const {
    Content,
    Header,
    Sider,
} = Layout;

const styles = require("./style.css");
const SMALL_SCREEN_WARNING_BREAKPOINT = 768;

interface CfeProps {
    isLoading: boolean;
    galleryCollapsed: boolean;
    selected3DCell: string;
    selected3DCellFOV: string;
    selected3DCellCellLine: string;
    selected3DCellStructureName: string;
    selected3DCellProteinName: string;
    toggleGallery: ActionCreator<BoolToggleAction>;
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

    public onSelectionToolUsed = () => {
        this.setState({ openKeys: uniq([...this.state.openKeys, Cfe.panelKeys[1]]) });
    }

    public onPanelClicked = (value: string[]) => {
        this.setState({ openKeys: value });
    }

    public onDismissCheckboxChecked = (value: boolean) => {
        this.setState({ dontShowSmallScreenWarningAgain: value });
    }

    public render() {
        const {
            isLoading,
            galleryCollapsed,
            selected3DCell,
            selected3DCellFOV,
            selected3DCellCellLine,
            selected3DCellProteinName,
            selected3DCellStructureName,
            toggleGallery,
        } = this.props;

        const {
            openKeys,
            defaultActiveKey,
        } = this.state;
        const layoutClassnames = classNames([styles.container, {[styles.isLoading]: isLoading}])
        return (
            <Layout className={layoutClassnames}>
                <LoadingOverlay isLoading={isLoading} />
                <BackToPlot />
                <AllenCellHeader show={true} />
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
                            <Sider />
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
                                cellId={selected3DCell}
                                fovId={selected3DCellFOV}
                                cellLineName={selected3DCellCellLine}
                                fovDownloadHref={formatDownloadOfSingleImage(
                                    convertFullFieldIdToDownloadId(selected3DCellFOV)
                                )}
                                cellDownloadHref={formatDownloadOfSingleImage(
                                    convertSingleImageIdToDownloadId(selected3DCell)
                                )}
                            />
                        </div>
                    </Layout>
                </Layout>
            </Layout>
        );
    }

}

function mapStateToProps(state: State) {
    return {
        isLoading: metadataStateBranch.selectors.getIsLoading(state),
        galleryCollapsed: selectionStateBranch.selectors.getGalleryCollapsed(state),
        selected3DCell: selectionStateBranch.selectors.getSelected3DCell(state),
        selected3DCellCellLine: selectionStateBranch.selectors.getSelected3DCellCellLine(state),
        selected3DCellFOV: selectionStateBranch.selectors.getSelected3DCellFOV(state),
        selected3DCellProteinName: selectionStateBranch.selectors.getSelected3DCellLabeledProtein(state),
        selected3DCellStructureName: selectionStateBranch.selectors.getSelected3DCellLabeledStructure(state),
    };
}

const dispatchToPropsMap = {
    toggleGallery: selectionStateBranch.actions.toggleGallery,
};

export default connect(mapStateToProps, dispatchToPropsMap)(Cfe);
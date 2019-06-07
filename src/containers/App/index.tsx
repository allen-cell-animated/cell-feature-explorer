import {
    Icon,
    Layout,
} from "antd";
import { uniq } from "lodash";
import * as React from "react";
import { ActionCreator, connect } from "react-redux";

import BackToPlot from "../../components/BackToPlot/index";
import CellViewer from "../../components/CellViewer/index";
import ColorByMenu from "../../containers/ColorByMenu";
import selectionStateBranch from "../../state/selection";
import { BoolToggleAction } from "../../state/selection/types";
import { State } from "../../state/types";
import MainPlotContainer from "../MainPlotContainer";
import ThumbnailGallery from "../ThumbnailGallery";

const {
    Content,
    Header,
    Sider,
} = Layout;

const styles = require("./style.css");

interface AppProps {
    galleryCollapsed: boolean;
    selected3DCell: string;
    selected3DCellFOV: string;
    selected3DCellCellLine: string;
    selected3DCellStructureName: string;
    selected3DCellProteinName: string;
    toggleGallery: ActionCreator<BoolToggleAction>;
}

class App extends React.Component<AppProps, {}> {
    private static panelKeys = ["proteinNames", "selections", "clusters"];

    public state = {
        defaultActiveKey: [App.panelKeys[0]],
        openKeys: [App.panelKeys[0]],
    };

    constructor(props: AppProps) {
        super(props);
        this.onSelectionToolUsed = this.onSelectionToolUsed.bind(this);
        this.onPanelClicked = this.onPanelClicked.bind(this);
    }

    public onSelectionToolUsed() {
        this.setState({openKeys: uniq([...this.state.openKeys, App.panelKeys[1]])});
    }

    public onPanelClicked(value: string[]) {
        this.setState({openKeys: value});
    }

    public render() {
        const {
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

        return (
                <Layout
                    className={styles.container}
                >
                    <BackToPlot />

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
                    <Layout
                        className={galleryCollapsed ? styles.noBlur : styles.blur}
                    >
                        <Header
                            className={styles.headerSection}
                        >
                            <h2><Icon type="dot-chart"/> Plot</h2>
                        </Header>
                    <Layout
                    >

                        <Sider
                            className={styles.colorMenu}
                            width={450}
                            collapsible={false}
                            collapsedWidth={250}
                        >
                            <ColorByMenu
                                panelKeys={App.panelKeys}
                                openKeys={openKeys}
                                defaultActiveKey={defaultActiveKey}
                                onPanelClicked={this.onPanelClicked}
                            />
                        </Sider>
                        <Content
                            className={styles.content}
                        >
                            <div className={styles.plotView} >
                                <MainPlotContainer
                                    handleSelectionToolUsed={this.onSelectionToolUsed}
                                    galleryCollapsed={galleryCollapsed}
                                />
                            </div>
                        </Content>
                        <Sider />

                    </Layout>

                    <div className={styles.cellViewerContainer}>
                        <Header
                            className={styles.headerSection}
                        >
                            <h2 className={styles.header}><Icon type="sync"/> 3D Viewer</h2>
                            {selected3DCell && selected3DCellStructureName && (
                                <h4 className={styles.selectedInfo}>
                                    <span className={styles.label}>Viewing cell:</span> {selected3DCell},
                                    <span className={styles.label}> Protein (structure): </span>
                                    {selected3DCellProteinName} ({selected3DCellStructureName})
                                </h4>
                            )}
                        </Header>
                        <CellViewer
                            cellId={selected3DCell}
                            fovId={selected3DCellFOV}
                            cellLineName={selected3DCellCellLine}
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
        selected3DCellCellLine: selectionStateBranch.selectors.getSelected3DCellCellLine(state),
        selected3DCellFOV: selectionStateBranch.selectors.getSelected3DCellFOV(state),
        selected3DCellProteinName: selectionStateBranch.selectors.getSelected3DCellLabeledProtein(state),
        selected3DCellStructureName: selectionStateBranch.selectors.getSelected3DCellLabeledStructure(state),
    };
}

const dispatchToPropsMap = {
    toggleGallery: selectionStateBranch.actions.toggleGallery,
};

export default connect(mapStateToProps, dispatchToPropsMap)(App);

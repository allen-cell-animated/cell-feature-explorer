import {
    Icon,
    Layout,
} from "antd";
import { uniq } from "lodash";
import * as React from "react";
import { connect } from "react-redux";

import {
    getSelected3DCell,
    getSelected3DCellCellLine,
    getSelected3DCellFOV,
    getSelected3DCellLabeledStructure,
} from "../../state/selection/selectors";

import BackToPlot from "../../components/BackToPlot/index";

import CellViewer from "../../components/CellViewer/index";
import ColorByMenu from "../../containers/ColorByMenu";
import MainPlotContainer from "../MainPlotContainer";
import ThumbnailGallery from "../ThumbnailGallery";

import { State } from "../../state/types";

const {
    Content,
    Header,
    Sider,
} = Layout;
const styles = require("./style.css");

interface AppProps {
    selected3DCell: string;
    selected3DCellFOV: string;
    selected3DCellCellLine: string;
    selected3DCellStructureName: string;
}

class App extends React.Component<AppProps, {}> {
    private static panelKeys = ["proteinNames", "selections", "clusters"];

    public state = {
        defaultActiveKey: [App.panelKeys[0]],
        galleryCollapsed: true,
        initClick: true,
        openKeys: [App.panelKeys[0]],
    };

    constructor(props: AppProps) {
        super(props);
        this.onSelectionToolUsed = this.onSelectionToolUsed.bind(this);
        this.onPanelClicked = this.onPanelClicked.bind(this);
        this.toggleGallery = this.toggleGallery.bind(this);
        this.onGraphClicked = this.onGraphClicked.bind(this);

    }
    public onSelectionToolUsed() {
        this.setState({openKeys: uniq([...this.state.openKeys, App.panelKeys[1]])});
    }

    public onPanelClicked(value: string[]) {
        this.setState({openKeys: value});
    }

    public onGraphClicked() {
        const { initClick } = this.state;
        if (initClick) {
            this.setState({
                galleryCollapsed: false,
                initClick: false,
            });
        }
    }

    public toggleGallery(value: boolean) {
        this.setState({galleryCollapsed: value});
    }

    public render() {
        const {
            selected3DCell,
            selected3DCellFOV,
            selected3DCellCellLine,
            selected3DCellStructureName,
        } = this.props;

        const {
            galleryCollapsed,
            openKeys,
            defaultActiveKey,
        } = this.state;

        return (
                <Layout className={styles.container}>
                    <BackToPlot />

                    <Sider
                        width={330}
                        collapsible={true}
                        collapsed={galleryCollapsed}
                        onCollapse={this.toggleGallery}
                        defaultCollapsed={true}
                        className={styles.sider}
                        reverseArrow={true}
                    >
                        <ThumbnailGallery />
                    </Sider>
                    <Layout>
                        <Header className={styles.headerSection}>
                            <h2><Icon type="dot-chart"/> Plot</h2>
                        </Header>
                    <Layout>

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
                        <Content className={styles.content}>
                            <div className={styles.plotView} >
                                <MainPlotContainer
                                    handleSelectionToolUsed={this.onSelectionToolUsed}
                                    handleClickedChart={this.onGraphClicked}
                                />
                            </div>
                        </Content>
                        <Sider />

                    </Layout>

                    <div className={styles.cellViewerContainer}>
                        <section className={styles.headerSection}>
                            <h2 className={styles.header}><Icon type="sync"/> 3D Viewer </h2>
                            {selected3DCell && (
                                <h4 className={styles.selectedInfo}>
                                    <span className={styles.label}>Viewing cell:</span> {selected3DCell},
                                    <span className={styles.label}> labeled structure: </span>
                                    {selected3DCellStructureName}
                                </h4>
                            )}
                        </section>
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
        selected3DCell: getSelected3DCell(state),
        selected3DCellCellLine: getSelected3DCellCellLine(state),
        selected3DCellFOV: getSelected3DCellFOV(state),
        selected3DCellStructureName: getSelected3DCellLabeledStructure(state),
        };
}

export default connect(mapStateToProps, null)(App);

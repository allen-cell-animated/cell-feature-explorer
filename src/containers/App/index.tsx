import {
    Layout,
} from "antd";
import * as React from "react";
const { Header, Footer, Sider, Content } = Layout;
import "antd/lib/layout/style";
import { uniq } from "lodash";
import { connect } from "react-redux";

import {
    getSelected3DCell,
    getSelected3DCellCellLine,
    getSelected3DCellFOV,
} from "../../state/selection/selectors";

import CellViewer from "../../components/CellViewer/index";
import ColorByMenu from "../../containers/ColorByMenu";
import MainPlotContainer from "../MainPlotContainer";
import ThumbnailGallery from "../ThumbnailGallery";

import AffixedNav from "../../components/AffixNav";
import { State } from "../../state/types";

const styles = require("./style.css");

interface AppProps {
    selected3DCell: string;
    selected3DCellFOV: string;
    selected3DCellCellLine: string;
}

class App extends React.Component<AppProps, {}> {
    public panelKeys = ["proteinNames", "clusters"];
    public state = {
        defaultActiveKey: [this.panelKeys[0]],
        openKeys: [this.panelKeys[0]],
    };
    constructor(props: AppProps) {
        super(props);
        this.onSelectionToolUsed = this.onSelectionToolUsed.bind(this);
        this.onPanelClicked = this.onPanelClicked.bind(this);
    }
    public onSelectionToolUsed() {
        this.setState({openKeys: uniq([...this.state.openKeys, this.panelKeys[1]])});
    }

    public onPanelClicked(value: string[]) {
        this.setState({openKeys: value});
    }
    public render() {
        const {
            selected3DCell,
            selected3DCellFOV,
            selected3DCellCellLine,
        } = this.props;
        return (
            <React.Fragment>
                <AffixedNav
                />
                <Layout className={styles.container}>
                    <Header>Cell feature explorer
                    </Header>
                    <Layout>
                        <Sider
                            width={400}
                            className={styles.colorMenu}
                        >
                            <ColorByMenu
                                panelKeys={this.panelKeys}
                                openKeys={this.state.openKeys}
                                defaultActiveKey={this.state.defaultActiveKey}
                                onPanelClicked={this.onPanelClicked}
                            />
                        </Sider>
                        <Content>
                            <div className={styles.plotView} >
                                <MainPlotContainer
                                    handleSelectionToolUsed={this.onSelectionToolUsed}
                                />
                            </div>

                        </Content>

                    </Layout>
                    <Footer>
                        <ThumbnailGallery />
                        <div className={styles.cellViewerContainer}>
                            <CellViewer
                                cellId={selected3DCell}
                                fovId={selected3DCellFOV}
                                cellLineName={selected3DCellCellLine}
                            />
                        </div>
                    </Footer>
                </Layout>
            </React.Fragment>
        );
    }
}

function mapStateToProps(state: State) {
    return {
        selected3DCell: getSelected3DCell(state),
        selected3DCellCellLine: getSelected3DCellCellLine(state),
        selected3DCellFOV: getSelected3DCellFOV(state),
        };
}

export default connect(mapStateToProps, null)(App);

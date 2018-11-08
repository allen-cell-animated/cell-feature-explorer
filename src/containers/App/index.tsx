import {
    Layout,
} from "antd";
import * as React from "react";
const { Header, Footer, Sider, Content } = Layout;
import "antd/lib/layout/style";
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
    public render() {
        const {
            selected3DCell,
            selected3DCellFOV,
            selected3DCellCellLine,
        } = this.props;
        return (
            <Layout className={styles.container}>
                <Header>Cell feature explorer
                </Header>

                <Layout>
                    <Sider
                        width={400}
                        className={styles.colorMenu}
                    >
                        <AffixedNav
                        />

                        <ColorByMenu />
                    </Sider>
                    <Content>
                        <div className={styles.plotView} >
                            <MainPlotContainer />
                            <ThumbnailGallery />
                        </div>
                    </Content>
                </Layout>
                <Footer>
                    <CellViewer
                        cellId={selected3DCell}
                        fovId={selected3DCellFOV}
                        cellLineName={selected3DCellCellLine}
                    />
                </Footer>
            </Layout>
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

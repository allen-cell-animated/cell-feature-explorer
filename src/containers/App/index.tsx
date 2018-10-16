import * as React from "react";
import {
    connect,
} from "react-redux";

import {
    getSelected3DCell,
    getSelected3DCellCellLine,
    getSelected3DCellFOV,
} from "../../state/selection/selectors";

import CellViewer from "../../components/CellViewer/index";
import ColorByMenu from "../../containers/ColorByMenu";
import MainPlotContainer from "../MainPlotContainer";
import ThumbnailGallery from "../ThumbnailGallery";

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
            <div className={styles.container}>
                <div className={styles.plotView} >
                    <MainPlotContainer />
                    <ThumbnailGallery />
                </div>

                <div className={styles.colorMenu}>
                    <ColorByMenu />
                </div>
                <CellViewer
                    cellId={selected3DCell}
                    fovId={selected3DCellFOV}
                    cellLineName={selected3DCellCellLine}
                />
            </div>
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

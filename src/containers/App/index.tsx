import * as React from "react";
import {
    connect,
} from "react-redux";

import {
    getSelected3DCell,
    getSelected3DCellDir,
} from "../../state/selection/selectors";

import CellViewer from "../../components/CellViewer/index";
import ColorByMenu from "../../containers/ColorByMenu";
import MainPlotContainer from "../MainPlotContainer";
import ThumbnailGallery from "../ThumbnailGallery";

import { State } from "../../state/types";

const styles = require("./style.css");

interface AppProps {
    selected3DCell: string;
    selected3DCellDir: string;
}

class App extends React.Component<AppProps, {}> {
    public render() {
        const {
            selected3DCell,
            selected3DCellDir,
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
                    cellName={selected3DCell}
                    selected3DCellDir={selected3DCellDir}
                />
            </div>
        );
    }
}

function mapStateToProps(state: State) {
    return {
        selected3DCell: getSelected3DCell(state),
        selected3DCellDir: getSelected3DCellDir(state),
    };
}

export default connect(mapStateToProps, null)(App);

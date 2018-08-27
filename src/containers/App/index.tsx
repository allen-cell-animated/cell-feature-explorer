import * as React from "react";
import { connect } from "react-redux";

import ColorByMenu from "../../containers/ColorByMenu";
import { State } from "../../state/types";
import MainPlotContainer from "../MainPlotContainer";
import ThumbnailGallery from "../ThumbnailGallery";

const styles = require("./style.css");

export default class App extends React.Component<{}, {}> {
    public render() {
        return (
            <div className={styles.container}>
                <div className={styles.plotView} >
                    <ThumbnailGallery />
                    <MainPlotContainer />
                </div>

                <div className={styles.colorMenu}>
                    <ColorByMenu />
                </div>

            </div>
        );
    }
}

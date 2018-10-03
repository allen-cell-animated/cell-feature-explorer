import * as React from "react";

import ColorByMenu from "../../containers/ColorByMenu";
import MainPlotContainer from "../MainPlotContainer";
import ThumbnailGallery from "../ThumbnailGallery";

const styles = require("./style.css");

export default class App extends React.Component<{}, {}> {
    public render() {
        return (
            <div className={styles.container}>
                <div className={styles.plotView} >
                    <MainPlotContainer />
                    <ThumbnailGallery />
                </div>

                <div className={styles.colorMenu}>
                    <ColorByMenu />
                </div>

            </div>
        );
    }
}

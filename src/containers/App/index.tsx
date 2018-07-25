import * as React from "react";
import PlotView from "../PlotView";

const styles = require("./style.css");

export default class App extends React.Component<{}, {}> {
    public render() {
        return (
            <div className={styles.container}>Hello world
                <PlotView />
            </div>
        );
    }
}

import * as React from "react";

const styles = require("./style.css");

export default class App extends React.Component<{}, {}> {
    public render() {
        return (
            <div className={styles.container}>Hello world</div>
        );
    }
}

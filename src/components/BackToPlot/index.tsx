import {
    BackTop,
    Icon,
} from "antd";
import React from "react";

const styles = require("./style.css");

const BackToPlot: React.SFC = () => {
    return (
        <BackTop
            visibilityHeight={10}
            className={styles.container}
        >
            <div className={styles.backTopInner}><Icon type="caret-up" /> TO PLOT</div>
        </BackTop>
    );
};

export default BackToPlot;

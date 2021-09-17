import { BackTop, Icon } from "antd";
import React from "react";

import styles from "./style.css";

const BackToPlot: React.SFC = () => {
    return (
        <BackTop visibilityHeight={10} className={styles.container}>
            <div className={styles.backTopInner}>
                <Icon type="caret-up" />
                <br /> To Plot
            </div>
        </BackTop>
    );
};

export default BackToPlot;

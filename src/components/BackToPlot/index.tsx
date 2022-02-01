import { BackTop } from "antd";
import { CaretUpFilled } from "@ant-design/icons";
import React from "react";

import styles from "./style.css";

const BackToPlot: React.SFC = () => {
    return (
        <BackTop visibilityHeight={10} className={styles.container}>
            <div className={styles.backTopInner}>
                <CaretUpFilled />
                <br /> To Plot
            </div>
        </BackTop>
    );
};

export default BackToPlot;

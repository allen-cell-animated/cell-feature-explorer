import {
    BackTop,
    Icon,
} from "antd";
import React from "react";

const styles = require("./style.css");

interface BackToPlotProps {
    galleryCollapsed: boolean;
}

const BackToPlot: React.SFC<BackToPlotProps> = (props) => {
    const className = props.galleryCollapsed ? styles.container : [styles.container, styles.shiftedContainer].join(" ");
    return (
        <BackTop
            visibilityHeight={10}
            className={className}
        >
            <div className={styles.backTopInner}><Icon type="caret-up" /><br/> To Plot</div>
        </BackTop>
    );
};

export default BackToPlot;

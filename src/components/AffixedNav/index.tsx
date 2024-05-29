import { Anchor } from "antd";
import React from "react";
const { Link } = Anchor;

import styles from "./style.css";
import { DotChartOutlined, PictureOutlined, SyncOutlined } from "@ant-design/icons";
const offsetTop = 65;

const AffixedNav: React.SFC = () => {
    return (
        <Anchor offsetTop={offsetTop} showInkInFixed={true} className={styles.container}>
            <Link
                href="#main-plot"
                title={
                    <React.Fragment>
                        <DotChartOutlined />
                        <span> Plot </span>
                    </React.Fragment>
                }
            />
            <Link
                href="#gallery"
                title={
                    <React.Fragment>
                        <PictureOutlined />
                        <span> Gallery </span>
                    </React.Fragment>
                }
            />
            <Link
                href="#three-d-viewer"
                title={
                    <React.Fragment>
                        <SyncOutlined />
                        <span> 3D viewer </span>
                    </React.Fragment>
                }
            />
        </Anchor>
    );
};

export default AffixedNav;

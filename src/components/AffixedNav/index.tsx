import {
    Anchor,
    Icon,
} from "antd";
import React from "react";
const { Link } = Anchor;

const styles = require("./style.css");
const offsetTop = 65;

const AffixedNav: React.SFC = () => {

        return (
                <Anchor
                    offsetTop={offsetTop}
                    showInkInFixed={true}
                    className={styles.container}
                >
                    <Link
                        href="#main-plot"
                        title={(
                        <React.Fragment>
                            <Icon type="dot-chart"/>
                            <span> Plot </span>
                        </React.Fragment>
                    )}
                    />
                    <Link
                        href="#gallery"
                        title={(
                            <React.Fragment>
                                <Icon type="picture"/>
                                <span> Gallery </span>
                            </React.Fragment>)}
                    />
                    <Link
                        href="#three-d-viewer"
                        title={(
                        <React.Fragment>
                            <Icon type="sync"/>
                            <span> 3D viewer </span>
                        </React.Fragment>)}
                    />

                </Anchor>
        );
};

export default AffixedNav;

import {
    Anchor,
    Icon,
} from "antd";
import React from "react";
const { Link } = Anchor;

const AffixedNav: React.SFC = () => {

        return (
                <Anchor
                >
                    <Link
                        href="#main-plot"
                        title={(
                        <React.Fragment>
                            <span>Chart </span>
                            <Icon type="dot-chart"/>
                        </React.Fragment>
                    )}
                    />
                    <Link
                        href="#gallery"
                        title={(
                            <React.Fragment>
                                <span>Gallery </span>
                                <Icon type="Picture"/>
                            </React.Fragment>)}
                    />
                    <Link
                        href="#three-d-viewer"
                        title={(
                        <React.Fragment>
                            <span>3D viewer </span>
                            <Icon type="sync"/>
                        </React.Fragment>)}
                    />

                </Anchor>
        );
};

export default AffixedNav;

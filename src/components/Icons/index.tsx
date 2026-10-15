import React from "react";
import { LoadingOutlined } from "@ant-design/icons";

import AicsLogoWhite from "../../assets/images/allen-institute-cell-science-logo.svg";

export const Loading = <LoadingOutlined style={{ fontSize: 40 }} spin />;
export const AicsLogo = <img src={AicsLogoWhite} alt={"Allen Institute for Cell Science"} />;

export default {
    Loading,
};

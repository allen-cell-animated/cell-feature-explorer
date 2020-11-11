import React from "react";
import { Upload } from "antd";

import { Loading } from "../Icons";

const styles = require("./style.css");

interface ViewerOverlayTargetProps {
    isLoading: boolean;
}
const ViewerOverlayTarget = ({
    isLoading,
}: ViewerOverlayTargetProps): JSX.Element | null => {
 
    const loadingOverlay = (
        <div className={styles.container}>
            <p className="loading-icon">{Loading}</p>
            <p className="loading-text">Loading measured features for all cells</p>
        </div>
    );
 
    if (isLoading) {
        return loadingOverlay;
    } else {
        return null;
    }
};

export default ViewerOverlayTarget;

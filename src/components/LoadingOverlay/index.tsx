import React from "react";

import { Loading } from "../Icons";

const styles = require("./style.css");

interface ViewerOverlayTargetProps {
    isLoading: boolean;
}
const LoadingOverlay = ({
    isLoading,
}: ViewerOverlayTargetProps): JSX.Element | null => {
 
    const loadingOverlay = (
        <div className={styles.container}>
            <p className="loading-icon">{Loading}</p>
            <p className="loading-text">Loading data...</p>
        </div>
    );
 
    if (isLoading) {
        return loadingOverlay;
    } else {
        return null;
    }
};

export default LoadingOverlay;

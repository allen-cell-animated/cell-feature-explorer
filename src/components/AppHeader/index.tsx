import * as React from "react";


import { AicsLogo } from "../Icons";

const styles = require("./style.css");

interface AppHeaderProps {
    isBuffering: boolean;
}

class AppHeader extends React.Component<AppHeaderProps, {}> {
    public render(): JSX.Element {

        return (
            <div className={styles.pageHeader}>
                <div>
                    <a href="https://allencell.org" title="Allen Cell Explorer">
                        {AicsLogo}
                    </a>
                    <span className={styles.verticalBar}>|</span>
                    <a href="/" className={styles.cfeHome}>
                        Cell Feature Explorer Datasets
                    </a>
                </div>
                <div className={styles.viewerTitle}></div>
                <div className={styles.buttons}></div>
            </div>
        );
    }
}

export default AppHeader;
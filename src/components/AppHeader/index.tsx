import * as React from "react";

import { AicsLogo } from "../Icons";

import styles from "./style.css";

interface AppHeaderProps {
    selectedDataset: string;
}

class AppHeader extends React.Component<AppHeaderProps, {}> {
    public render(): JSX.Element {
        const { selectedDataset } = this.props;

        return (
            <div className={styles.pageHeader}>
                <div>
                    <a href="https://allencell.org" title="Allen Cell Explorer">
                        {AicsLogo}
                    </a>
                    <span className={styles.verticalBar}>|</span>
                    <a href="/" className={styles.cfeHome}>
                        Cell Feature Explorer
                    </a>
                </div>
                <div className={styles.viewerTitle}>{selectedDataset}</div>
                <div className={styles.buttons}></div>
            </div>
        );
    }
}

export default AppHeader;

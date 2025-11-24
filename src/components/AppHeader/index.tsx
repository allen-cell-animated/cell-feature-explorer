import { Row } from "antd";
import * as React from "react";

import { AicsLogo } from "../Icons";

import styles from "./style.css";
import CsvInput from "../../containers/CsvInput";

interface AppHeaderProps {
    selectedDataset: string;
}

class AppHeader extends React.Component<AppHeaderProps> {
    public render(): JSX.Element {
        const { selectedDataset } = this.props;

        return (
            <div className={styles.pageHeader}>
                <Row align={"middle"}>
                    <a
                        href="https://allencell.org"
                        title="Allen Institute for Cell Science"
                        style={{ height: "41px" }}
                    >
                        {AicsLogo}
                    </a>
                    <span className={styles.verticalBar}>|</span>
                    <a href="/" className={styles.cfeHome}>
                        Cell Feature Explorer
                    </a>
                </Row>
                <div className={styles.viewerTitle}>{selectedDataset}</div>
                <div className={styles.buttons}>
                    <CsvInput></CsvInput>
                </div>
            </div>
        );
    }
}

export default AppHeader;

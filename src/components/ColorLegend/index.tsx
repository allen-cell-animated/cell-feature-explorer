import { Badge } from "antd";
import React from "react";

import styles from "./style.css";

interface InteractiveRowProps {
    color: string;
    name: string;
    total: number;
}

export default class ColorLegendRow extends React.Component<InteractiveRowProps, {}> {
    constructor(props: InteractiveRowProps) {
        super(props);
    }

    public render() {
        const { color, name, total } = this.props;

        return (
            <div className={styles.container}>
                <div className={styles.firstColumn}>
                    <Badge
                        style={{
                            backgroundColor: color,
                            padding: 4,
                        }}
                        dot={true}
                    />
                    <span className={styles.label}>{name}</span>
                </div>
                <div>
                    <span className={styles.label}>{total}</span>
                </div>
            </div>
        );
    }
}

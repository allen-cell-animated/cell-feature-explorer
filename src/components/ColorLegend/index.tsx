import { Badge, Button } from "antd";
import React from "react";

import styles from "./style.css";
import ResettableColorPicker from "../ResettableColorPicker";

interface InteractiveRowProps {
    color: string;
    setColor: (color: string | undefined) => void;
    name: string;
    total: number;
}

export default class ColorLegendRow extends React.Component<InteractiveRowProps> {
    constructor(props: InteractiveRowProps) {
        super(props);
    }

    public render() {
        const { color, name, total } = this.props;

        return (
            <div className={styles.container}>
                <div className={styles.firstColumn}>
                    <ResettableColorPicker
                        value={color}
                        onChange={(color) => this.props.setColor(color.toHexString())}
                        onReset={() => this.props.setColor(undefined)}
                        disabledAlpha={true}
                        panelRender={(panel) => (
                            <div>
                                {panel}
                                <Button onClick={() => this.props.setColor(undefined)} size="small">
                                    Reset
                                </Button>
                            </div>
                        )}
                    >
                        <Badge
                            style={{
                                backgroundColor: color,
                                padding: 4,
                                cursor: "pointer",
                            }}
                            dot={true}
                        />
                    </ResettableColorPicker>
                    <span className={styles.label}>{name}</span>
                </div>
                <div>
                    <span className={styles.label}>{total}</span>
                </div>
            </div>
        );
    }
}

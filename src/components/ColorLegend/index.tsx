import { Badge, Button, ColorPicker } from "antd";
import React from "react";

import styles from "./style.css";

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
                    <ColorPicker
                        value={color}
                        onChange={(antColor) => {
                            const color = antColor.toHexString();
                            this.props.setColor(color);
                        }}
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
                    </ColorPicker>
                    <span className={styles.label}>{name}</span>
                </div>
                <div>
                    <span className={styles.label}>{total}</span>
                </div>
            </div>
        );
    }
}

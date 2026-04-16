import { Badge, Button } from "antd";
import React from "react";

import styles from "./style.css";
import ResettableColorPicker from "../ResettableColorPicker";
import { MISSING_CATEGORY_KEY, MISSING_CATEGORY_LABEL } from "../../state/selection/constants";

interface InteractiveRowProps {
    color: string;
    name: string;
    total: number;
    setColor?: (color: string | undefined) => void;
}

export default class ColorLegendRow extends React.Component<InteractiveRowProps> {
    constructor(props: InteractiveRowProps) {
        super(props);
    }

    public render() {
        const { color, name, total } = this.props;

        const showColorPicker = this.props.setColor !== undefined;

        return (
            <div className={styles.container}>
                <div className={styles.firstColumn}>
                    <ResettableColorPicker
                        value={color}
                        onChange={(color) => this.props.setColor?.(color.toHexString())}
                        onReset={() => this.props.setColor?.(undefined)}
                        disabledAlpha={true}
                        panelRender={(panel) => (
                            <div>
                                {panel}
                                <Button
                                    onClick={() => this.props.setColor?.(undefined)}
                                    size="small"
                                >
                                    Reset
                                </Button>
                            </div>
                        )}
                        disabled={!showColorPicker}
                    >
                        <Badge
                            style={{
                                backgroundColor: color,
                                padding: 4,
                                marginBottom: 2,
                                cursor: showColorPicker ? "pointer" : "default",
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

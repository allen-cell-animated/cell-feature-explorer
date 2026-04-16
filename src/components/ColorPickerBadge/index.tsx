import { Button, Badge } from "antd";
import React, { ReactElement } from "react";
import ResettableColorPicker from "../ResettableColorPicker";

type ColorPickerBadgeProps = {
    color: string;
    setColor?: (color: string | undefined) => void;
    name: string;
};

export default function ColorPickerBadge(props: ColorPickerBadgeProps): ReactElement {
    const { color, setColor, name } = props;
    const showColorPicker = setColor !== undefined;

    return (
        <ResettableColorPicker
            value={color}
            onChange={(color) => setColor?.(color.toHexString())}
            onReset={() => setColor?.(undefined)}
            disabledAlpha={true}
            panelRender={(panel) => (
                <div>
                    {panel}
                    <Button onClick={() => setColor?.(undefined)} size="small">
                        Reset
                    </Button>
                </div>
            )}
            disabled={!showColorPicker}
        >
            <button
                style={{
                    background: "none",
                    border: "none",
                    padding: 0,
                    margin: 0,
                    cursor: showColorPicker ? "pointer" : "default",
                }}
                disabled={!showColorPicker}
                aria-label={`Change color for option ${name}`}
            >
                <Badge
                    style={{
                        backgroundColor: color,
                        padding: 4,
                        marginBottom: 2,
                    }}
                    dot={true}
                />
            </button>
        </ResettableColorPicker>
    );
}

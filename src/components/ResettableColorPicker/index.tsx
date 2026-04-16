import { Button, ColorPicker, ColorPickerProps, Tooltip } from "antd";
import React, { PropsWithChildren, ReactElement } from "react";

import styles from "./styles.css";
import { UndoOutlined } from "@ant-design/icons";

type ResettableColorPickerProps = ColorPickerProps & {
    onReset: () => void;
};

export default function ResettableColorPicker(
    props: PropsWithChildren<ResettableColorPickerProps>
): ReactElement {
    const { onReset, children, ...colorPickerProps } = props;
    const containerRef = React.createRef<HTMLDivElement>();

    const panelRender = (panel: React.ReactNode) => (
        <div>
            {panel}
            <Tooltip
                title="Reset to default"
                trigger={["focus", "hover"]}
                // Ensure the tooltip appears above the color picker popup
                zIndex={100_000}
                placement="right"
            >
                <Button
                    onClick={onReset}
                    size="small"
                    className={styles.resetButton}
                    type="text"
                    aria-label="Reset to default color"
                >
                    <UndoOutlined />
                </Button>
            </Tooltip>
        </div>
    );

    return (
        <div
            ref={containerRef}
            className={styles.colorPickerContainer}
            style={{ width: "fit-content", height: "fit-content" }}
        >
            <ColorPicker
                {...colorPickerProps}
                className="potato"
                getPopupContainer={() => containerRef.current || document.body}
                panelRender={panelRender}
            >
                {children}
            </ColorPicker>
        </div>
    );
}

import { Button, ColorPicker, ColorPickerProps } from "antd";
import React, { PropsWithChildren, ReactElement } from "react";

import styles from "./styles.css";

type ResettableColorPickerProps = ColorPickerProps & {
    onReset: () => void;
};

export default function ResettableColorPicker(
    props: PropsWithChildren<ResettableColorPickerProps>
): ReactElement {
    const containerRef = React.createRef<HTMLDivElement>();

    const panelRender = (panel: React.ReactNode) => (
        <div>
            {panel}
            <Button onClick={props.onReset} size="small" className={styles.resetButton}>
                Reset
            </Button>
        </div>
    );

    return (
        <div
            ref={containerRef}
            className={styles.colorPickerContainer}
            style={{ display: "inline-block" }}
        >
            <ColorPicker
                {...props}
                className="potato"
                getPopupContainer={() => containerRef.current || document.body}
                panelRender={panelRender}
            >
                {props.children}
            </ColorPicker>
        </div>
    );
}

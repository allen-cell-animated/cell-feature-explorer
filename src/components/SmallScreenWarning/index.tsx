import { Button, Checkbox, Modal } from "antd";
import { CheckboxChangeEvent } from "antd/es/checkbox";
import React from "react";

const styles = require("./style.css");

interface SmallScreenWarningProps {
    handleClose: () => void;
    onDismissCheckboxChecked: (value: boolean) => void;
    visible: boolean;
}

const SmallScreenWarning: React.SFC<SmallScreenWarningProps> = ({ visible, handleClose, onDismissCheckboxChecked }) => {
    const onCheckboxChange = ({ target }: CheckboxChangeEvent) => onDismissCheckboxChecked(target.checked);
    return (
        <Modal
            centered={true}
            title="Small Screen Warning"
            visible={visible}
            onOk={handleClose}
            onCancel={handleClose}
            footer={null}
            maskStyle={{
                background: "#000000d9",
            }}
            bodyStyle={{
                backgroundColor: "#d8d8d8",
                color: "#0a0a0a",
            }}
        >
            <p>Many features of this web tool are hidden while using it on a small screen.</p>
            <p>
                To access all features, including a tool to plot measurements for over 30,000 cells,{" "}
                please visit this web page on a larger screen.
            </p>
            <div className={styles.checkboxContainer}>
                <Checkbox onChange={onCheckboxChange}>Don&apos;t show this message again.</Checkbox>
            </div>
            <div className={styles.buttonContainer}>
                <Button className={styles.okButton} onClick={handleClose}>OK</Button>
            </div>
        </Modal>
    );
};

export default SmallScreenWarning;

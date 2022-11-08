import { Radio } from "antd";
import React from "react";
import { createPortal } from "react-dom";

type AlignControlProps = {
    parent: HTMLElement;
    aligned: boolean;
    setAligned: (aligned: boolean) => void;
};

const AlignControl: React.FC<AlignControlProps> = ({ aligned, setAligned, parent }) =>
    createPortal(
        <span className="viewer-toolbar-left viewer-toolbar-group">
            <span>Aligned:</span>
            <Radio.Group value={aligned} onChange={({ target }) => setAligned(target.value)}>
                <Radio.Button key={0} value={false}>
                    Off
                </Radio.Button>
                <Radio.Button key={1} value={true}>
                    On
                </Radio.Button>
            </Radio.Group>
        </span>,
        parent
    );

export default AlignControl;

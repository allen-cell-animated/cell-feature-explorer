import { InfoCircleOutlined } from "@ant-design/icons";
import { Radio, Tooltip } from "antd";
import React from "react";
import { createPortal } from "react-dom";

const infoText = `\
For the associated publication, single cell images were aligned before feature extraction. The \
apical basal axis of the cell (which is the z-axis in the lab frame of reference) was preserved \
and we aligned the cells by rotation in the xy-plane. Cells and nuclei are rotated such that the \
longest cell axis falls along the x-axis.\
`;

type AlignControlProps = {
    parent: HTMLElement;
    aligned: boolean;
    setAligned: (aligned: boolean) => void;
};

const AlignControl: React.FC<AlignControlProps> = ({ aligned, setAligned, parent }) =>
    createPortal(
        <span className="viewer-toolbar-left">
            <span className="viewer-toolbar-group">
                <span>Alignment</span>
                <Tooltip title={infoText} placement="bottom">
                    <InfoCircleOutlined />
                </Tooltip>
            </span>
            <span className="viewer-toolbar-group">
                <Radio.Group value={aligned} onChange={({ target }) => setAligned(target.value)}>
                    <Tooltip title="Turn on alignment" placement="bottom">
                        <Radio.Button key={0} value={false}>
                            Off
                        </Radio.Button>
                    </Tooltip>
                    <Tooltip title="Turn off alignment" placement="bottom">
                        <Radio.Button key={1} value={true}>
                            On
                        </Radio.Button>
                    </Tooltip>
                </Radio.Group>
            </span>
        </span>,
        parent
    );

export default AlignControl;

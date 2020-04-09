import React from 'react';
import { Modal } from 'antd';

interface SmallScreenWarningProps {
    handleOk: () => void;
    visible: boolean;
}

const SmallScreenWarning: React.SFC<SmallScreenWarningProps> = ({ visible, handleOk }) => {

    console.log('visible', visible);
    return (<Modal
        centered
        title="Small Screen Warning"
        visible={visible}
        onOk={handleOk}
    >
        <p>Many features of this web tool are hidden while using it on a small screen.</p>
        <p>To access all features, including a tool to plot measurements for over 30,000 cells, please visit this web page on a larger screen.
</p>
    </Modal>)
}

export default SmallScreenWarning;
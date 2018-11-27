import {
    Badge,
    Button,
    Checkbox,
} from "antd";
import React from "react";

import "antd/lib/badge/style";
import { CheckboxChangeEvent } from "antd/lib/checkbox";
import "antd/lib/checkbox/style";
import "antd/lib/progress/style";

const styles = require("./style.css");

interface InteractiveRowProps {
    percent: number;
    color: string;
    id: string;
    name: string | number;
    total: number;
    closeable?: boolean;
    hideable?: boolean;
    onBarClicked?: (clickEvent: CheckboxChangeEvent) => void;
    handleClose?: (id: number | string) => void;
}

export default class InteractiveRow extends React.Component<InteractiveRowProps, {}> {
    private static defaultProps = {
        closeable: false,
        hideable: true,
    };
    constructor(props: InteractiveRowProps) {
        super(props);
        this.onClose = this.onClose.bind(this);
    }
    public onClose(event: any ) {
        const {
            handleClose,
        } = this.props;
        if (event.target && event.target.id && handleClose) {
            handleClose(event.target.id);
        }
    }

    public render() {
        const {
            closeable,
            hideable,
            percent,
            id,
            color,
            name,
            total,
            onBarClicked,
        } = this.props;
        return (
            <div
                className={styles.container}
            >
                {hideable &&
                    <Checkbox
                        onChange={onBarClicked}
                        value={id}
                        defaultChecked={true}
                    />
                }
                <span className={styles.label}>
                        {name}
                    </span>
                <span className={styles.label}>{total}</span>

                <Badge
                    style={{backgroundColor: color}}
                    dot={true}
                />

                {closeable &&
                    <Button
                        size="small"
                        icon="close"
                        id={id}
                        ghost={true}
                        onClick={this.onClose}
                    />
                }
            </div>
        );
    }
}

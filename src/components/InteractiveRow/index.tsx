import {
    Badge,
    Button,
    Checkbox,
} from "antd";
import React from "react";

import { CheckboxChangeEvent } from "antd/lib/checkbox";

const styles = require("./style.css");

interface InteractiveRowProps {
    color: string;
    id: string;
    name: string | number;
    total: number;
    checked: boolean;
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
            id,
            color,
            name,
            total,
            onBarClicked,
            checked,
        } = this.props;
        return (
            <div
                className={styles.container}
            >
                <div>
                {hideable &&
                    <Checkbox
                        onChange={onBarClicked}
                        value={id}
                        defaultChecked={true}
                        checked={checked}
                    />
                }
                    <Badge
                        style={{
                            backgroundColor: color,
                            padding: 4,
                        }}
                        dot={true}
                    />
                    <span className={styles.label}>{name}</span>

                </div>
                <div>

                    <span className={styles.label}>{total}</span>
                </div>
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

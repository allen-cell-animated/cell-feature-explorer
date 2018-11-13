import {
    Button,
    Checkbox,
    Progress,
} from "antd";
import React from "react";

import { CheckboxChangeEvent } from "antd/lib/checkbox";
import "antd/lib/checkbox/style";
import "antd/lib/progress/style";

const styles = require("./style.css");

interface InteractiveRowProps {
    closeable: boolean;
    percent: number;
    color: string;
    id: string;
    name: string | number;
    total: number;
    onBarClicked?: (clickEvent: CheckboxChangeEvent) => void;
    handleCloseSelectionSet?: (id: number | string) => void;
}

export default class InteractiveRow extends React.Component<InteractiveRowProps, {}> {
    constructor(props: InteractiveRowProps) {
        super(props);
        this.onClose = this.onClose.bind(this);
    }
    public onClose(event: any ) {
        const {
            handleCloseSelectionSet,
        } = this.props;
        if (event.target && event.target.id && handleCloseSelectionSet) {
            handleCloseSelectionSet(event.target.id);
        }
    }

    public render() {
        const {
            closeable,
            percent,
            id,
            color,
            name,
            total,
            onBarClicked,
        } = this.props;
        const format = () => total.toString();
        return (
            <div
                className={styles.container}
            >
                {closeable ? null :
                    <Checkbox
                        onChange={onBarClicked}
                        value={id}
                        defaultChecked={true}
                    />
                }

                <span className={styles.label}>
                    {name}
                </span>
                <Progress
                    percent={percent}
                    strokeColor={color}
                    format={format}
                />
                {closeable ?
                    (
                        <Button
                            size="small"
                            icon="close"
                            id={id}
                            ghost={true}
                            onClick={this.onClose}
                        />
                    ) : null
                }
            </div>
        );
    }
}

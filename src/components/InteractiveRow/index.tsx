import {
    Badge,
    Button,
    Checkbox,
    Dropdown,
    Icon,
    Menu,
} from "antd";
import { CheckboxChangeEvent } from "antd/lib/checkbox";
import React from "react";

const styles = require("./style.css");

interface InteractiveRowProps {
    color: string;
    id: string;
    name: string;
    total: number;
    checked?: boolean;
    closeable?: boolean;
    hideable?: boolean;
    onBarClicked?: (clickEvent: CheckboxChangeEvent) => void;
    handleClose?: (id: number | string) => void;
    handleDownload: (id: string) => void;
}

export default class InteractiveRow extends React.Component<InteractiveRowProps, {}> {
    private static defaultProps = {
        closeable: false,
        hideable: true,
    };
    constructor(props: InteractiveRowProps) {
        super(props);
        this.onClose = this.onClose.bind(this);
        this.onDownload = this.onDownload.bind(this);
        this.renderMenu = this.renderMenu.bind(this);
    }

    public onClose(event: any ) {
        const {
            handleClose,
        } = this.props;
        if (event.target && event.target.id && handleClose) {
            handleClose(event.target.id);
        }
    }

    public onDownload(event: any ) {
        const {
            handleDownload,
        } = this.props;
        if (event.target && event.target.id && handleDownload) {
            handleDownload(event.target.id);
        }
    }

    public renderMenu() {
        const { downloadAllUrl } = this.props;
        if (downloadAllUrl) {
            return(
                <Menu>
                    <Menu.Item>
                        <a target="_blank" href={downloadAllUrl} >download all data </a>
                    </Menu.Item>

                </Menu>
            );
        }
        return null;
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
            downloadAllUrl
        } = this.props;
        console.log(downloadAllUrl)
        const menu =  (
            <Menu>
                <Menu.Item>
                    <a target="_blank" href={downloadAllUrl}> Download data </a>
                </Menu.Item>

            </Menu>
        )
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
                <Dropdown overlay={menu}  trigger={['click']}>
                    <Button className="ant-dropdown-link" id={id} onClick={this.onDownload}>
                        <Icon type="download" />
                    </Button>
                </Dropdown>
                {closeable &&
                    <Button
                        icon="close"
                        size="small"
                        id={id}
                        ghost={true}
                        onClick={this.onClose}
                    />
                }
            </div>
        );
    }
}

import {
    Badge,
    Button,
    Checkbox,
    Dropdown,
    Icon,
    Menu,
} from "antd";
import { CheckboxChangeEvent } from "antd/es/checkbox";
import { ClickParam } from "antd/es/menu";
import { includes, uniq } from "lodash";
import React, { MouseEvent } from "react";

import { DownloadConfig } from "../../state/selection/types";

const styles = require("./style.css");

interface InteractiveRowProps {
    color: string;
    id: string;
    name: string;
    total: number;
    checked?: boolean;
    closeable?: boolean;
    downloadConfig: DownloadConfig;
    downloadUrls: string[];
    hideable?: boolean;
    onBarClicked?: (clickEvent: CheckboxChangeEvent) => void;
    handleClose?: (id: number | string) => void;
    handleDownload: (id: string) => void;
}

interface AlreadyDownloaded {
    [key: string]: string[];
}

interface InteractiveRowState {
    downloadMenuVisible: boolean;
    alreadyDownloaded: AlreadyDownloaded;
}

export default class InteractiveRow extends React.Component<InteractiveRowProps, InteractiveRowState> {
    private static defaultProps = {
        closeable: false,
        downloadUrls: [],
        hideable: true,
    };
    constructor(props: InteractiveRowProps) {
        super(props);
        this.onClose = this.onClose.bind(this);
        this.onDownload = this.onDownload.bind(this);
        this.saveDownloadUrl = this.saveDownloadUrl.bind(this);
        this.handleMenuClick = this.handleMenuClick.bind(this);
        this.handleDownloadMenuVisibleChange = this.handleDownloadMenuVisibleChange.bind(this);

        this.state = {
            alreadyDownloaded: localStorage.getItem("alreadyDownloaded") ?
                JSON.parse(localStorage.getItem("alreadyDownloaded") as string) : {},
            downloadMenuVisible: false,
        };
    }

    public onClose({ currentTarget }: React.MouseEvent<HTMLButtonElement>) {
        const {
            handleClose,
        } = this.props;
        if (currentTarget && currentTarget.id && handleClose) {
            handleClose(currentTarget.id);
        }
    }

    public onDownload({ currentTarget }: React.MouseEvent<HTMLButtonElement>) {
        const {
            handleDownload,
        } = this.props;
        if (currentTarget && currentTarget.id && handleDownload) {
            handleDownload(currentTarget.id);
        }
    }

    public saveDownloadUrl(clickedLink: ClickParam) {
        const { downloadConfig } = this.props;
        const { alreadyDownloaded } = this.state;
        const thisAlreadyDownloaded = alreadyDownloaded[downloadConfig.key];
        if (thisAlreadyDownloaded) {
            this.setState({
                alreadyDownloaded: {
                    ...alreadyDownloaded,
                    [downloadConfig.key]: uniq([...thisAlreadyDownloaded, clickedLink.key]),
                    },
            });
        } else {
            this.setState({
                alreadyDownloaded: {
                    ...alreadyDownloaded,
                    [downloadConfig.key] : [clickedLink.key],
                },
            });
        }

    }
    public handleDownloadMenuVisibleChange(flag?: boolean) {
        localStorage.setItem("alreadyDownloaded", JSON.stringify( this.state.alreadyDownloaded));
        this.setState({ downloadMenuVisible: !!flag }); // for typescript, to convert undefined to false
    }

    public handleMenuClick() {
        const { downloadUrls, downloadConfig } = this.props;
        const alreadyDownloaded = this.state.alreadyDownloaded[downloadConfig.key];
        // if they've already downloaded the set, or are clicking on the last link, close the menu
        // otherwise leave it open to make it easy to download the set.
        if (alreadyDownloaded.length === downloadUrls.length) {
            this.setState({downloadMenuVisible: false});
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
            downloadUrls,
            downloadConfig,
        } = this.props;
        const alreadyDownloaded = this.state.alreadyDownloaded[downloadConfig.key];
        const menu = (
            <Menu onClick={this.handleMenuClick}>
                {downloadUrls.map((url, index) =>
                     (<Menu.Item key={index} onClick={this.saveDownloadUrl}>
                         {includes(alreadyDownloaded, index.toString()) ?
                             <Icon type="check" /> :  <Icon type="download" />}
                             <a target="_blank" href={url}> data chunk {index + 1} </a>
                    </Menu.Item>)
                )}

            </Menu>
        );
        return (
            <div
                className={styles.container}
            >
                <div className={styles.firstColumn}>
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
                    <Dropdown
                        overlay={menu}
                        trigger={["click"]}
                        onVisibleChange={this.handleDownloadMenuVisibleChange}
                        visible={this.state.downloadMenuVisible}
                    >
                        <Button
                            size="small"
                            className="ant-dropdown-link"
                            id={id}
                            onClick={this.onDownload}
                        >
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
            </div>
        );
    }
}

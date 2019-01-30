import {
    Button,
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

interface DownloadDropDownMenuProps {
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

interface DownloadDropDownMenuState {
    downloadMenuVisible: boolean;
    alreadyDownloaded: AlreadyDownloaded;
}

const LOCAL_STORAGE_KEY = "alreadyDownloaded";

export default class DownloadDropDownMenu extends React.Component<DownloadDropDownMenuProps,
    DownloadDropDownMenuState> {
    private static defaultProps = {
        closeable: false,
        downloadUrls: [],
        hideable: true,
    };
    constructor(props: DownloadDropDownMenuProps) {
        super(props);
        this.onClose = this.onClose.bind(this);
        this.onDownload = this.onDownload.bind(this);
        this.saveDownloadUrl = this.saveDownloadUrl.bind(this);
        this.handleMenuClick = this.handleMenuClick.bind(this);
        this.handleDownloadMenuVisibleChange = this.handleDownloadMenuVisibleChange.bind(this);

        this.state = {
            alreadyDownloaded: localStorage.getItem(LOCAL_STORAGE_KEY) ?
                JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) as string) : {},
            downloadMenuVisible: false,
        };
    }

    public onClose({ currentTarget }: MouseEvent<HTMLButtonElement>) {
        const {
            handleClose,
        } = this.props;
        if (currentTarget && currentTarget.id && handleClose) {
            handleClose(currentTarget.id);
        }
    }

    public onDownload({ currentTarget }: MouseEvent<HTMLButtonElement>) {
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
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify( this.state.alreadyDownloaded));
        this.setState({ downloadMenuVisible: !!flag }); // for typescript, to convert undefined to false
    }

    public handleMenuClick() {
        const { downloadUrls, downloadConfig } = this.props;
        const alreadyDownloaded = this.state.alreadyDownloaded[downloadConfig.key];
        // if they've already downloaded the set, or are clicking on the last link, close the menu
        // otherwise leave it open to make it easy to download the set.
        if (alreadyDownloaded && alreadyDownloaded.length === downloadUrls.length) {
            this.setState({downloadMenuVisible: false});
        }
    }

    public render() {
        const {
            id,
            downloadUrls,
            downloadConfig,
        } = this.props;
        const alreadyDownloaded = this.state.alreadyDownloaded[downloadConfig.key];
        const menu = (
            <Menu
                className={styles.menu}
                onClick={this.handleMenuClick}
            >
                {downloadUrls.map((url, index) =>
                    (<Menu.Item key={index} onClick={this.saveDownloadUrl}>
                        {includes(alreadyDownloaded, index.toString()) ?
                            <Icon type="check" /> :  <Icon type="download" />}
                        <a href={url}> data chunk {index + 1} </a>
                    </Menu.Item>)
                )}

            </Menu>
        );
        return (
            <div
                className={styles.container}
            >
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
            </div>
        );
    }
}

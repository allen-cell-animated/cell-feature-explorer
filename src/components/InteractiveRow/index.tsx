import {
    Badge,
    Button,
    Checkbox,
    Tooltip,
} from "antd";
import { CheckboxChangeEvent } from "antd/es/checkbox";
import React, { MouseEvent } from "react";

import { DownloadConfig } from "../../state/selection/types";
import DownloadDropDownMenu from "../DownloadDropDownMenu";

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

export default class InteractiveRow extends React.Component<InteractiveRowProps, {}> {
    private static defaultProps = {
        closeable: false,
        downloadUrls: [],
        hideable: true,
    };
    constructor(props: InteractiveRowProps) {
        super(props);
        this.onClose = this.onClose.bind(this);
    }

    public onClose({ currentTarget }: MouseEvent<HTMLButtonElement>) {
        const {
            handleClose,
        } = this.props;
        if (currentTarget && currentTarget.id && handleClose) {
            handleClose(currentTarget.id);
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
            handleDownload,
        } = this.props;

        const tooltip = () => {
            return (
                <div>
                    Protein: {id}<br/>
                    Gene:
                </div>
            )
        }

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
                    <Tooltip placement="rightTop" title={tooltip}>
                        <span className={styles.label}>{name}</span>
                    </Tooltip>

                </div>
                <div>
                    <span className={styles.label}>{total}</span>
                    <DownloadDropDownMenu
                        color={color}
                        id={id}
                        name={name}
                        total={total}
                        downloadConfig={downloadConfig}
                        downloadUrls={downloadUrls}
                        handleDownload={handleDownload}
                    />
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

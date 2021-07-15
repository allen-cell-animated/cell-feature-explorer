import {
    Badge,
    Button,
    Checkbox,
    Tooltip,
} from "antd";
import { CheckboxChangeEvent } from "antd/es/checkbox";
import React, { MouseEvent } from "react";

import { PanelData } from "../../containers/ColorByMenu/types";
import { DownloadConfig } from "../../state/selection/types";
import DownloadDropDownMenu from "../DownloadDropDownMenu";

const styles = require("./style.css");

interface InteractiveRowProps {
    item: PanelData;
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
            item,
            onBarClicked,
            downloadUrls,
            downloadConfig,
            handleDownload,
        } = this.props;

        const { id, checked, color, name, total, gene} = item;

        const tooltip = (
            <div>
                Protein: {id}<br/>
                Gene: {gene}
            </div>
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
                    {gene ? (
                        <Tooltip placement="right" title={tooltip}>
                            <span className={styles.label}>{name}</span>
                        </Tooltip>
                    ) : (
                        <span className={styles.label}>{name}</span>
                    )}
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

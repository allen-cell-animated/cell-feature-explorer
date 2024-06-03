import { Avatar, Button, Card, Dropdown, List, Menu, Tooltip } from "antd";
import React from "react";

import { DeselectPointAction, SelectPointAction } from "../../state/selection/types";
import { NO_DOWNLOADS_TOOLTIP } from "../../constants";

import styles from "./style.css";
import { CloseOutlined, DownloadOutlined } from "@ant-design/icons";

interface GalleryCardProps {
    category: string;
    src: string;
    selected: boolean;
    downloadHref: string;
    cellID: string;
    mitoticStage?: string;
    handleDeselectPoint: (payload: string) => DeselectPointAction;
    handleOpenIn3D: (payload: { id: string }) => SelectPointAction;
    empty?: boolean;
    onMouseEnter: (target: React.MouseEvent<HTMLElement>) => void;
    onMouseLeave: (target: React.MouseEvent<HTMLElement>) => void;
    downloadFullField: string;
}

const GalleryCard: React.SFC<GalleryCardProps> = (props) => {
    const deselectPoint = () => {
        props.handleDeselectPoint(props.cellID);
    };

    const openCellIn3D = () => {
        props.handleOpenIn3D({ id: props.cellID });
    };
    const menu = (
        <Menu className="download-dropdown">
            {props.downloadHref && (
                <Menu.Item key="1">
                    <a href={props.downloadHref}>
                        <DownloadOutlined /> Segmented cell
                    </a>
                </Menu.Item>
            )}
            {props.downloadFullField && (
                <Menu.Item key="2">
                    <a href={props.downloadFullField}>
                        <DownloadOutlined /> Full field image
                    </a>
                </Menu.Item>
            )}
        </Menu>
    );
    const hasDownload = props.downloadHref !== "" || props.downloadFullField !== "";
    const actions = [
        <Button
            className={props.selected ? styles.disabled : ""}
            key={`${props.cellID}-load`}
            onClick={openCellIn3D}
        >
            3D
        </Button>,
        <Tooltip key={`${props.cellID}-download`} title={hasDownload ? null : NO_DOWNLOADS_TOOLTIP}>
            <Dropdown overlay={menu} trigger={["click"]}>
                <Button>
                    <DownloadOutlined />
                </Button>
            </Dropdown>
        </Tooltip>,
        <Button onClick={deselectPoint} key={`${props.cellID}-close`}>
            <CloseOutlined />
        </Button>,
    ];

    return (
        <List.Item
            key={props.cellID}
            className={styles.container}
            {...{
                // props not in ant.d component, but do exist
                id: props.cellID ? props.cellID.toString() : "",
                onMouseEnter: props.onMouseEnter,
                onMouseLeave: props.onMouseLeave,
            }}
        >
            <Card bordered={true}>
                <Card.Meta
                    title={props.category}
                    avatar={
                        props.src && (
                            <div onClick={openCellIn3D}>
                                <Avatar
                                    className={props.selected ? styles.selected : undefined}
                                    alt="thumbnail of microscopy image"
                                    src={props.src}
                                />
                            </div>
                        )
                    }
                    description={
                        <div style={{ display: "flex", flexDirection: "column" }}>
                            {props.cellID}

                            {props.mitoticStage && (
                                <span className={styles.stage}>{props.mitoticStage}</span>
                            )}
                            {!props.empty && <div className={styles.actionList}>{actions}</div>}
                        </div>
                    }
                />
            </Card>
        </List.Item>
    );
};

export default GalleryCard;

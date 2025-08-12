import { CloseOutlined, DownloadOutlined } from "@ant-design/icons";
import { Button, Card, Divider, Dropdown, List, Tooltip } from "antd";
import { ItemType } from "antd/es/menu/interface";
import React from "react";

import { DeselectPointAction, SelectPointAction } from "../../state/selection/types";
import { NO_DOWNLOADS_TOOLTIP } from "../../constants";

import styles from "./style.css";

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
    size: number;
}

const GalleryCard: React.FC<GalleryCardProps> = (props) => {
    const deselectPoint = () => {
        props.handleDeselectPoint(props.cellID);
    };

    const openCellIn3D = () => {
        props.handleOpenIn3D({ id: props.cellID });
    };

    const menuItems: ItemType[] = [];
    if (props.downloadHref) {
        menuItems.push({
            key: "1",
            label: (
                <a href={props.downloadHref}>
                    <DownloadOutlined /> Segmented cell
                </a>
            ),
        });
    }
    if (props.downloadFullField) {
        menuItems.push({
            key: "2",
            label: (
                <a href={props.downloadFullField}>
                    <DownloadOutlined /> Full field image
                </a>
            ),
        });
    }

    const hasDownload = props.downloadHref !== "" || props.downloadFullField !== "";
    const actions = [
        <Button key={`${props.cellID}-load`} onClick={openCellIn3D}>
            3D
        </Button>,
        <Divider key={`${props.cellID}-0`} type="vertical" />,
        <Dropdown
            key={`${props.cellID}-download`}
            menu={{ items: menuItems }}
            trigger={["click"]}
            disabled={!hasDownload}
        >
            <Tooltip
                key={`${props.cellID}-download`}
                title={hasDownload ? null : NO_DOWNLOADS_TOOLTIP}
                trigger={["hover", "focus"]}
            >
                <Button disabled={!hasDownload}>
                    <DownloadOutlined />
                </Button>
            </Tooltip>
        </Dropdown>,
        <Divider key={`${props.cellID}-1`} type="vertical" />,

        <Button key={`${props.cellID}-close`} onClick={deselectPoint}>
            <CloseOutlined />
        </Button>,
    ];

    return (
        <List.Item
            key={props.cellID}
            className={styles.container}
            style={{ width: props.size }}
            {...{
                // props not in ant.d component, but do exist
                id: props.cellID ? props.cellID.toString() : "",
                onMouseEnter: props.onMouseEnter,
                onMouseLeave: props.onMouseLeave,
            }}
        >
            <Card
                cover={
                    props.src && (
                        <img
                            alt="thumbnail of microscopy image"
                            src={props.src}
                            className={props.selected ? styles.selected : undefined}
                            onClick={openCellIn3D}
                        />
                    )
                }
            >
                <Card.Meta
                    title={props.category}
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

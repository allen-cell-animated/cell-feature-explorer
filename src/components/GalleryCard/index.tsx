import {
    CloseOutlined,
    DownloadOutlined,
    FileImageOutlined,
    PictureOutlined,
} from "@ant-design/icons";
import { Button, Card, Divider, Dropdown, Flex, List, Tooltip } from "antd";
import { ItemType } from "antd/es/menu/interface";
import React, { useEffect, useState } from "react";
import classNames from "classnames";

import { DeselectPointAction, SelectPointAction } from "../../state/selection/types";
import { NO_DOWNLOADS_TOOLTIP } from "../../constants";

import styles from "./style.css";
import * as zarr from "zarrita";
// @ts-ignore
import { renderThumbnail } from "ome-zarr.js";

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

async function createThumbnailImageSrc(src: string): Promise<string> {
    const store = new zarr.FetchStore(src);
    const url = await renderThumbnail(store);
    return url;
}

const GalleryCard: React.FC<GalleryCardProps> = (props) => {
    const [imageSrc, setImageSrc] = useState(props.src);
    useEffect(() => {
        if (!props.src) {
            // Asynchronously load + set image source
            // createThumbnailImageSrc(
            //     // Example image data
            //     "https://s3.us-west-2.amazonaws.com/production.files.allencell.org/016/f42/efc/798/669/f4a/14d/073/6c8/533/d2/3500007213_20250321_20X_timelapse-01(P66-C5).ome.zarr"
            // ).then((src) => {
            //     setImageSrc(src);
            // });
        } else {
            setImageSrc(props.src);
        }
    }, [props.src]);

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
                className={props.selected ? styles.selected : styles.unselected}
                loading={props.empty}
                cover={
                    imageSrc ? (
                        <img
                            alt="thumbnail of microscopy image"
                            src={imageSrc}
                            onClick={openCellIn3D}
                            width={props.size}
                            height={props.size}
                        />
                    ) : (
                        <Flex
                            style={{
                                display: "flex",
                                width: props.size,
                                height: props.size,
                                fontSize: props.size / 3,
                                // TODO: Use a UI dark grey
                                background: "#000",
                            }}
                            align="center"
                            justify="center"
                            // TODO: Make this an unstyled button and not a div
                            onClick={openCellIn3D}
                        >
                            <span>
                                <PictureOutlined />
                            </span>
                        </Flex>
                    )
                }
            >
                <Card.Meta
                    className={classNames({ [styles.small]: props.size < 170 })}
                    title={props.category}
                    description={
                        <Flex vertical justify="space-between">
                            <Flex vertical>
                                <span>{props.cellID}</span>
                                <span style={{ minHeight: "1.5em" }}>
                                    {props.mitoticStage && (
                                        <span className={styles.stage}>{props.mitoticStage}</span>
                                    )}
                                </span>
                            </Flex>
                            {!props.empty && <div className={styles.actionList}>{actions}</div>}
                        </Flex>
                    }
                />
            </Card>
        </List.Item>
    );
};

export default GalleryCard;

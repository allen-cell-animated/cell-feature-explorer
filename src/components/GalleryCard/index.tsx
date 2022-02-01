import { Avatar, Button, Card, Dropdown, List, Menu } from "antd";
import { DownloadOutlined, CloseOutlined } from "@ant-design/icons";
import React from "react";

import { DeselectPointAction, SelectCellIn3DAction } from "../../state/selection/types";

import styles from "./style.css";

interface GalleryCardProps {
    labeledStructure: string;
    src: string;
    selected: boolean;
    downloadHref: string;
    cellID: string;
    mitoticStage?: string;
    handleDeselectPoint: (payload: string) => DeselectPointAction;
    handleOpenIn3D: (payload: string) => SelectCellIn3DAction;
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
        props.handleOpenIn3D(props.cellID);
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

    const actions = [
        <Button
            className={props.selected ? styles.disabled : ""}
            key={`${props.cellID}-load`}
            onClick={openCellIn3D}
        >
            3D
        </Button>,
        <Dropdown key={`${props.cellID}-download`} overlay={menu} trigger={["click"]}>
            <Button icon={<DownloadOutlined/>} />
        </Dropdown>,
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
                    title={props.labeledStructure}
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
                    description={props.cellID}
                />
                {props.mitoticStage && <span className={styles.stage}>{props.mitoticStage}</span>}
                {!props.empty && <div className={styles.actionList}>{actions}</div>}
            </Card>
        </List.Item>
    );
};

export default GalleryCard;

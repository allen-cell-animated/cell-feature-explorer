import { PictureOutlined } from "@ant-design/icons";
import { Avatar, List } from "antd";
import React from "react";
import classNames from "classnames";

import { DeselectPointAction, SelectPointAction } from "../../state/selection/types";

import styles from "./style.css";

interface GalleryCardProps {
    category: string;
    src: string;
    selected: boolean;
    downloadHref: string;
    cellID: string;
    handleDeselectPoint: (payload: string) => DeselectPointAction;
    handleOpenIn3D: (payload: { id: string }) => SelectPointAction;
    empty?: boolean;
    onMouseEnter: (target: React.MouseEvent<HTMLElement>) => void;
    onMouseLeave: (target: React.MouseEvent<HTMLElement>) => void;
}

const MinGalleryCard: React.FC<GalleryCardProps> = (props) => {
    const openCellin3D = () => {
        props.handleOpenIn3D({ id: props.cellID });
    };

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
            <List.Item.Meta
                avatar={
                    <div onClick={openCellin3D}>
                        <Avatar
                            className={classNames(
                                { [styles.selected]: props.selected },
                                styles.avatar
                            )}
                            alt="thumbnail of microscopy image"
                            src={props.src}
                            icon={<PictureOutlined className={styles.placeholderAvatar} />}
                        />
                    </div>
                }
            />
        </List.Item>
    );
};

export default MinGalleryCard;

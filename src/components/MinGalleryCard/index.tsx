import {
    Avatar,
    List,
} from "antd";
import React from "react";

import { THUMBNAIL_BASE_URL } from "../../constants";
import {
    DeselectPointAction,
    SelectCellIn3DAction,
} from "../../state/selection/types";

const styles = require("./style.css");

interface GalleryCardProps {
    labeledStructure: string;
    src: string;
    selected: boolean;
    downloadHref: string;
    cellID: number;
    handleDeselectPoint: (payload: number) => DeselectPointAction;
    handleOpenIn3D: (payload: number) => SelectCellIn3DAction;
    empty?: boolean;
    onMouseEnter: (target: React.MouseEvent<HTMLElement>) => void;
    onMouseLeave: (target: React.MouseEvent<HTMLElement>) => void;
}

const MinGalleryCard: React.SFC<GalleryCardProps> = (props) => {

    const openCellin3D = () => {
        props.handleOpenIn3D(props.cellID);
    };

    return (
        <List.Item
            key={props.cellID}
            className={styles.container}
            {... {
                // props not in ant.d component, but do exist
                id: props.cellID ? props.cellID.toString() : "",
                onMouseEnter: props.onMouseEnter,
                onMouseLeave: props.onMouseLeave,

            }}
        >

            <List.Item.Meta
                avatar={props.src && (
                    <div
                        onClick={openCellin3D}
                    >
                    <Avatar
                        className={props.selected && styles.selected}
                        alt="thumbnail of microscopy image"
                        src={`${THUMBNAIL_BASE_URL}${props.src}`}
                    />
                    </div>
                )}
            />
        </List.Item>
    );
};

export default MinGalleryCard;
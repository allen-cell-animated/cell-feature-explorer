import {
    Avatar,
    Button,
    Icon,
    List,
} from "antd";
import { map, noop } from "lodash";
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
}

const GalleryCard: React.SFC<GalleryCardProps> = (props) => {

    const deselectPoint = () => {
        props.handleDeselectPoint(Number(props.cellID));
    };

    const openCellin3D = () => {
        setTimeout(window.scroll({
            behavior: "smooth",
            left: 0,
            top: 2500,
        }), 3000);
        props.handleOpenIn3D(props.cellID);
    };

    const actions = [
        (
            <Button
                className={props.selected ? styles.disabled : ""}
                key={`${props.cellID}-load`}
                onClick={openCellin3D}
            >3D
            </Button>
        ),
        (
            <Button
                key={`${props.cellID}-download-link`}
            >
            <a
                href={props.downloadHref}
            >
                <Icon
                    type="download"
                />
            </a>
            </Button>
        ),
        (
            <Button
                onClick={deselectPoint}
                key={`${props.cellID}-close`}
            >
            <Icon
                type="close"
            />
            </Button>
        ),
    ];

    return (
        <List.Item
            key={props.cellID}
            className={styles.container}
            onMouseEnter={props.onMouseEnter}
            onMouseLeave={props.onMouseLeave}

        >

            <List.Item.Meta
                avatar={props.src && (
                    <Avatar
                        onClick={openCellin3D}
                        className={props.selected && styles.selected}
                        alt="thumbnail of microscopy image"
                        src={`${THUMBNAIL_BASE_URL}${props.src}`}
                    />
                )}
            />
                { !props.empty &&
                    <React.Fragment>
                    <ul className={styles.infoList}>
                        <li className={styles.title}>
                            {props.cellID}
                        </li>
                        <li>
                            {props.labeledStructure}
                        </li>
                    </ul>

                    <div className={styles.actionList}>
                        {map(actions, (action) => (action))}
                    </div>

                    </React.Fragment>
                }

        </List.Item>
    );
};

export default GalleryCard;

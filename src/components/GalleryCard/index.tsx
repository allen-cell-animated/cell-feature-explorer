import {
    Avatar,
    Button,
    Card,
    Icon,
    List,
} from "antd";
import React from "react";

import { MITOTIC_STAGE_NAMES, THUMBNAIL_BASE_URL } from "../../constants";
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
    mitoticStage?: number;
    handleDeselectPoint: (payload: number) => DeselectPointAction;
    handleOpenIn3D: (payload: number) => SelectCellIn3DAction;
    empty?: boolean;
    onMouseEnter: (target: React.MouseEvent<HTMLElement>) => void;
    onMouseLeave: (target: React.MouseEvent<HTMLElement>) => void;
}

const GalleryCard: React.SFC<GalleryCardProps> = (props) => {

    const deselectPoint = () => {
        props.handleDeselectPoint(Number(props.cellID));
    };

    const openCellin3D = () => {
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

    let mitoticStage;

    if (props.mitoticStage !== undefined) {
        mitoticStage = MITOTIC_STAGE_NAMES[props.mitoticStage] as keyof typeof MITOTIC_STAGE_NAMES;
    }

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
            <Card
                bordered={true}
            >
            <Card.Meta
                title={props.labeledStructure}
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
                description={props.cellID}
            />
                {mitoticStage && <span className={styles.stage}>{mitoticStage}</span>}
                {!props.empty &&
                        <div className={styles.actionList}>
                            {actions}
                        </div>
                }
            </Card>
        </List.Item>
    );
};

export default GalleryCard;

import {
    Avatar,
    Button,
    Card,
    Dropdown,
    Icon,
    List,
    Menu,
} from "antd";
import React from "react";

import {
    MITOTIC_STAGE_LABELS,
    THUMBNAIL_BASE_URL,
} from "../../constants";
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
    downloadFullField: string;
}

const GalleryCard: React.SFC<GalleryCardProps> = (props) => {

    const deselectPoint = () => {
        props.handleDeselectPoint(Number(props.cellID));
    };

    const openCellin3D = () => {
        props.handleOpenIn3D(props.cellID);
    };
    const menu = (
        <Menu className="download-dropdown">
            <Menu.Item key="1">
                <a
                    href={props.downloadHref}
                >
                    <Icon type="download" /> Segmented cell
                </a>
            </Menu.Item>
            <Menu.Item key="2">
                <a
                    href={props.downloadFullField}
                >
                    <Icon type="download" /> Full field image
                </a>
            </Menu.Item>
        </Menu>
    );

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
            <Dropdown key={`${props.cellID}-download`} overlay={menu} trigger={["click"]}>
                <Button icon="download" />
            </Dropdown>
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
        mitoticStage = MITOTIC_STAGE_LABELS[props.mitoticStage] as keyof typeof MITOTIC_STAGE_LABELS;
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

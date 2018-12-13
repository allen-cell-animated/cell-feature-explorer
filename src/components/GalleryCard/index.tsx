import {
    Card,
    Icon,
} from "antd";
import React from "react";

import { THUMBNAIL_BASE_URL } from "../../constants";
import {
    ChangeSelectionAction,
    DeselectPointAction,
} from "../../state/selection/types";

const { Meta } = Card;
const styles = require("./style.css");

interface GalleryCardProps {
    cellID: string;
    src: string;
    downloadHref: string;
    handleDeselectPoint: (payload: number) => DeselectPointAction;
    handleOpenIn3D: (payload: string) => ChangeSelectionAction;
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

    return (
        <Card
            className={styles.container}
            loading={props.empty}
            cover={props.src &&
                (<img alt="thumbnail of microscopy image" src={`${THUMBNAIL_BASE_URL}${props.src}`}/>)
            }
            actions={props.empty ? [] : [
                <span
                    key={`${props.cellID}-load`}
                    onClick={openCellin3D}
                >3D
                </span>,
                <a
                    key={`${props.cellID}-download-link`}
                    href={props.downloadHref}
                >
                    <Icon
                        type="download"
                    />
                </a>,
                <Icon
                    key={`${props.cellID}-close`}
                    type="close"
                    onClick={deselectPoint}
                />,
            ]}
        >
            <Meta
                title={props.cellID}
            />
        </Card>
    );
};

export default GalleryCard;

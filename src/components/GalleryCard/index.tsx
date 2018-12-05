import {
    Card,
    Icon,
} from "antd";
import React from "react";

import { THUMBNAIL_BASE_URL } from "../../constants";
import {
    ChangeSelectionAction,
    DeselectPointAction, DownloadImageAction,
} from "../../state/selection/types";

const { Meta } = Card;
const styles = require("./style.css");

interface GalleryCardProps {
    title: string;
    src: string;
    handleDeselectPoint: (payload: number) => DeselectPointAction;
    handleOpenIn3D: (payload: string) => ChangeSelectionAction;
    handleDownloadImage: (payload: number) => DownloadImageAction;
    pointIndex: number;
    empty?: boolean;
}

const GalleryCard: React.SFC<GalleryCardProps> = (props) => {

    const deselectPoint = () => {
        props.handleDeselectPoint(props.pointIndex);
    };

    const openCellin3D = () => {
        setTimeout(window.scroll({
            behavior: "smooth",
            left: 0,
            top: 2500,
        }), 3000);
        props.handleOpenIn3D(props.title);
    };

    const downloadData = () => {
        props.handleDownloadImage(props.pointIndex);
    };

    return (
        <Card
            className={styles.container}
            loading={props.empty}
            cover={props.src &&
                (<img alt="thumbnail of microscopy image" src={`${THUMBNAIL_BASE_URL}/${props.src}`}/>)
            }
            actions={props.empty ? [] : [
                <span
                    key={`${props.title}-load`}
                    onClick={openCellin3D}
                >3D
                </span>,
                <Icon
                    key={`${props.title}-download`}
                    type="download"
                    onClick={downloadData}
                />,
                <Icon
                    key={`${props.title}-close`}
                    type="close"
                    onClick={deselectPoint}
                />,
            ]}
        >
            <Meta
                title={props.title}
            />
        </Card>
    );
};

export default GalleryCard;

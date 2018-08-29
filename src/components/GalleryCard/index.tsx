import {
    Card,
    Icon
} from "antd";
import React from "react";

import "antd/lib/card/style";

import { THUMBNAIL_BASE_URL } from "../../constants";
import { DeselectPointAction } from "../../state/selection/types";

const { Meta } = Card;
const styles = require("./style.css");

interface GalleryCardProps {
    title: string;
    src: string;
    handleDeselectPoint: (payload: number) => DeselectPointAction;
    pointIndex: number;
}

const GalleryCard: React.SFC<GalleryCardProps> = (props) => {

    const deselectPoint = () => {
        props.handleDeselectPoint(props.pointIndex);
    };

    return (
        <Card
            style={{width: 124}}
            className={styles.container}
            cover={<img alt="thumbnail of microscopy image" src={`${THUMBNAIL_BASE_URL}/${props.src}`}/>}
            actions={[
                <span key={`${props.title}-load`}>3D <Icon type="arrows-alt"/></span>,
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

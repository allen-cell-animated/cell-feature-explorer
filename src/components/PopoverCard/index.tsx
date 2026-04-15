import { PictureOutlined } from "@ant-design/icons";
import { Card } from "antd";
import React from "react";

import styles from "./style.css";

const { Meta } = Card;

export interface PopoverCardProps {
    description: string;
    title: string;
    src?: string;
}

const PopoverCard: React.FC<PopoverCardProps> = (props) => {
    const [loadedImageSrc, setLoadedImageSrc] = React.useState("");
    const onImageLoad = React.useCallback(
        (e: React.SyntheticEvent<HTMLImageElement>) => setLoadedImageSrc(e.currentTarget.src),
        []
    );
    const imageIsLoaded = props.src === loadedImageSrc;

    const cover = (
        <>
            {props.src && (
                <img
                    alt="thumbnail of microscopy image"
                    src={props.src}
                    onLoad={onImageLoad}
                    style={imageIsLoaded ? {} : { display: "none" }}
                />
            )}
            <div
                className={styles.placeholderContainer}
                style={imageIsLoaded ? { display: "none" } : {}}
            >
                <PictureOutlined />
            </div>
        </>
    );

    return (
        <Card className={styles.container} cover={cover} variant="borderless">
            <Meta description={props.description} title={props.title} />
        </Card>
    );
};

export default PopoverCard;

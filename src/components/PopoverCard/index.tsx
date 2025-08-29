import { Card } from "antd";
import React, { useEffect, useState } from "react";

import { createThumbnailImageSrc } from "../../util/thumbnail_utils";

const { Meta } = Card;
import styles from "./style.css";

export interface PopoverCardProps {
    description: string;
    title: string;
    src?: string;
}

const PopoverCard: React.FC<PopoverCardProps> = (props) => {
    const [imageSrc, setImageSrc] = useState(props.src);

    useEffect(() => {
        const path = props.src;
        if (path && path.endsWith(".ome.zarr")) {
            // Asynchronously load + set image source
            createThumbnailImageSrc(path).then((src) => {
                setImageSrc(src);
            });
        } else {
            setImageSrc(props.src);
        }
    }, [props.src]);

    return (
        <Card
            className={styles.container}
            cover={imageSrc && <img alt="thumbnail of microscopy image" src={imageSrc} />}
        >
            <Meta description={props.description} title={props.title} />
        </Card>
    );
};

export default PopoverCard;

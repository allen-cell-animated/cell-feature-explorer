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
    const placeholderImage = (
        <div className={styles.placeholderContainer}>
            <PictureOutlined />
        </div>
    );

    return (
        <Card
            className={styles.container}
            cover={
                props.src ? (
                    <img alt="thumbnail of microscopy image" src={props.src} />
                ) : (
                    placeholderImage
                )
            }
        >
            <Meta description={props.description} title={props.title} />
        </Card>
    );
};

export default PopoverCard;

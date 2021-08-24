import { Card } from "antd";
import React from "react";

const { Meta } = Card;
import styles from "./style.css";

export interface PopoverCardProps {
    description: string;
    title: string;
    src?: string;
}

const PopoverCard: React.SFC<PopoverCardProps> = (props) => {
    return (
        <Card
            className={styles.container}
            cover={props.src && <img alt="thumbnail of microscopy image" src={props.src} />}
        >
            <Meta description={props.description} title={props.title} />
        </Card>
    );
};

export default PopoverCard;

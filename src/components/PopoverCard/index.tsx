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

export interface PopoverCardProps {
    description: string;
    title: string;
    src?: string;
}

const PopoverCard: React.SFC<PopoverCardProps> = (props) => {

    return (
        <Card
            className={styles.container}
            cover={props.src &&
            (<img alt="thumbnail of microscopy image" src={`${THUMBNAIL_BASE_URL}${props.src}`}/>)
            }
        >
            <Meta
                description={props.description}
                title={props.title}
            />
        </Card>
    );
};

export default PopoverCard;
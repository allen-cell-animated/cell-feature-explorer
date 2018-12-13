import React from "react";

const styles = require("./style.css");

interface MouseFollowerProps {
    pageX: number;
    pageY: number;
}
const MouseFollower: React.SFC<MouseFollowerProps> = (props) => {
    return (
        <div
            className={styles.follower}
            style={{left: `${props.pageX + 10}px`, top: `${props.pageY}px`}}
        />
    );
};

export default MouseFollower;

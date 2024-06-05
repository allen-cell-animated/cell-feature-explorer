import React from "react";

import styles from "./style.css";

interface MouseFollowerProps {
    pageX: number;
    pageY: number;
    ref: React.RefObject<HTMLDivElement>;
}
const MouseFollower = React.forwardRef<HTMLDivElement, React.PropsWithChildren<MouseFollowerProps>>(
    (props, ref) => {
        return (
            <div
                ref={ref}
                className={styles.follower}
                style={{ left: `${props.pageX + 10}px`, top: `${props.pageY}px` }}
            >
                {props.children}
            </div>
        );
    }
);

export default MouseFollower;

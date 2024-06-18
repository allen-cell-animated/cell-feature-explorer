import React from "react";

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
                style={{
                    left: `${props.pageX + 10}px`,
                    top: `${props.pageY}px`,
                    position: "absolute",
                }}
            >
                {props.children}
            </div>
        );
    }
);
MouseFollower.displayName = "MouseFollower";

export default MouseFollower;

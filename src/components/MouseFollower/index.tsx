import React from "react";

const styles = require("./style.css");

const MouseFollower: React.SFC = () => {

    document.addEventListener("mousemove", (e) => {
       const follower = document.getElementById("follower");
       if (follower) {
           follower.style.left = `${e.pageX + 10}px`;
           follower.style.top = `${e.pageY}px`;
       }
    });

    return (
        <div
            className={styles.follower}
            id="follower"
        />
    );
};

export default MouseFollower;

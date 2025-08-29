import { Avatar, List } from "antd";
import React, { useEffect, useState } from "react";
import classNames from "classnames";
import { PictureOutlined } from "@ant-design/icons";

import { DeselectPointAction, SelectPointAction } from "../../state/selection/types";
import { FileInfo } from "../../state/metadata/types";
import { createThumbnailImageSrc } from "../../util/thumbnail_utils";

import styles from "./style.css";

interface GalleryCardProps {
    category: string;
    src: string;
    selected: boolean;
    downloadHref: string;
    cellID: string;
    fileInfo: FileInfo;
    handleDeselectPoint: (payload: string) => DeselectPointAction;
    handleOpenIn3D: (payload: { id: string }) => SelectPointAction;
    empty?: boolean;
    onMouseEnter: (target: React.MouseEvent<HTMLElement>) => void;
    onMouseLeave: (target: React.MouseEvent<HTMLElement>) => void;
}

const MinGalleryCard: React.FC<GalleryCardProps> = (props) => {
    const [imageSrc, setImageSrc] = useState(props.src);
    useEffect(() => {
        const path = props.fileInfo?.volumeviewerPath ?? props.fileInfo?.fovVolumeviewerPath;
        if (
            (!props.src && path && path.endsWith(".ome.zarr")) ||
            (props.src && props.src.endsWith(".ome.zarr"))
        ) {
            // Asynchronously load + set image source
            createThumbnailImageSrc(path).then((src) => {
                setImageSrc(src);
            });
        } else {
            setImageSrc(props.src);
        }
    }, [props.src]);

    const openCellin3D = () => {
        props.handleOpenIn3D({ id: props.cellID });
    };

    return (
        <List.Item
            key={props.cellID}
            className={styles.container}
            {...{
                // props not in ant.d component, but do exist
                id: props.cellID ? props.cellID.toString() : "",
                onMouseEnter: props.onMouseEnter,
                onMouseLeave: props.onMouseLeave,
            }}
        >
            <List.Item.Meta
                avatar={
                    <div onClick={openCellin3D}>
                        <Avatar
                            className={classNames(
                                { [styles.selected]: props.selected },
                                styles.avatar
                            )}
                            alt="thumbnail of microscopy image"
                            src={imageSrc}
                            icon={
                                imageSrc ? undefined : (
                                    <PictureOutlined className={styles.placeholderAvatar} />
                                )
                            }
                        />
                    </div>
                }
            />
        </List.Item>
    );
};

export default MinGalleryCard;

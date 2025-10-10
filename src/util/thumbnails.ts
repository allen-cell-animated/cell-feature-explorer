import * as zarr from "zarrita";
import { renderThumbnail } from "ome-zarr.js";
import { FileInfo } from "../state/metadata/types";
import { useState, useEffect } from "react";

/**
 * Creates and returns a data URL for a thumbnail image based on the provided
 * zarr source.
 */
export async function createThumbnailImageSrc(src: string): Promise<string> {
    const store = new zarr.FetchStore(src);
    const url = await renderThumbnail(store);
    return url;
}

/**
 * Returns a thumbnail image source (to be used in an <img> tag) based on the
 * provided source and file info.
 *
 * If no source is provided, attempts to generate a thumbnail. (Currently only
 * supports .ome.zarr files.)
 */
export function useThumbnail(src: string, fileInfo: FileInfo): string {
    const [imageSrc, setImageSrc] = useState(src);

    // If no thumbnail src is provided, attempt to generate one
    useEffect(() => {
        const path = fileInfo?.volumeviewerPath ?? fileInfo?.fovVolumeviewerPath;
        if ((!src && path && path.endsWith(".ome.zarr")) || (src && src.endsWith(".ome.zarr"))) {
            // Asynchronously load + set image source
            createThumbnailImageSrc(path).then((src) => {
                setImageSrc(src);
            });
        } else {
            setImageSrc(src);
        }
    }, [src]);

    return imageSrc;
}

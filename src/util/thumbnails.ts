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
 * supports OME-Zarr images.)
 */
export function useThumbnail(src: string, fileInfo: FileInfo): string {
    const [imageSrc, setImageSrc] = useState(src);

    const volumeviewerPath = fileInfo?.volumeviewerPath;
    const fovVolumeviewerPath = fileInfo?.fovVolumeviewerPath;

    // If no thumbnail src is provided, attempt to generate one
    useEffect(() => {
        // Reset to the provided src whenever dependencies change
        // (clears stale thumbnails, e.g. after "Clear All")
        setImageSrc(src);

        const tryGenerateThumbnailAsync = async (): Promise<void> => {
            let zarrPath: string | undefined = undefined;
            const path: string | undefined = volumeviewerPath ?? fovVolumeviewerPath;
            if (src && src.endsWith(".zarr")) {
                zarrPath = src;
            } else if (path && path.endsWith(".zarr")) {
                zarrPath = path;
            }
            if (zarrPath) {
                try {
                    const generatedSrc = await createThumbnailImageSrc(zarrPath);
                    setImageSrc(generatedSrc);
                    return;
                } catch (e) {
                    console.error(`Error generating thumbnail for file ${zarrPath} :`, e);
                }
            }
        };
        tryGenerateThumbnailAsync();
    }, [src, volumeviewerPath, fovVolumeviewerPath]);

    return imageSrc;
}

import * as zarr from "zarrita";
import { renderThumbnail } from "ome-zarr.js";

export async function createThumbnailImageSrc(src: string): Promise<string> {
    const store = new zarr.FetchStore(src);
    const url = await renderThumbnail(store);
    return url;
}

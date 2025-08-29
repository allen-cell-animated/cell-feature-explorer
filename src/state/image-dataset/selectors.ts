import { State } from "..";
import { ImageDataset } from "./types";

export const getImageDataset = (state: State): ImageDataset => state.imageDataset.imageDataset;

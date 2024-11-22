import FirebaseRequest from "./firebase";
import JsonRequest from "./json-dataset";
import { ImageDataset } from "./types";

// by default will use Firebase for dataset, can be switched to JSON dataset using ENV
// variable
export default function GetImageDatasetInstance(): ImageDataset {
    return process.env.USE_JSON_DATASET ? new JsonRequest() : new FirebaseRequest();
}

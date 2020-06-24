import FirebaseRequest from "./firebase";
import JsonRequest from "./json-dataset";
import { ImageDataset } from "./types";

// by default will use Firebase for dataset, can be switched to github using ENV
// variable
export default function RequestClassToUse(): ImageDataset {
    return process.env.USE_GITHUB_FOR_DATASET ? new JsonRequest() : new FirebaseRequest();
}

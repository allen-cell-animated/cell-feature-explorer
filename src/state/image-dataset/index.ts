import FirebaseRequest from "./firebase";
import JsonRequest from "./json-dataset";
import { ImageDataset, requiredKeys } from "./types";
// by default will use Firebase for dataset, can be switched to github using ENV variable
let RequestClassToUse = process.env.USE_GITHUB_FOR_DATASET ? JsonRequest : FirebaseRequest;

function implementsRequiredKeys<T>(obj: any): obj is T {
    const implementKeys = requiredKeys.reduce((impl, key) => impl && key in obj, true);
    return implementKeys;
}
// extra runtime check to make sure the expected methods are in the class that is being exported
RequestClassToUse = implementsRequiredKeys<ImageDataset>(new RequestClassToUse()) ? RequestClassToUse : FirebaseRequest;

export default RequestClassToUse;

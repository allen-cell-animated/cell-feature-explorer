import FirebaseRequest from "./firebase";
import JsonRequest from "./json-dataset";

// by default will use Firebase for dataset, can be switched to github using ENV variable, or by explicitly calling imageDataset.JsonRequest
const toExtend = process.env.USE_GITHUB_FOR_DATASET ? JsonRequest : FirebaseRequest;

class ImageDataSet extends toExtend {
    firebaseRequest: FirebaseRequest;
    JsonRequest: JsonRequest;

    constructor() {
        super();
        this.firebaseRequest = new FirebaseRequest();
        this.JsonRequest = new JsonRequest();
    }

}

export default ImageDataSet;

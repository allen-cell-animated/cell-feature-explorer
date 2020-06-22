import FirebaseRequest from "./firebase";
import JsonRequest from "./json-dataset";

// by default will use Firebase for dataset, can be switched to github using ENV variable, or by explicitly calling imageDataset.JsonRequest
const RequestInterface = process.env.USE_GITHUB_FOR_DATASET ? JsonRequest : FirebaseRequest;

export default RequestInterface;

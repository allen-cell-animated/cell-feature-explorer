import { AxiosResponse } from "axios";
import { createLogic } from "redux-logic";

import { ReduxLogicDeps } from "../types";

import { receiveMetadata } from "./actions";
import { REQUEST_FEATURE_DATA } from "./constants";

const requestFeatureData = createLogic({
    processOptions: {
        successType: receiveMetadata,
    },
    process(deps: ReduxLogicDeps) {
        const {
            baseApiUrl,
            httpClient,
        } = deps;

        return httpClient
            .get(`${baseApiUrl}/cell-feature-analysis.json`)
            .then((metadata: AxiosResponse) => metadata.data
            )
            .catch((reason) => {
                console.log(reason); // tslint:disable-line:no-console
            });
    },
    type: REQUEST_FEATURE_DATA,
});

export default [
    requestFeatureData,
];

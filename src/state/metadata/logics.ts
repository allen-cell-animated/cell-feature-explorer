import { AxiosResponse } from "axios";
import {
    isNumber,
    pickBy,
} from "lodash";
import { createLogic } from "redux-logic";

import { ReduxLogicDeps } from "../types";

import {
    CELL_ID_KEY,
    PROTEIN_NAME_KEY,
    THUMBNAIL_DIR_KEY,
} from "../../constants/index";

import { receiveMetadata } from "./actions";
import { REQUEST_FEATURE_DATA } from "./constants";
import { MetadataStateBranch } from "./types";

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
            .then((data) => {
                return data.map((datum: MetadataStateBranch) => {
                    return {
                        file_info: {
                            [CELL_ID_KEY]: datum[CELL_ID_KEY],
                            [THUMBNAIL_DIR_KEY]: datum[THUMBNAIL_DIR_KEY],
                            [PROTEIN_NAME_KEY]: datum[PROTEIN_NAME_KEY],
                        },
                        measured_features: {
                            ...pickBy(datum, isNumber),
                        },
                    };
                });
            })
            .catch((reason) => {
                console.log(reason); // tslint:disable-line:no-console
            });
    },
    type: REQUEST_FEATURE_DATA,
});

export default [
    requestFeatureData,
];

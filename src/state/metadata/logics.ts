import { AxiosResponse } from "axios";
import {
    isNumber,
    pickBy,
} from "lodash";
import { createLogic } from "redux-logic";

import { ReduxLogicDeps } from "../types";

import {
    CELL_ID_KEY,
    CELL_LINE_NAME_KEY,
    CELLLINEDEF_NAME_KEY,
    CELLLINEDEF_PROTEIN_KEY,
    CELLLINEDEF_STRUCTURE_KEY,
    FOV_ID_KEY,
    PROTEIN_NAME_KEY,
} from "../../constants/index";

import { receiveMetadata, requestFeatureData } from "./actions";
import { REQUEST_CELL_LINE_DATA, REQUEST_FEATURE_DATA } from "./constants";
import { CellLineDef, MetadataStateBranch } from "./types";

const requestCellLineData = createLogic({
    // processOptions: {
    //    successType: requestFeatureData,
    // },
    process(deps: ReduxLogicDeps, dispatch: any, done: any) {
        const {
            baseApiUrl,
            httpClient,
        } = deps;

        return httpClient
            .get(`${baseApiUrl}/cell-line-def.json`)
            .then((metadata: AxiosResponse) => metadata.data
            )
            .then((data) => {
                return data.reduce((accumulator: CellLineDef, datum: MetadataStateBranch) => {
                    accumulator[datum[CELLLINEDEF_NAME_KEY]] = {
                        [CELLLINEDEF_STRUCTURE_KEY]: datum[CELLLINEDEF_STRUCTURE_KEY],
                        [CELLLINEDEF_PROTEIN_KEY]: datum[CELLLINEDEF_PROTEIN_KEY],
                    };
                    return accumulator;
                }, {});
            })
            .then((data) => dispatch(requestFeatureData(data)))
            .catch((reason) => {
                console.log(reason); // tslint:disable-line:no-console
            })
            .then(() => done());
    },
    type: REQUEST_CELL_LINE_DATA,
});

const requestFeatureDataLogic = createLogic({
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
                            [CELL_LINE_NAME_KEY]: datum[CELL_LINE_NAME_KEY],
                            [FOV_ID_KEY]: datum[FOV_ID_KEY],
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
    requestCellLineData,
    requestFeatureDataLogic,
];

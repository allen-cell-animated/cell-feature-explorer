import { AxiosResponse } from "axios";
import {
    difference,
    keys,
    pick,
} from "lodash";
import { createLogic } from "redux-logic";

import { ReduxLogicDeps } from "../types";

import {
    CELL_LINE_DEF_NAME_KEY,
    CELL_LINE_DEF_PROTEIN_KEY,
    CELL_LINE_DEF_STRUCTURE_KEY,
    CELL_LINE_NAME_KEY,
    FILE_INFO_KEYS,
    PROTEIN_NAME_KEY,
} from "../../constants/index";

import { receiveCellLineData, receiveMetadata, requestFeatureData } from "./actions";
import { REQUEST_CELL_LINE_DATA, REQUEST_FEATURE_DATA } from "./constants";
import { CellLineDef, MetadataStateBranch } from "./types";

const requestCellLineData = createLogic({
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
                    accumulator[datum[CELL_LINE_DEF_NAME_KEY]] = {
                        [CELL_LINE_DEF_STRUCTURE_KEY]: datum[CELL_LINE_DEF_STRUCTURE_KEY],
                        [CELL_LINE_DEF_PROTEIN_KEY]: datum[CELL_LINE_DEF_PROTEIN_KEY],
                    };
                    return accumulator;
                }, {});
            })
            .then((data) => dispatch(receiveCellLineData(data)))
            .then(() => dispatch(requestFeatureData()))
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
            getState,
            httpClient,
        } = deps;

        return httpClient
            .get(`${baseApiUrl}/cell-feature-analysis.json`)
            .then((metadata: AxiosResponse) => metadata.data
            )
            .then((data) => {
                const cellLineDefs = getState().metadata.cellLineDefs;

                return data.map((datum: MetadataStateBranch) => {
                    return {
                        clusters: datum.clusters,
                        file_info: {
                            ...datum.file_info,
                            // TODO: The following field is unnecessary but convenient.
                            // To optimize, remove this and use selectors to get protein name via
                            // cell line name and state.metadata.cellLineDefs
                            [PROTEIN_NAME_KEY]:
                                cellLineDefs[datum.file_info[CELL_LINE_NAME_KEY]][CELL_LINE_DEF_PROTEIN_KEY],

                        },
                        measured_features: datum.measured_features,
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

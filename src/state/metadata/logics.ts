import { AxiosResponse } from "axios";
import {
    isEmpty,
    keys,
    map,
    reduce,
    shuffle,
} from "lodash";
import { createLogic } from "redux-logic";

import {
    CELL_ID_KEY,
    CELL_LINE_DEF_NAME_KEY,
    CELL_LINE_DEF_PROTEIN_KEY,
    CELL_LINE_DEF_STRUCTURE_KEY,
    CELL_LINE_NAME_KEY,
    PROTEIN_NAME_KEY,
} from "../../constants";
import {
    changeClusteringNumber,
    selectCellFor3DViewer,
    selectPoint,
} from "../selection/actions";
import { CLUSTERING_MAP } from "../selection/constants";
import {
    getClickedScatterPoints,
    getSelected3DCell,
} from "../selection/selectors";
import {
    ChangeClusterNumberAction,
} from "../selection/types";
import { ReduxLogicDeps } from "../types";
import { batchActions } from "../util";

import {
    receiveCellLineData,
    receiveMetadata,
    requestFeatureData,
} from "./actions";
import {
    RECEIVE_ALBUM_DATA,
    REQUEST_ALBUM_DATA,
    REQUEST_CELL_LINE_DATA,
    REQUEST_FEATURE_DATA,
} from "./constants";
import {
    CellLineDef,
    MetaData,
    MetadataStateBranch,
} from "./types";

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
                return reduce(data, (accumulator: CellLineDef, datum: MetadataStateBranch) => {
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
    process(deps: ReduxLogicDeps, dispatch: any, done: any) {
        const {
            baseApiUrl,
            getState,
            httpClient,
        } = deps;

        return httpClient
            .get(`${baseApiUrl}/cell-feature-analysis.json`)
            .then((metadata: AxiosResponse) => metadata.data)
            .then((data) => {
                const cellLineDefs = getState().metadata.cellLineDefs;
                // shuffle to keep the plot from being organized in z
                return shuffle(map(data, (datum: MetadataStateBranch) => {
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
                }));
            })
            .then((metaData: MetaData[]): MetaData => {
                // set the clustering options based on the dataset
                const changeClusterNumberActions = map(metaData[0].clusters,
                    (value, clusteringName: string): ChangeClusterNumberAction => {
                    const initVal = keys(value)[Math.floor(keys(value).length / 2)];
                    return changeClusteringNumber(CLUSTERING_MAP(clusteringName), initVal);
                });

                dispatch(batchActions([...changeClusterNumberActions, receiveMetadata(metaData)]));
                return metaData[0];
            })
            .then((metaDatum) => {
                // select first cell on both plot and load in 3D to make it clear what the user can do
                // BUT only if those selections have not been previously made (e.g., passed through URL params)
                const state = getState();
                const actions = [];

                if (isEmpty(getClickedScatterPoints(state))) {
                    actions.push(selectPoint(Number(metaDatum.file_info[CELL_ID_KEY])));
                }

                if (!getSelected3DCell(state)) {
                    actions.push(selectCellFor3DViewer(metaDatum.file_info[CELL_ID_KEY]));
                }

                if (!isEmpty(actions)) {
                    dispatch(batchActions(actions));
                }
            })
            .catch((reason) => {
                console.log(reason); // tslint:disable-line:no-console
            })
            .then(() => done());

    },
    type: REQUEST_FEATURE_DATA,
});

const requestAlbumData = createLogic({
    process(deps: ReduxLogicDeps) {
        const {
            baseApiUrl,
            httpClient,
        } = deps;
        return httpClient
            .get(`${baseApiUrl}/albums.json`)
            .then((metadata: AxiosResponse) => metadata.data)
            .catch((reason) => {
                console.log(reason); // tslint:disable-line:no-console
            });
    },
    processOptions: {
        successType: RECEIVE_ALBUM_DATA,
    },
    type: REQUEST_ALBUM_DATA,

});

export default [
    requestAlbumData,
    requestCellLineData,
    requestFeatureDataLogic,
];

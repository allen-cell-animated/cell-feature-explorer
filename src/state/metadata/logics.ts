/* eslint-disable @typescript-eslint/camelcase */
import {
    isEmpty,
    keys,
    map,
    shuffle,
} from "lodash";
import { createLogic } from "redux-logic";

import {
    CELL_ID_KEY,
    CELL_LINE_DEF_PROTEIN_KEY,
    CELL_LINE_NAME_KEY,
    PROTEIN_NAME_KEY,
} from "../../constants";
import { DatasetMetaData } from "../../constants/datasets";
import { changeClusteringNumber, selectCellFor3DViewer, selectPoint } from "../selection/actions";
import { CLUSTERING_MAP } from "../selection/constants";
import { getClickedScatterPoints, getColorBySelection, getPlotByOnX, getPlotByOnY, getSelected3DCell } from "../selection/selectors";
import { ChangeClusterNumberAction } from "../selection/types";
import { ReduxLogicDeps } from "../types";
import { batchActions } from "../util";

import { receiveAvailableDatasets, receiveFileInfoData, receiveMeasuredFeatureNames, receiveCellLineData, receiveMetadata, requestFeatureData, setLoadingText, stopLoading } from "./actions";

import {
    RECEIVE_ALBUM_DATA,
    REQUEST_AVAILABLE_DATASETS,
    REQUEST_ALBUM_DATA,
    REQUEST_CELL_FILE_INFO,
    REQUEST_CELL_LINE_DATA,
    REQUEST_FEATURE_DATA,
} from "./constants";
import { MetaData, MetadataStateBranch } from "./types";


const requestAvailableDatasets = createLogic({
    process(deps: ReduxLogicDeps, dispatch: any, done: any) {
        const { imageDataSet } = deps;
        return imageDataSet
            .getAvailableDatasets()
            .then((data: DatasetMetaData[]) => dispatch(receiveAvailableDatasets(data)))
            .catch((reason: string) => {
                console.log(reason); // tslint:disable-line:no-console
            })
            .then(() => done());
    },
    type: REQUEST_AVAILABLE_DATASETS,
});

const requestCellLineData = createLogic({
    process(deps: ReduxLogicDeps, dispatch: any, done: any) {
        const { imageDataSet } = deps;
        dispatch(setLoadingText("Loading cell line data..."));
        return imageDataSet
            .getFileInfo()
            .then((data: MetadataStateBranch) => dispatch(receiveFileInfoData(data)))
            .then(() => dispatch(requestFeatureData()))
            .catch((reason: string) => {
                console.log(reason); // tslint:disable-line:no-console
            })
            .then(() => done());
    },
    type: REQUEST_CELL_FILE_INFO,
});

const requestFeatureDataLogic = createLogic({
    async process(deps: ReduxLogicDeps, dispatch: any, done: any) {
        const { getState, imageDataSet } = deps;
        dispatch(setLoadingText("Loading plot data, may take several seconds to a minute..."));
        return imageDataSet
            .getFeatureData(plotByX, plotByY, colorBy)
            .then((data: MetadataStateBranch[]) => {
                const cellLineDefs = getState().metadata.cellLineDefs;
                dispatch(stopLoading())
                console.log(data)
                actions.push(receiveMetadata(data));
                dispatch(batchActions(actions))
                // shuffle to keep the plot from being organized in z
                // return shuffle(
                //     map(data, (datum: MetadataStateBranch) => {
                //         return {
                //             clusters: datum.clusters,
                //             file_info: {
                //                 ...datum.file_info,
                //                 // TODO: The following field is unnecessary but convenient.
                //                 // To optimize, remove this and use selectors to get protein name via
                //                 // cell line name and state.metadata.cellLineDefs
                //                 [PROTEIN_NAME_KEY]:
                //                     cellLineDefs[datum.file_info[CELL_LINE_NAME_KEY]][
                //                         CELL_LINE_DEF_PROTEIN_KEY
                //                     ],
                //             },
                //             measured_features: datum.measured_features,
                //         };
                //     })
                // );
            })
            // .then(
            //     (metaData: MetaData[]): MetaData => {
            //         // set the clustering options based on the dataset
            //         const changeClusterNumberActions = map(
            //             metaData[0].clusters,
            //             (value, clusteringName: string): ChangeClusterNumberAction => {
            //                 const initVal = keys(value)[Math.floor(keys(value).length / 2)];
            //                 return changeClusteringNumber(CLUSTERING_MAP(clusteringName), initVal);
            //             }
            //         );

            //         dispatch(
            //             batchActions([...changeClusterNumberActions, receiveMetadata(metaData)])
            //         );
            //         return metaData[0];
            //     }
            // )
            .then((metaDatum: MetadataStateBranch) => {
                // select first cell on both plot and load in 3D to make it clear what the user can do
                // BUT only if those selections have not been previously made (e.g., passed through URL params)
                const state = getState();
                const actions = [];

                if (isEmpty(getClickedScatterPoints(state))) {
                    actions.push(selectPoint(metaDatum.cellIds[0]));
                }

                if (!getSelected3DCell(state)) {
                    actions.push(selectCellFor3DViewer(metaDatum.cellIds[0]));
                }

                if (!isEmpty(actions)) {
                    dispatch(batchActions(actions));
                }
            })
            .catch((reason: string) => {
                console.log(reason); // tslint:disable-line:no-console
            })
            .then(() => done());
    },
    type: REQUEST_FEATURE_DATA,
});

const requestAlbumData = createLogic({
    process(deps: ReduxLogicDeps, dispatch: any, done: any) {
        const { imageDataSet } = deps;
        dispatch(setLoadingText("Loading album data..."));
        return imageDataSet
            .getAlbumData()
            .then(done)
            .catch((reason: string) => {
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
    requestAvailableDatasets,
    requestFeatureDataLogic,
];

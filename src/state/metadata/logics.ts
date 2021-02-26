/* eslint-disable @typescript-eslint/camelcase */
import { createLogic } from "redux-logic";
import { AnyAction } from "redux";

import { DatasetMetaData } from "../../constants/datasets";

import { ReduxLogicDeps } from "../types";
import { batchActions } from "../util";

import { receiveAvailableDatasets, receiveMeasuredFeatureNames, receiveCellLineData, receiveMetadata, setLoadingText, stopLoading } from "./actions";

import {
    RECEIVE_ALBUM_DATA,
    REQUEST_AVAILABLE_DATASETS,
    REQUEST_ALBUM_DATA,
    REQUEST_CELL_LINE_DATA,
    REQUEST_FEATURE_DATA,
} from "./constants";
import { CellLineDef, MetadataStateBranch } from "./types";
import { isEmpty } from "lodash";
import { ARRAY_OF_CELL_IDS_KEY } from "../../constants";
import { selectPoint, selectCellFor3DViewer } from "../selection/actions";
import { getClickedScatterPoints, getSelected3DCell } from "../selection/selectors";

const requestCellLineDefs = createLogic({
    process(deps: ReduxLogicDeps, dispatch: any, done: any) {
        const { imageDataSet } = deps;

        return imageDataSet
            .getCellLineDefs()
            .then((data: CellLineDef[]) => dispatch(receiveCellLineData(data)))
            .catch((reason: string) => {
                console.log(reason); // tslint:disable-line:no-console
            })
            .then(() => done());
    },
    type: REQUEST_CELL_LINE_DATA,
});


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

const requestFeatureDataLogic = createLogic({
    async process(deps: ReduxLogicDeps, dispatch: any, done: any) {
        const { getState, imageDataSet } = deps;
        dispatch(setLoadingText("Loading plot data, may take several seconds to a minute..."));
        // const state = getState();
        const actions: AnyAction[] = [];
        const measuredFeatureDefs = await imageDataSet.getMeasuredFeatureDefs();
        actions.push(receiveMeasuredFeatureNames(measuredFeatureDefs));
        
        return imageDataSet
            .getFeatureData()
            .then((data: MetadataStateBranch) => {
                actions.push(receiveMetadata(data));
                dispatch(batchActions(actions));
                return data;
            })
            .then((metaDatum: MetadataStateBranch | void) => {
                if (!metaDatum) {
                    return done();
                }
                const secondBatch = [];
                // select first cell on both plot and load in 3D to make it clear what the user can do
                // BUT only if those selections have not been previously made (e.g., passed through URL params)
                const state = getState();

                if (isEmpty(getClickedScatterPoints(state))) {
                    dispatch(selectPoint(metaDatum[ARRAY_OF_CELL_IDS_KEY][0]))
                    // secondBatch.push(selectPoint(metaDatum[ARRAY_OF_CELL_IDS_KEY[0].toString()]));
                }

                if (!getSelected3DCell(state)) {
                    dispatch(selectCellFor3DViewer(metaDatum[ARRAY_OF_CELL_IDS_KEY][0]))
                    // secondBatch.push(selectCellFor3DViewer(metaDatum[ARRAY_OF_CELL_IDS_KEY][0].toString()));
                }
                // if (!isEmpty(secondBatch)) {
                //     dispatch(batchActions(secondBatch));
                // }
                dispatch(stopLoading());
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
    requestCellLineDefs,
    requestAlbumData,
    requestFeatureDataLogic,
    requestAvailableDatasets,
];

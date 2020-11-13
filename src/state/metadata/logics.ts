/* eslint-disable @typescript-eslint/camelcase */
import { isEmpty, find } from "lodash";
import { createLogic } from "redux-logic";

import {
    X_AXIS_ID,
} from "../../constants";
import { DatasetMetaData } from "../../constants/datasets";
import { changeAxis, changeClusteringNumber, selectCellFor3DViewer, selectPoint } from "../selection/actions";
import { CLUSTERING_MAP, INITIAL_PLOT_BY_ON_X, INITIAL_PLOT_BY_ON_Y } from "../selection/constants";
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
        const state = getState();
        let measuredFeatureNames;
        let xAxisDefaultValue;
        let yAxisDefaultValue;
        const actions = [];
        if (imageDataSet.getMeasuredFeatureNames) {
            measuredFeatureNames = await imageDataSet.getMeasuredFeatureNames();
            console.log(measuredFeatureNames);
            xAxisDefaultValue = find(measuredFeatureNames, {displayName: INITIAL_PLOT_BY_ON_X});
            yAxisDefaultValue = find(measuredFeatureNames, {displayName: INITIAL_PLOT_BY_ON_Y})
            actions.push(changeAxis(X_AXIS_ID, xAxisDefaultValue.key));
            actions.push(changeAxis(X_AXIS_ID, yAxisDefaultValue.key));

            actions.push(receiveMeasuredFeatureNames(measuredFeatureNames));
            
        }   
        const plotByX = xAxisDefaultValue ? xAxisDefaultValue.key : getPlotByOnX(state);
        const plotByY = yAxisDefaultValue ? yAxisDefaultValue.key : getPlotByOnY(state);
        const colorBy = getColorBySelection(state);
        return imageDataSet
            .getFeatureData(plotByX, plotByY, colorBy)
            .then((data: MetadataStateBranch[]) => {
                const cellLineDefs = getState().metadata.cellLineDefs;
                dispatch(stopLoading())
                console.log(data)
                actions.push(receiveMetadata(data));
                dispatch(batchActions(actions))
            })
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

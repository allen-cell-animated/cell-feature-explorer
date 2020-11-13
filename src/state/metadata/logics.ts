/* eslint-disable @typescript-eslint/camelcase */
import { isEmpty, find } from "lodash";
import { createLogic } from "redux-logic";
import { AnyAction } from "redux";
import {
    X_AXIS_ID,
} from "../../constants";
import { changeAxis, selectCellFor3DViewer, selectPoint } from "../selection/actions";
import { INITIAL_PLOT_BY_ON_X, INITIAL_PLOT_BY_ON_Y } from "../selection/constants";
import { getClickedScatterPoints, getPlotByOnX, getPlotByOnY, getSelected3DCell } from "../selection/selectors";
import { ReduxLogicDeps } from "../types";
import { batchActions } from "../util";

import { receiveCellLineData, receiveFileInfoData, receiveMeasuredFeatureNames, receiveMetadata, requestFeatureData } from "./actions";
import {
    RECEIVE_ALBUM_DATA,
    REQUEST_ALBUM_DATA,
    REQUEST_CELL_FILE_INFO,
    REQUEST_CELL_LINE_DATA,
    REQUEST_FEATURE_DATA,
} from "./constants";
import { MetadataStateBranch } from "./types";

const requestCellLineDefs = createLogic({
    process(deps: ReduxLogicDeps, dispatch: any, done: any) {
        const { imageDataSet } = deps;

        return imageDataSet
            .getCellLineData()
            .then((data: MetadataStateBranch) => dispatch(receiveCellLineData(data)))
            .catch((reason: string) => {
                console.log(reason); // tslint:disable-line:no-console
            })
            .then(() => done());
    },
    type: REQUEST_CELL_LINE_DATA,
});

const requestCellFileInfoData = createLogic({
    process(deps: ReduxLogicDeps, dispatch: any, done: any) {
        const { imageDataSet } = deps;

        return imageDataSet
            .getFileInfo()
            .then((data: MetadataStateBranch) => {
                console.log('file info', data)
              dispatch(receiveFileInfoData(data))})
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
        const state = getState();
        let measuredFeatureNames;
        let xAxisDefaultValue;
        let yAxisDefaultValue;
        const actions: AnyAction[] = [];
        if (imageDataSet.getMeasuredFeatureNames) {
            measuredFeatureNames = await imageDataSet.getMeasuredFeatureNames();
            xAxisDefaultValue = find(measuredFeatureNames, {displayName: INITIAL_PLOT_BY_ON_X});
            yAxisDefaultValue = find(measuredFeatureNames, {displayName: INITIAL_PLOT_BY_ON_Y})
            actions.push(changeAxis(X_AXIS_ID, xAxisDefaultValue.key));
            actions.push(changeAxis(X_AXIS_ID, yAxisDefaultValue.key));

            actions.push(receiveMeasuredFeatureNames(measuredFeatureNames));
            
        }   

        return imageDataSet
            .getFeatureData()
            .then((data: MetadataStateBranch) => {
                actions.push(receiveMetadata(data));
                dispatch(batchActions(actions));
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
    process(deps: ReduxLogicDeps) {
        const { imageDataSet } = deps;
        return imageDataSet
            .getAlbumData()
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
    requestCellFileInfoData,
    requestFeatureDataLogic,
];

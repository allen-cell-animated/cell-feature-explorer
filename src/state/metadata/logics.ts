/* eslint-disable @typescript-eslint/camelcase */
import { createLogic } from "redux-logic";
import { AnyAction } from "redux";

import { DatasetMetaData } from "../../constants/datasets";

import { ReduxLogicDeps } from "../types";
import { batchActions } from "../util";

import {
    receiveAvailableDatasets,
    receiveMeasuredFeatureDefs,
    receiveCellLineData,
    receiveMetadata,
    setLoadingText,
    stopLoading,
} from "./actions";
import { getShowSmallScreenWarning } from "./selectors";

import {
    RECEIVE_ALBUM_DATA,
    REQUEST_AVAILABLE_DATASETS,
    REQUEST_ALBUM_DATA,
    REQUEST_CELL_LINE_DATA,
    REQUEST_FEATURE_DATA,
} from "./constants";
import { CellLineDef, DataForPlot } from "./types";
import { ARRAY_OF_CELL_IDS_KEY } from "../../constants";
import {
    selectPoint,
    selectCellFor3DViewer,
    requestCellFileInfoByArrayOfCellIds,
} from "../selection/actions";
import {
    getPlotByOnX,
    getPlotByOnY,
    getSelected3DCell,
    getSelectedIdsFromUrl,
} from "../selection/selectors";

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

const getRandomDataPoint = (length: number): number => {
    return Math.floor(Math.random() * length);
};

const isVisiblePoint = (
    xValues: (number | null)[],
    yValues: (number | null)[],
    index: number
): boolean => {
    return xValues[index] !== null && yValues[index] !== null;
};

export const findVisibleDataPoint = (
    length: number,
    xValues: (number | null)[],
    yValues: (number | null)[]
): number => {
    const MAX_ATTEMPTS = length;
    let numAttempts = 0;
    while (numAttempts < MAX_ATTEMPTS) {
        const index = getRandomDataPoint(length);
        if (isVisiblePoint(xValues, yValues, index)) {
            return index;
        }
        numAttempts++;
    }
    return 0;
};

const requestFeatureDataLogic = createLogic({
    async process(deps: ReduxLogicDeps, dispatch: any, done: any) {
        const { getState, imageDataSet } = deps;

        const showSmallScreenWarning = getShowSmallScreenWarning(getState());
        if (showSmallScreenWarning) return;

        dispatch(setLoadingText("Loading plot data, may take several seconds to a minute..."));
        // const state = getState();
        const actions: AnyAction[] = [];
        const measuredFeatureDefs = await imageDataSet.getMeasuredFeatureDefs();
        actions.push(receiveMeasuredFeatureDefs(measuredFeatureDefs));

        return imageDataSet
            .getFeatureData()
            .then((data: DataForPlot) => {
                actions.push(receiveMetadata(data));
                dispatch(batchActions(actions));
                return data;
            })
            .then((metaDatum: DataForPlot | void) => {
                if (!metaDatum) {
                    return done();
                }
                // select first cell on both plot and load in 3D to make it clear what the user can do
                // BUT only if those selections have not been previously made (e.g., passed through URL params)
                const state = getState();
                const selectedCellIdsFromUrls = getSelectedIdsFromUrl(state);
                let selectedCellIndex = 0;
                if (selectedCellIdsFromUrls.length) {
                    dispatch(requestCellFileInfoByArrayOfCellIds(selectedCellIdsFromUrls));
                } else {
                    const ids = metaDatum.labels[ARRAY_OF_CELL_IDS_KEY];
                    const plotByOnX = getPlotByOnX(state);
                    const plotByOnY = getPlotByOnY(state);
                    const xValues = metaDatum.values[plotByOnX];
                    const yValues = metaDatum.values[plotByOnY];
                    if (plotByOnX && plotByOnY) {
                        selectedCellIndex = findVisibleDataPoint(ids.length, xValues, yValues);
                    }
                    dispatch(
                        selectPoint(metaDatum.labels[ARRAY_OF_CELL_IDS_KEY][selectedCellIndex])
                    );
                }

                if (!getSelected3DCell(state)) {
                    dispatch(
                        selectCellFor3DViewer(
                            metaDatum.labels[ARRAY_OF_CELL_IDS_KEY][selectedCellIndex]
                        )
                    );
                }

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

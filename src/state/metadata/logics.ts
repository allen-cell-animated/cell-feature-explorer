/* eslint-disable @typescript-eslint/camelcase */
import { createLogic } from "redux-logic";
import { AnyAction } from "redux";

import { DatasetMetaData } from "../../constants/datasets";

import { ReduxLogicDeps } from "../types";
import { batchActions } from "../util";

import { receiveAvailableDatasets, receiveMeasuredFeatureDefs, receiveCellLineData, receiveMetadata, setLoadingText, stopLoading } from "./actions";
import { getShowSmallScreenWarning } from "./selectors";

import {
    RECEIVE_ALBUM_DATA,
    REQUEST_AVAILABLE_DATASETS,
    REQUEST_ALBUM_DATA,
    REQUEST_CELL_LINE_DATA,
    REQUEST_FEATURE_DATA,
} from "./constants";
import { CellLineDef, DataForPlot, MappingOfMeasuredValuesArrays } from "./types";
import { ARRAY_OF_CELL_IDS_KEY } from "../../constants";
import { selectPoint, selectCellFor3DViewer, requestCellFileInfoByArrayOfCellIds } from "../selection/actions";
import { getPlotByOnX, getPlotByOnY, getSelected3DCell, getSelectedIdsFromUrl } from "../selection/selectors";

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

export const checkForNullValues = (
    length: number,
    index: number,
    plotByOnX: string,
    plotByOnY: string,
    alreadyChecked: Map<number, boolean>,
    values: MappingOfMeasuredValuesArrays
): number => {
    if (!alreadyChecked.has(index)) {
        alreadyChecked.set(index, true);
        if (values[plotByOnX][index] !== null && values[plotByOnY][index] !== null) {
            return index;
        } else {
            const randomNumber = Math.floor(Math.random() * (length + 1));
            return checkForNullValues(
                length,
                randomNumber,
                plotByOnX,
                plotByOnY,
                alreadyChecked,
                values
            );
        }
    } else {
        const randomNumber = Math.floor(Math.random() * (length + 1));
        return checkForNullValues(
            length,
            randomNumber,
            plotByOnX,
            plotByOnY,
            alreadyChecked,
            values
        );
    }
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
                    dispatch(requestCellFileInfoByArrayOfCellIds(selectedCellIdsFromUrls))
                } else {
                    const ids = metaDatum.labels[ARRAY_OF_CELL_IDS_KEY];
                    const alreadyChecked = new Map()
                    const randomNumber = Math.floor(Math.random() * (ids.length + 1));
                    const plotByOnX = getPlotByOnX(state);
                    const plotByOnY = getPlotByOnY(state);
                    if (plotByOnX && plotByOnY) {
                        selectedCellIndex = checkForNullValues(
                            ids.length,
                            randomNumber,
                            plotByOnX,
                            plotByOnY,
                            alreadyChecked,
                            metaDatum.values
                        );

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

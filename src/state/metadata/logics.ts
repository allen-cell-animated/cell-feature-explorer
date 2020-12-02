/* eslint-disable @typescript-eslint/camelcase */
import { QueryDocumentSnapshot } from "@firebase/firestore-types";
import { isEmpty, find } from "lodash";
import { createLogic } from "redux-logic";
import { AnyAction } from "redux";
import {
    ARRAY_OF_CELL_IDS_KEY,
    X_AXIS_ID,
    Y_AXIS_ID,
} from "../../constants";
import { changeAxis, selectCellFor3DViewer, selectPoint } from "../selection/actions";
import { INITIAL_PLOT_BY_ON_X, INITIAL_PLOT_BY_ON_Y } from "../selection/constants";
import { getClickedScatterPoints, getSelected3DCell } from "../selection/selectors";
import { ReduxLogicDeps } from "../types";
import { batchActions } from "../util";

import { receiveCellLineData, receiveFileInfoData, receiveMeasuredFeatureNames, receiveMetadata, receivePageOfMeasuredFeaturesValues, setIsLoading } from "./actions";
import {
    RECEIVE_ALBUM_DATA,
    REQUEST_ALBUM_DATA,
    REQUEST_CELL_FILE_INFO,
    REQUEST_CELL_LINE_DATA,
    REQUEST_FEATURE_DATA,
} from "./constants";
import { CellLineDef, FileInfo, MetadataStateBranch } from "./types";
import { PageReturn } from "../image-dataset/types";

const requestCellLineDefs = createLogic({
    process(deps: ReduxLogicDeps, dispatch: any, done: any) {
        const { imageDataSet } = deps;

        return imageDataSet
            .getCellLineData()
            .then((data: CellLineDef[]) => dispatch(receiveCellLineData(data)))
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
        if (!imageDataSet.getFileInfo) {
            const data: FileInfo[] = [];
            return Promise.resolve(data);
        }

        return imageDataSet
            .getFileInfo()
            .then((data: FileInfo[]) => {
                console.log(data)
                dispatch(receiveFileInfoData(data))})
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
        let measuredFeatureNames;
        let xAxisDefaultValue;
        let yAxisDefaultValue;
        const actions: AnyAction[] = [];
        if (imageDataSet.getMeasuredFeatureNames) {
            measuredFeatureNames = await imageDataSet.getMeasuredFeatureNames();
            xAxisDefaultValue = find(measuredFeatureNames, {displayName: INITIAL_PLOT_BY_ON_X});
            yAxisDefaultValue = find(measuredFeatureNames, {displayName: INITIAL_PLOT_BY_ON_Y});
            if (xAxisDefaultValue) {
                actions.push(changeAxis(X_AXIS_ID, xAxisDefaultValue.key));
            }
            if (yAxisDefaultValue) {
                actions.push(changeAxis(Y_AXIS_ID, yAxisDefaultValue.key));
            }

            actions.push(receiveMeasuredFeatureNames(measuredFeatureNames));
            actions.push(setIsLoading(false));

        }
        
        return imageDataSet
            .getFeatureData()
            .then(async (returned: PageReturn) => {
                if (returned.dataset) {
                    actions.push(receivePageOfMeasuredFeaturesValues(returned.dataset));
                }
                dispatch(batchActions(actions));

                const processOnePage = async (lastVisible: QueryDocumentSnapshot) => {
                    if (imageDataSet.getPageOfFeatureData) {
                        const nextData = await imageDataSet.getPageOfFeatureData(lastVisible);
                        if (!nextData) {
                            return;
                        }
                        if (nextData.dataset) {
                            dispatch(receivePageOfMeasuredFeaturesValues(nextData.dataset));
                        }
                        if (nextData.next) {
                            await processOnePage(nextData.next);
                        }
                    }
                };
                if (returned.next) {
                    await processOnePage(returned.next);
                }
                return returned.dataset;
            })
            .then((metaDatum: MetadataStateBranch | null) => {
                if (!metaDatum) {
                    return done();
                }
                const secondBatch = [];
                // select first cell on both plot and load in 3D to make it clear what the user can do
                // BUT only if those selections have not been previously made (e.g., passed through URL params)
                const state = getState();

                if (isEmpty(getClickedScatterPoints(state))) {
                    secondBatch.push(selectPoint(metaDatum[ARRAY_OF_CELL_IDS_KEY[0]]));
                }

                if (!getSelected3DCell(state)) {
                    secondBatch.push(selectCellFor3DViewer(metaDatum[ARRAY_OF_CELL_IDS_KEY][0]));
                }
                if (!isEmpty(secondBatch)) {
                    dispatch(batchActions(secondBatch));
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

import { find } from "lodash";
import { AnyAction, Reducer } from "redux";

import { APP_ID, CELL_ID_KEY } from "../constants";

import { DiscreteMeasuredFeatureDef, FileInfo, MeasuredFeatureDef } from "./metadata/types";
import { BatchedAction, TypeToDescriptionMap } from "./types";

export function makeConstant(associatedReducer: string, actionType: string) {
    return `${APP_ID}/${associatedReducer.toUpperCase()}/${actionType.toUpperCase()}`;
}

export function makeReducer<S>(
    typeToDescriptionMap: TypeToDescriptionMap,
    initialState: S
): Reducer<S> {
    return (state: S = initialState, action: AnyAction) => {
        const description = typeToDescriptionMap[action.type];
        if (!description) {
            return state;
        }

        if (description.accepts(action)) {
            return description.perform(state, action);
        }

        return state;
    };
}

const BATCH_ACTIONS = makeConstant("batch", "batch-actions");

export function batchActions(actions: AnyAction[], type: string = BATCH_ACTIONS): BatchedAction {
    return { type, batch: true, payload: actions };
}

function actionIsBatched(action: AnyAction): action is BatchedAction {
    return action && action.batch && Array.isArray(action.payload);
}

export function enableBatching<S>(reducer: Reducer<S>, initialState: S): Reducer<S> {
    return function batchingReducer(state: S = initialState, action: AnyAction): S {
        if (actionIsBatched(action)) {
            return action.payload.reduce(batchingReducer, state);
        }
        return reducer(state, action);
    };
}

export function getFileInfoDatumFromCellId(
    fileInfoArray: FileInfo[],
    cellId: string
): FileInfo | undefined {
    return find(fileInfoArray, (datum: FileInfo) => datum[CELL_ID_KEY].toString() === cellId);
}

export function convertFullFieldIdToDownloadId(id: number | string): string {
    // Only attach prefix if id is a number (not already prefixed with a letter)
    if (!isNaN(Number(id))) {
        return `F${id}`;
    } else {
        return id as string;
    }
}

export function convertSingleImageIdToDownloadId(id: string): string {
    // Only attach prefix if id is a number (not already prefixed with a letter)
    if (!isNaN(Number(id))) {
        return `C${id}`;
    } else {
        return id;
    }
}

export function formatDownloadOfIndividualFile(root: string, id: string): string {
    return `${root}&id=${id}`;
}

export function formatThumbnailSrc(thumbnailRoot: string, item: FileInfo): string {
    if (!thumbnailRoot || !item || !item.thumbnailPath) {
        return "";
    }
    return `${thumbnailRoot}/${item.thumbnailPath}`;
}

export function findFeature(features: MeasuredFeatureDef[], searchKey: string) {
    return find(features, { key: searchKey });
}

export function getCategoryString(
    groupByFeatureDef: DiscreteMeasuredFeatureDef,
    optionKey: string
) {
    const groupCategoryInfo = groupByFeatureDef.options[optionKey];
    // key is the most specific but only used if the names are not unique.
    // name is the display name for the category.
    return groupCategoryInfo.key || groupCategoryInfo.name;
}

import { find } from "lodash";
import type { Action, Reducer } from "redux";

import { APP_ID, CELL_ID_KEY } from "../constants";

import { DiscreteMeasuredFeatureDef, FileInfo, MeasuredFeatureDef } from "./metadata/types";
import { BatchedAction, TypeToDescriptionMap } from "./types";

const HTTP_REGEX = /^https?:\/\//;

export function makeConstant<R extends string, A extends string>(
    associatedReducer: R,
    actionType: A
): `${typeof APP_ID}/${Uppercase<R>}/${Uppercase<A>}` {
    return `${APP_ID}/${associatedReducer.toUpperCase() as Uppercase<R>}/${
        actionType.toUpperCase() as Uppercase<A>
    }`;
}

export function makeReducer<S>(
    typeToDescriptionMap: TypeToDescriptionMap,
    initialState: S
): Reducer<S> {
    return (state: S = initialState, action: Action) => {
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

export const BATCH_ACTIONS = makeConstant("batch", "batch-actions");

export function batchActions<A extends Action>(
    actions: A[],
    type: string = BATCH_ACTIONS
): BatchedAction<A> {
    return { type, batch: true, payload: actions };
}

function actionIsBatched<A extends Action>(action: Action): action is BatchedAction<A> {
    return (
        action &&
        (action as BatchedAction).batch &&
        Array.isArray((action as BatchedAction).payload)
    );
}

export function enableBatching<S, A extends Action = Action>(
    reducer: Reducer<S, A>,
    initialState: S
): Reducer<S, A | BatchedAction<A>> {
    return function batchingReducer(state: S = initialState, action: A | BatchedAction<A>): S {
        if (actionIsBatched<A>(action)) {
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
    // if no downloadRoot is present, then return empty string
    return root === "" ? "" : `${root}&id=${id}`;
}

export function formatThumbnailSrc(thumbnailRoot: string, thumbnailPath: string): string {
    // Don't modify HTTP(S) thumbnail paths
    if (HTTP_REGEX.test(thumbnailPath)) {
        return thumbnailPath;
    }
    if (!thumbnailRoot || !thumbnailPath) {
        return "";
    }
    return `${thumbnailRoot}/${thumbnailPath}`;
}

export function findFeature(features: MeasuredFeatureDef[], searchKey: string) {
    return find(features, { key: searchKey });
}

export function getCategoryString(
    groupByFeatureDef: DiscreteMeasuredFeatureDef,
    optionKey?: string
): string {
    if (!optionKey) {
        return "";
    }
    if (!groupByFeatureDef.options) {
        return "" + optionKey;
    }
    const groupCategoryInfo = groupByFeatureDef.options[optionKey];
    // key is the most specific but only used if the names are not unique.
    // name is the display name for the category.
    return groupCategoryInfo.key || groupCategoryInfo.name;
}

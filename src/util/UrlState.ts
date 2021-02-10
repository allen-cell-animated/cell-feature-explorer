import {
    castArray,
    includes,
    isBoolean,
    isEmpty,
    isNaN,
    isNil,
    isString,
    map,
    mergeWith,
    reduce,
} from "lodash";
import { AnyAction } from "redux";

import {
    COLOR_BY_SELECTOR,
    X_AXIS_ID,
    Y_AXIS_ID,
} from "../constants";
import {
    changeAxis,
    changeDataset,
    selectAlbum,
    selectCellFor3DViewer,
    selectPoint,
    toggleGallery,
} from "../state/selection/actions";
import { initialState } from "../state/selection/reducer";
import { SelectionStateBranch } from "../state/selection/types";

export enum URLSearchParam {
    cellSelectedFor3D = "cellSelectedFor3D",
    colorBy = "colorBy",
    dataset = "dataset",
    plotByOnX = "plotByOnX",
    plotByOnY = "plotByOnY",
    selectedPoint = "selectedPoint",
    selectedAlbum = "selectedAlbum",
    galleryCollapsed = "galleryCollapsed",
}

type StateValue = string | number | number[] | boolean;
type URLSearchParamValue = string | string[];

export interface URLSearchParamMap {
    [index: string]: URLSearchParamValue;
}

interface URLSearchParamToActionCreatorMap {
    [index: string]: (value: URLSearchParamValue, collection: URLSearchParamMap) => AnyAction | AnyAction[];
}

interface URLSearchParamToStateMap {
    [index: string]: (value: URLSearchParamValue, collection: URLSearchParamMap) => { [key: string]: StateValue };
}

interface StateToUrlSearchParamMap {
    [index: string]: (value: StateValue) => { [key: string]: URLSearchParamValue };
}

export default class UrlState {
    public static toAppState(searchParameterMap: URLSearchParamMap): Partial<SelectionStateBranch> {
        const initial: Partial<SelectionStateBranch> = {};
        return reduce(searchParameterMap, (accum, searchParamValue, searchParamKey) => {
           if (UrlState.urlParamToStateMap.hasOwnProperty(searchParamKey)) {
               const result = UrlState.urlParamToStateMap[searchParamKey](searchParamValue, searchParameterMap);
               return mergeWith({}, accum, result, (accumValue, resultValue) => {
                   if (Array.isArray(accumValue)) {
                       return accumValue.concat(resultValue);
                   }
               });
           }
           return accum;
        }, initial);
    }

    public static toReduxActions(searchParameterMap: URLSearchParamMap): AnyAction[] {
        const initial: AnyAction[] = [];
        return reduce(searchParameterMap, (accum, searchParamValue, searchParamKey) => {
            if (UrlState.urlParamToActionCreatorMap.hasOwnProperty(searchParamKey)) {
                const action = UrlState.urlParamToActionCreatorMap[searchParamKey](
                    searchParamValue,
                    searchParameterMap
                );

                if (action) {
                    return [...accum, ...castArray(action)];
                }
            }
            return accum;
        }, initial);
    }

    public static toUrlSearchParameterMap(selections: Partial<SelectionStateBranch>): URLSearchParamMap {
        const initial: URLSearchParamMap = {};
        return reduce(selections, (accum, selectionStateValue, selectionStateKey) => {
            if (
                UrlState.stateToUrlParamMap.hasOwnProperty(selectionStateKey) &&
                UrlState.valueIsMeaningfulToSerialize(selectionStateValue) &&
                UrlState.valueIsNotDefault(selectionStateValue, selectionStateKey)
            ) {
                return {
                    ...accum,
                    ...this.stateToUrlParamMap[selectionStateKey](selectionStateValue),
                };
            }
            return accum;
        }, initial);
    }

    private static urlParamToActionCreatorMap: URLSearchParamToActionCreatorMap = {
        [URLSearchParam.cellSelectedFor3D]: (cellId, params) => {
            const selectCellFor3DAction = selectCellFor3DViewer(Number(cellId));

            // add this cell to the list of selected points if it does not already exist
            if (!includes(castArray(params[URLSearchParam.selectedPoint]), cellId)) {
                return [selectPoint(Number(cellId)), selectCellFor3DAction];
            }

            return selectCellFor3DAction;
        },
        [URLSearchParam.colorBy]: (colorBy) => changeAxis(COLOR_BY_SELECTOR, String(colorBy)),
        [URLSearchParam.dataset]: (id) => changeDataset(String(id)),
        [URLSearchParam.galleryCollapsed]: (galleryCollapsed) => toggleGallery(galleryCollapsed === "true"),
        [URLSearchParam.plotByOnX]: (plotByOnX) => changeAxis(X_AXIS_ID, String(plotByOnX)),
        [URLSearchParam.plotByOnY]: (plotByOnY) => changeAxis(Y_AXIS_ID, String(plotByOnY)),
        [URLSearchParam.selectedAlbum]: (album) => selectAlbum(Number(album)),
        [URLSearchParam.selectedPoint]: (selection) => {
            if (Array.isArray(selection)) {
                return map<number | string, AnyAction>(selection, (point) => selectPoint(Number(point)));
            }
            return selectPoint(Number(selection));
        },
    };

    private static urlParamToStateMap: URLSearchParamToStateMap = {
        [URLSearchParam.cellSelectedFor3D]: (cellId, params) => {
            const base = { cellSelectedFor3D: Number(cellId) };

            // add this cell to the list of selected points if it does not already exist
            if (!includes(castArray(params[URLSearchParam.selectedPoint]), cellId)) {
                Object.assign(base, { selectedPoints: [Number(cellId)] });
            }

            return base;
        },
        [URLSearchParam.colorBy]: (colorBy) => ({ [COLOR_BY_SELECTOR]: String(colorBy) }),
        [URLSearchParam.dataset]: (id) => ({dataset: String(id)}),
        [URLSearchParam.galleryCollapsed]: (galleryCollapsed) => ({ galleryCollapsed: galleryCollapsed === "true" }),
        [URLSearchParam.plotByOnX]: (plotByOnX) => ({ [X_AXIS_ID]: String(plotByOnX) }),
        [URLSearchParam.plotByOnY]: (plotByOnY) => ({ [Y_AXIS_ID]: String(plotByOnY) }),
        [URLSearchParam.selectedAlbum]: (album) => ({ selectedAlbum: Number(album) }),
        [URLSearchParam.selectedPoint]: (selection) => ({ selectedPoints: map(castArray(selection), Number) }),
    };

    private static stateToUrlParamMap: StateToUrlSearchParamMap = {
        
        cellSelectedFor3D: (value) => ({ [URLSearchParam.cellSelectedFor3D]: String(value) }),
        [COLOR_BY_SELECTOR]: (value) => ({ [URLSearchParam.colorBy]: String(value) }),
        dataset: (id) => ({ [URLSearchParam.dataset]: String(id)}),
        galleryCollapsed: (value) => ({ [URLSearchParam.galleryCollapsed]: String(value)}),
        selectedAlbum: (value) => ({ [URLSearchParam.selectedAlbum]: String(value) }),
        selectedPoints: (value) => ({ [URLSearchParam.selectedPoint]: map(castArray(value as number[]), String) }),
        [X_AXIS_ID]: (value) => ({ [URLSearchParam.plotByOnX]: String(value) }),
        [Y_AXIS_ID]: (value) => ({ [URLSearchParam.plotByOnY]: String(value) }),
    };

    private static valueIsMeaningfulToSerialize(selection: any): boolean {
        /**
         * Return false if value is not a boolean and it is an empty array, empty string, NaN, undefined, or null
         * Else, return true
         */
        if (isBoolean(selection)) {
            return true;
        }

        if (Array.isArray(selection) || isString(selection)) {
            return !isEmpty(selection);
        }

        return !isNaN(selection) && !isNil(selection);
    }

    private static valueIsNotDefault(selection: any, key: string): boolean {

        return (initialState as any)[key] !== selection
        
    }
}

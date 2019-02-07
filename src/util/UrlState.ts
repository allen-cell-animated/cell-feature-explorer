import {
    castArray,
    isBoolean,
    isEmpty,
    isNaN,
    isNil,
    isString,
    map,
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
    selectCellFor3DViewer,
    selectPoint,
} from "../state/selection/actions";
import { SelectionStateBranch } from "../state/selection/types";

export enum URLSearchParam {
    cellSelectedFor3D = "cellSelectedFor3D",
    colorBy = "colorBy",
    plotByOnX = "plotByOnX",
    plotByOnY = "plotByOnY",
    selectedPoint = "selectedPoint",
}

type StateValue = string | number | number[] | boolean;
type URLSearchParamValue = string | string[];

export interface URLSearchParamMap {
    [index: string]: URLSearchParamValue;
}

interface URLSearchParamToActionCreatorMap {
    [index: string]: (value: URLSearchParamValue) => AnyAction | AnyAction[] | undefined;
}

interface URLSearchParamToStateMap {
    [index: string]: (value: URLSearchParamValue) => { [key: string]: StateValue };
}

interface StateToUrlSearchParamMap {
    [index: string]: (value: StateValue) => { [key: string]: URLSearchParamValue };
}

export default class UrlState {
    private urlParamToActionCreatorMap: URLSearchParamToActionCreatorMap = {
        [URLSearchParam.cellSelectedFor3D]: (cellId) => selectCellFor3DViewer(Number(cellId)),
        [URLSearchParam.colorBy]: (colorBy) => changeAxis(COLOR_BY_SELECTOR, String(colorBy)),
        [URLSearchParam.plotByOnX]: (plotByOnX) => changeAxis(X_AXIS_ID, String(plotByOnX)),
        [URLSearchParam.plotByOnY]: (plotByOnY) => changeAxis(Y_AXIS_ID, String(plotByOnY)),
        [URLSearchParam.selectedPoint]: (selection) => {
            if (Array.isArray(selection)) {
                return map<number | string, AnyAction>(selection, (point) => selectPoint(Number(point)));
            }
            return selectPoint(Number(selection));
        },
    };

    private urlParamToStateMap: URLSearchParamToStateMap = {
        [URLSearchParam.cellSelectedFor3D]: (cellId) => ({ cellSelectedFor3D: Number(cellId) }),
        [URLSearchParam.colorBy]: (colorBy) => ({ [COLOR_BY_SELECTOR]: String(colorBy) }),
        [URLSearchParam.plotByOnX]: (plotByOnX) => ({ [X_AXIS_ID]: String(plotByOnX) }),
        [URLSearchParam.plotByOnY]: (plotByOnY) => ({ [Y_AXIS_ID]: String(plotByOnY) }),
        [URLSearchParam.selectedPoint]: (selection) => ({ selectedPoints: map(castArray(selection), Number) }),
    };

    private stateToUrlParamMap: StateToUrlSearchParamMap = {
        cellSelectedFor3D: (value) => ({ [URLSearchParam.cellSelectedFor3D]: String(value) }),
        [COLOR_BY_SELECTOR]: (value) => ({ [URLSearchParam.colorBy]: String(value) }),
        selectedPoints: (value) => ({ [URLSearchParam.selectedPoint]: map(castArray(value as number[]), String) }),
        [X_AXIS_ID]: (value) => ({ [URLSearchParam.plotByOnX]: String(value) }),
        [Y_AXIS_ID]: (value) => ({ [URLSearchParam.plotByOnY]: String(value) }),
    };

    public toAppState(searchParameterMap: URLSearchParamMap): Partial<SelectionStateBranch> {
        const initial: Partial<SelectionStateBranch> = {};
        return reduce(searchParameterMap, (accum, searchParamValue, searchParamKey) => {
           if (this.urlParamToStateMap.hasOwnProperty(searchParamKey)) {
               return {
                   ...accum,
                   ...(this.urlParamToStateMap[searchParamKey](searchParamValue)),
               };
           }
           return accum;
        }, initial);
    }

    public toReduxActions(searchParameterMap: URLSearchParamMap): AnyAction[] {
        const initial: AnyAction[] = [];
        return reduce(searchParameterMap, (accum, searchParamValue, searchParamKey) => {
            if (this.urlParamToActionCreatorMap.hasOwnProperty(searchParamKey)) {
                const action = this.urlParamToActionCreatorMap[searchParamKey](searchParamValue);

                if (action) {
                    return [...accum, ...castArray(action)];
                }
            }
            return accum;
        }, initial);
    }

    public toUrlSearchParameterMap(selections: Partial<SelectionStateBranch>): URLSearchParamMap {
        const initial: URLSearchParamMap = {};
        return reduce(selections, (accum, selectionStateValue, selectionStateKey) => {
            if (
                this.stateToUrlParamMap.hasOwnProperty(selectionStateKey) &&
                UrlState.valueIsMeaningfulToSerialize(selectionStateValue)
            ) {
                return {
                    ...accum,
                    ...this.stateToUrlParamMap[selectionStateKey](selectionStateValue),
                };
            }
            return accum;
        }, initial);
    }

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
}

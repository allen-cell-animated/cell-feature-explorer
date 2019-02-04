import {
    castArray,
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
    toggleShowClusters,
} from "../state/selection/actions";
import { SelectionStateBranch } from "../state/selection/types";

export enum URLSearchParam {
    cellSelectedFor3D,
    colorBy,
    plotByOnX,
    plotByOnY,
    selectedPoint,
    showClusters,
}

type URLSearchParamValue = string | number | boolean | string[] | number[];

export interface URLSearchParamMap {
    [index: string]: URLSearchParamValue;
}

interface URLSearchParamToActionCreatorMap {
    [index: string]: (value: URLSearchParamValue, searchParamMap: URLSearchParamMap) =>
        AnyAction | AnyAction[] | undefined;
}

interface StateToUrlSearchParamMap {
    [index: string]: (value: any) => { [key: string]: URLSearchParamValue };
}

export default class UrlState {
    private urlParamToActionCreatorMap: URLSearchParamToActionCreatorMap = {
        [URLSearchParam.cellSelectedFor3D]: (cellId) => selectCellFor3DViewer(Number(cellId)),
        [URLSearchParam.colorBy]: (colorBy) => changeAxis(COLOR_BY_SELECTOR, String(colorBy)),
        [URLSearchParam.plotByOnX]: (plotByOnX) => changeAxis(X_AXIS_ID, String(plotByOnX)),
        [URLSearchParam.plotByOnY]: (plotByOnY) => changeAxis(Y_AXIS_ID, String(plotByOnY)),
        [URLSearchParam.selectedPoint]: (selection) => {
            if (Array.isArray(selection)) {
                return map<number | string, AnyAction>(selection, (point) => selectPoint(Number(point)))
            }
            return selectPoint(Number(selection))
        },
        [URLSearchParam.showClusters]: (showClusters) => toggleShowClusters(Boolean(showClusters)),
    };

    private stateToUrlParamMap: StateToUrlSearchParamMap = {
        cellSelectedFor3D: (value) => ({ [URLSearchParam.cellSelectedFor3D]: value }),
        [COLOR_BY_SELECTOR]: (value) => ({ [URLSearchParam.colorBy]: value }),
        selectedPoints: (value) => ({ [URLSearchParam.selectedPoint]: value }),
        showClusters: (value) => ({ [URLSearchParam.showClusters]: value }),
        [X_AXIS_ID]: (value) => ({ [URLSearchParam.plotByOnX]: value }),
        [Y_AXIS_ID]: (value) => ({ [URLSearchParam.plotByOnY]: value }),
    };

    public toReduxActions(searchParameterMap: URLSearchParamMap): AnyAction[] {
        const initial: AnyAction[] = [];
        return reduce(searchParameterMap, (accum, searchParamValue, searchParamKey) => {
            if (this.urlParamToActionCreatorMap.hasOwnProperty(searchParamKey)) {
                const action = this.urlParamToActionCreatorMap[searchParamKey](searchParamValue, searchParameterMap);

                if (action) {
                    return [...accum, ...castArray(action)];
                }
            }
            return accum;
        }, initial);
    }

    public toUrlSearchParameterMap(selections: Partial<SelectionStateBranch>) {
        const initial: URLSearchParamMap = {};
        return reduce(selections, (accum, selectionStateValue, selectionStateKey) => {
            if (this.stateToUrlParamMap.hasOwnProperty(selectionStateKey)) {
                return {
                    ...accum,
                    ...this.stateToUrlParamMap[selectionStateKey](selectionStateValue),
                };
            }
            return accum;
        }, initial);
    }
}

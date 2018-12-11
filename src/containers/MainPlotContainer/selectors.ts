import {
    map,
} from "lodash";

import { createSelector } from "reselect";

import {
    CLUSTERS_PLOT_NAME,
    GENERAL_PLOT_SETTINGS,
    SCATTER_PLOT_NAME,
    SELECTIONS_PLOT_NAME,
} from "../../constants";

import { PlotData } from "../../state/plotlyjs-types";
import {
    getApplyColorToSelections,
    getClusteringResult,
    getClustersOn,
    getMainPlotData,
    getSelectedGroupsData
} from "../../state/selection/selectors";
import {
    ContinuousPlotData,
    GroupedPlotData
} from "../../state/types";

function isGrouped(plotData: GroupedPlotData | ContinuousPlotData): plotData is GroupedPlotData {
    return plotData.groupBy === true;
}

export const composePlotlyData = createSelector([
        getMainPlotData,
        getApplyColorToSelections,
        getClustersOn,
        getSelectedGroupsData,
        getClusteringResult,
    ], (
        mainPlotDataValues,
        applyColorToSelections,
        showClusters,
        selectedGroups,
        clusteringResultData
): any => {
    const mainPlotData = {
        ...mainPlotDataValues,
        groupSettings : isGrouped(mainPlotDataValues) ? {
            ...mainPlotDataValues.groupSettings,
        } : null,
        plotName: SCATTER_PLOT_NAME,
    };

    const selectedGroupPlotData = applyColorToSelections ? {
        ...selectedGroups,
        groupBy: false,
        plotName: SELECTIONS_PLOT_NAME,
    } : null;
    const clusteringPlotData = showClusters ? {
        ...clusteringResultData,
        groupBy: false,
        plotName: CLUSTERS_PLOT_NAME,
    } : null;

    return {
        clusteringPlotData,
        mainPlotData,
        selectedGroupPlotData,
    };
});

function colorSettings(
    plotSettings: Partial<PlotData>,
    plotData: GroupedPlotData| ContinuousPlotData): Partial<PlotData> {
    if (isGrouped(plotData)) {
        return {
            ...plotSettings,
            transforms: [ {
                groups: plotData.groups,
                nameformat: `%{group}`,
                styles: map(plotData.groupSettings, (ele, index: number) => {
                    return {
                        target: ele.name,
                        value: {
                            marker:
                                {
                                    color: ele.color,
                                    opacity: ele.opacity,
                                }},
                    };
                }),
                // literal typing to avoid a widened type inferred
                type: "groupby" as "groupby",
            },
            ],
        };
    }

    return {
        ...plotSettings,
        marker: {
            ...plotSettings.marker,
            color: plotData.color,
            opacity: plotData.opacity  || GENERAL_PLOT_SETTINGS.unselectedCircleOpacity,
        },
    };
}

function makeScatterPlotData(plotData: ContinuousPlotData | GroupedPlotData): Partial<PlotData> {
    const plotSettings =  {
        marker: {
            size: GENERAL_PLOT_SETTINGS.circleRadius,
            symbol: "circle",
        },
        // literal typing to avoid a widened type inferred
        mode: "markers" as "markers",
        name: plotData.plotName,
        showlegend: false,
        // literal typing to avoid a widened type inferred
        type: "scattergl" as "scattergl",
        x: plotData.x,
        y: plotData.y,
        z: [],
    };
    return colorSettings(plotSettings, plotData);
}

function makeHistogramPlotX(data: number[]) {
    return {
        marker: {
            color: GENERAL_PLOT_SETTINGS.histogramColor,
            line: {
                color: GENERAL_PLOT_SETTINGS.textColor,
                width: 1,
            },
        },
        name: `x histogram`,
        nbinsx: 60,
        showlegend: false,
        // literal typing to avoid a widened type inferred
        type: "histogram" as "histogram",
        x: data,
        yaxis: "y2",

    };
}
function makeHistogramPlotY(data: number[]) {
    return {
        marker: {
            color: GENERAL_PLOT_SETTINGS.histogramColor,
            line: {
                color: GENERAL_PLOT_SETTINGS.textColor,
                width: 1,
            },
        },
        name: `y histogram`,
        nbinsy: 60,
        showlegend: false,
        // literal typing to avoid a widened type inferred
        type: "histogram" as "histogram",
        xaxis: "x2",
        y: data,

    };
}

export const getScatterPlotDataArray = createSelector([composePlotlyData], (allPlotData) => {
    const {
        mainPlotData,
        selectedGroupPlotData,
        clusteringPlotData,
    } = allPlotData;
    const data = [
        makeHistogramPlotX(mainPlotData.x),
        makeHistogramPlotY(mainPlotData.y),
        makeScatterPlotData(mainPlotData),
    ];
    if (clusteringPlotData) {
        data.push(makeScatterPlotData(clusteringPlotData));
    }
    if (selectedGroupPlotData) {
        data.push(makeScatterPlotData(selectedGroupPlotData));
    }
    return data;
});

import {
    includes,
    map,
    max,
    min,
    range,
    round,
} from "lodash";
import { createSelector } from "reselect";
import { $enum, EnumWrapper, WidenEnumType } from "ts-enum-util";

import {
    CATEGORICAL_FEATURES, CATEGORY_ENUM, CATEGORY_TO_COLOR_LOOKUP,
    CLUSTERS_PLOT_NAME,
    GENERAL_PLOT_SETTINGS,
    getLabels,
    MITOTIC_COLORS,
    MITOTIC_STAGE_KEY,
    PROTEIN_NAME_KEY,
    SCATTER_PLOT_NAME,
    SELECTIONS_PLOT_NAME,
} from "../../constants";
import { getFeatureNames, getProteinNames } from "../../state/metadata/selectors";
import { PlotData } from "../../state/plotlyjs-types";
import {
    getApplyColorToSelections,
    getClusteringResult,
    getClustersOn,
    getColorBySelection,
    getColorByValues,
    getFilteredFileInfo,
    getIds,
    getPlotByOnX,
    getPlotByOnY,
    getProteinColors,
    getSelectedGroupsData,
    getXValues,
    getYValues,
} from "../../state/selection/selectors";
import { TickConversion } from "../../state/selection/types";
import {
    ContinuousPlotData,
    GroupedPlotData,
} from "../../state/types";

function isGrouped(plotData: GroupedPlotData | ContinuousPlotData): plotData is GroupedPlotData {
    return plotData.groupBy === true;
}

const getColorsForPlot = (colorBy: string, proteinNames: string[], proteinColors: string[]) => {
    if (colorBy === PROTEIN_NAME_KEY) {
        return map(proteinNames, (name: string, index) => {
            return {
                color: proteinColors[index],
                name,
            };
        });
    } else if (includes(CATEGORICAL_FEATURES, colorBy)) {
        const colors = CATEGORY_TO_COLOR_LOOKUP[colorBy];
        return map(colors, (value, key) => {
            return {
                color: value,
                name: key,
            };
        });
    }
    return null;
};

export const getMainPlotData = createSelector(
    [
        getXValues,
        getYValues,
        getIds,
        getFilteredFileInfo,
        getColorByValues,
        getColorBySelection,
        getProteinColors,
        getProteinNames,
    ],
    (
        xValues,
        yValues,
        ids,
        filteredFileInfo,
        colorByValues,
        colorBy,
        proteinColors,
        proteinNames
    ): GroupedPlotData | ContinuousPlotData => {
        return {
            color: colorBy === PROTEIN_NAME_KEY ? undefined : colorByValues,
            groupBy: includes(CATEGORICAL_FEATURES, colorBy),
            groupSettings: getColorsForPlot(colorBy, proteinNames, proteinColors),
            groups: colorByValues,
            ids,
            x: xValues,
            y: yValues,
        };
    }
);

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
                                    opacity: GENERAL_PLOT_SETTINGS.unselectedCircleOpacity,
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
        hoverinfo: "none" as "none",
        ids: plotData.ids,
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

export const getXDisplayOptions = createSelector([getFeatureNames], (featureNames): string[] => {
    return featureNames;
});

export const getYDisplayOptions = createSelector([getFeatureNames], (featureNames): string[] => {
    return featureNames;
});

export const getColorByDisplayOptions = createSelector([getFeatureNames], (featureNames): string[] => {
    if (!includes(featureNames, PROTEIN_NAME_KEY)) {
        return [PROTEIN_NAME_KEY, ...featureNames];
    }
    return featureNames;
});

const makeNumberToTextConversion = (categoryEnum: { [index: string]: number } ) => {
    return {
        tickText:  $enum(categoryEnum).getKeys() as string[],
        tickValues:  $enum(categoryEnum).getValues() as number[],
    };
};

const makeNumberAxis = (): TickConversion => {
    // return placeholder values for consistent data structure, plotly will auto compute the real values.
    return {
        tickText: [""],
        tickValues: [0],
    };
};

export const getXTickConversion = createSelector([getPlotByOnX, getXValues], (plotByOnX, xValues): TickConversion => {
    if (includes(CATEGORICAL_FEATURES, plotByOnX)) {
        const categoryEnum = getLabels(plotByOnX);
        if (categoryEnum) {
            return makeNumberToTextConversion(categoryEnum);
        }
    }
    return makeNumberAxis();
});

export const getYTickConversion = createSelector([getPlotByOnY, getYValues], (plotByOnY, yValues): TickConversion => {
    if (includes(CATEGORICAL_FEATURES, plotByOnY)) {
        const categoryEnum = getLabels(plotByOnY);
        if (categoryEnum) {
            return makeNumberToTextConversion(categoryEnum);
        }
    }
    return makeNumberAxis();
});

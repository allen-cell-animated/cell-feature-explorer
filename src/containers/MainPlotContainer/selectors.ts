import { includes, map, find } from "lodash";
import { createSelector } from "reselect";

import {
    GENERAL_PLOT_SETTINGS,
    PROTEIN_NAME_KEY,
    SCATTER_PLOT_NAME,
    SELECTIONS_PLOT_NAME,
} from "../../constants";
import { getCategoricalFeatureKeys, getMeasuredFeaturesDefs } from "../../state/metadata/selectors";
import { MeasuredFeatureDef, MeasuredFeaturesOptions } from "../../state/metadata/types";
import { PlotData } from "../../state/plotlyjs-types";
import {
    getApplyColorToSelections,
    getColorBySelection,
    getColorByValues,
    getColorsForPlot,
    getIds,
    getPlotByOnX,
    getPlotByOnY,
    getSelectedGroupsData,
    getThumbnailPaths,
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

export const getMainPlotData = createSelector(
    [
        getXValues,
        getYValues,
        getIds,
        getThumbnailPaths,
        getColorByValues,
        getColorBySelection,
        getColorsForPlot,
        getCategoricalFeatureKeys
    ],
    (
        xValues,
        yValues,
        ids,
        thumbnailPaths,
        colorByValues,
        colorBy,
        colorsForPlot,
        categoricalFeatures
    ): GroupedPlotData | ContinuousPlotData => {
        return {
            color: colorBy === PROTEIN_NAME_KEY ? undefined : colorByValues,
            groupBy: colorBy === PROTEIN_NAME_KEY || includes(categoricalFeatures, colorBy),
            groupSettings: colorsForPlot,
            groups: colorByValues,
            ids,
            x: xValues,
            y: yValues,
            customdata: thumbnailPaths as string[],
        };
    }
);

export const composePlotlyData = createSelector([
        getMainPlotData,
        getApplyColorToSelections,
        getSelectedGroupsData,
    ], (
        mainPlotDataValues,
        applyColorToSelections,
        selectedGroups,
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

    return {
        clusteringPlotData: null,
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
                styles: map(plotData.groupSettings, (ele) => {
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
        customdata: plotData.customdata,
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

export const getXDisplayOptions = createSelector(
           [getMeasuredFeaturesDefs],
           (featureNames): MeasuredFeatureDef[] => {
               return featureNames;
           }
       );

export const getYDisplayOptions = createSelector(
           [getMeasuredFeaturesDefs],
           (featureNames): MeasuredFeatureDef[] => {
               return featureNames;
           }
       );

export const getColorByDisplayOptions = createSelector([getMeasuredFeaturesDefs], (featureDefs): MeasuredFeatureDef[] => {
    if (!find(featureDefs, { key: PROTEIN_NAME_KEY })) {
        return [
            {
                key: PROTEIN_NAME_KEY,
                displayName: "Labeled structure name",
                discrete: true,
                unit: null,
                tooltip: "Name of the cellular structure that has been fluorescently labeled in each cell line",
            },
            ...featureDefs,
        ];
    }
    return featureDefs;
});

const makeNumberToTextConversion = (options: MeasuredFeaturesOptions) => {
    return {
        tickText:  map(options, "name"),
        tickValues:  map(options, (_, key) => Number(key)),
    };
};

const makeNumberAxis = (): TickConversion => {
    // return placeholder values for consistent data structure, plotly will auto compute the real values.
    return {
        tickText: [""],
        tickValues: [0],
    };
};

export const getXTickConversion = createSelector(
    [getPlotByOnX, getMeasuredFeaturesDefs],
    (plotByOnX, measuredFeaturesDefs: MeasuredFeatureDef[]): TickConversion => {
        const feature = find(measuredFeaturesDefs, { key: plotByOnX });
        if (feature && feature.discrete) {
            return makeNumberToTextConversion(feature.options);
        }
        return makeNumberAxis();
    }
);

export const getYTickConversion = createSelector(
    [getPlotByOnY, getMeasuredFeaturesDefs],
    (plotByOnY, measuredFeaturesDefs: MeasuredFeatureDef[]): TickConversion => {
        const feature = find(measuredFeaturesDefs, { key: plotByOnY });
        if (feature && feature.discrete) {
            return makeNumberToTextConversion(feature.options);
        }
        return makeNumberAxis();
    }
);

import { includes, map, find, findIndex, isEmpty } from "lodash";
import { createSelector } from "reselect";

import {
    ARRAY_OF_CELL_IDS_KEY,
    CELL_ID_KEY,
    FOV_ID_KEY,
    GENERAL_PLOT_SETTINGS,
    GROUP_BY_KEY,
    SCATTER_PLOT_NAME,
    SELECTIONS_PLOT_NAME,
    THUMBNAIL_PATH,
} from "../../constants";
import { getCategoricalFeatureKeys, getMeasuredFeaturesDefs } from "../../state/metadata/selectors";
import {
    DataForPlot,
    FileInfo,
    MeasuredFeatureDef,
    MeasuredFeaturesOptions,
} from "../../state/metadata/types";
import { PlotData } from "../../state/plotlyjs-types";
import {
    getApplyColorToSelections,
    getClickedCellsFileInfo,
    getColorBySelection,
    getColorByValues,
    getCategoryGroupColorsAndNames,
    getFilteredCellData,
    getHoveredCardId,
    getIds,
    getPlotByOnX,
    getPlotByOnY,
    getSelectedGroupsData,
    getThumbnailPaths,
    getFilteredXValues,
    getFilteredYValues,
    getGroupByCategory,
    getGroupingCategoryNamesAsArray,
    getHoveredPointData,
} from "../../state/selection/selectors";
import { TickConversion } from "../../state/selection/types";
import { Annotation, ContinuousPlotData, GroupedPlotData } from "../../state/types";
import { getGroupByTitle } from "../ColorByMenu/selectors";

function isGrouped(plotData: GroupedPlotData | ContinuousPlotData): plotData is GroupedPlotData {
    return plotData.groupBy === true;
}

export const handleNullValues = (
    inputXValues: (number | null)[],
    inputYValues: (number | null)[]
): { xValues: (number | null)[]; yValues: (number | null)[] } => {
    let canPlot = false;
    let xValues = inputXValues.slice();
    let yValues = inputYValues.slice();

    if (xValues.length !== yValues.length) {
        console.error(
            "Cannot handleNullValues between two arrays because they have unequal length"
        );
        return {
            xValues: xValues,
            yValues: yValues,
        };
    }

    // At every index where one array has a null value, the other array must
    // also have a null value
    for (let i = 0; i < xValues.length; i++) {
        if (xValues[i] === null) {
            yValues[i] = null;
        } else if (yValues[i] === null) {
            xValues[i] = null;
        } else {
            canPlot = true;
        }
    }

    // If both xValues and yValues only contain nulls, then set them to
    // empty arrays to avoid plotting errors
    if (!canPlot) {
        xValues = [];
        yValues = [];
    }

    return {
        xValues: xValues,
        yValues: yValues,
    };
};

export const getMainPlotData = createSelector(
    [
        getFilteredXValues,
        getFilteredYValues,
        getIds,
        getThumbnailPaths,
        getColorByValues,
        getColorBySelection,
        getGroupByCategory,
        getCategoryGroupColorsAndNames,
        getCategoricalFeatureKeys,
    ],
    (
        xValues,
        yValues,
        ids,
        thumbnailPaths,
        colorByValues,
        colorBy,
        groupBy,
        colorsForPlot,
        categoricalFeatures
    ): GroupedPlotData | ContinuousPlotData => {
        // Only preserve values at indices where both x and y values are not null,
        // because a coordinate like (3, null) won't be plotted anyway and produces
        // inaccurate histograms.
        const newXAndYValues = handleNullValues(xValues, yValues);
        return {
            color: colorBy === groupBy ? undefined : colorByValues,
            groupBy: includes(categoricalFeatures, colorBy),
            groupSettings: colorsForPlot,
            groups: colorByValues,
            ids,
            x: newXAndYValues.xValues,
            y: newXAndYValues.yValues,
            customdata: thumbnailPaths as string[],
        };
    }
);

export const getAnnotations = createSelector(
    [getFilteredCellData, getClickedCellsFileInfo, getPlotByOnX, getPlotByOnY, getHoveredCardId],
    (
        filteredCellData: DataForPlot,
        clickedCellsFileInfo: FileInfo[],
        xAxis,
        yAxis,
        currentHoveredCellId
    ): Annotation[] => {
        if (isEmpty(filteredCellData.values) || isEmpty(filteredCellData.labels)) {
            return [];
        }
        const initAcc: Annotation[] = [];
        return clickedCellsFileInfo.reduce((acc, data) => {
            const cellID = data[CELL_ID_KEY];
            const fovID = data[FOV_ID_KEY] || "";
            const thumbnailPath = data[THUMBNAIL_PATH] || "";

            const cellIds = filteredCellData.labels[ARRAY_OF_CELL_IDS_KEY];
            const pointIndex =
                data.index !== undefined ? data.index : findIndex(cellIds, (id) => id === cellID);
            const x = filteredCellData.values[xAxis][pointIndex];
            const y = filteredCellData.values[yAxis][pointIndex];
            if (pointIndex >= 0 && x !== null && y !== null) {
                acc.push({
                    cellID,
                    fovID,
                    hovered: cellID === currentHoveredCellId,
                    pointIndex,
                    x,
                    y,
                    thumbnailPath,
                });
            }
            return acc;
        }, initAcc);
    }
);

export const composePlotlyData = createSelector(
    [getMainPlotData, getApplyColorToSelections, getSelectedGroupsData],
    (mainPlotDataValues, applyColorToSelections, selectedGroups): any => {
        const mainPlotData = {
            ...mainPlotDataValues,
            groupSettings: isGrouped(mainPlotDataValues)
                ? {
                      ...mainPlotDataValues.groupSettings,
                  }
                : null,
            plotName: SCATTER_PLOT_NAME,
        };

        const selectedGroupPlotData = applyColorToSelections
            ? {
                  ...selectedGroups,
                  groupBy: false,
                  plotName: SELECTIONS_PLOT_NAME,
              }
            : null;

        return {
            mainPlotData,
            selectedGroupPlotData,
        };
    }
);

function colorSettings(
    plotSettings: Partial<PlotData>,
    plotData: GroupedPlotData | ContinuousPlotData
): Partial<PlotData> {
    if (isGrouped(plotData)) {
        return {
            ...plotSettings,
            transforms: [
                {
                    groups: plotData.groups,
                    nameformat: `%{group}`,
                    styles: map(plotData.groupSettings, (ele) => {
                        return {
                            target: ele.name,
                            value: {
                                marker: {
                                    color: ele.color,
                                    opacity: GENERAL_PLOT_SETTINGS.unselectedCircleOpacity,
                                },
                            },
                        };
                    }),
                    // literal typing to avoid a widened type inferred
                    type: "groupby" as const,
                },
            ],
        };
    }

    return {
        ...plotSettings,
        marker: {
            ...plotSettings.marker,
            color: plotData.color,
            opacity: plotData.opacity || GENERAL_PLOT_SETTINGS.unselectedCircleOpacity,
        },
    };
}

function makeScatterPlotData(plotData: ContinuousPlotData | GroupedPlotData): Partial<PlotData> {
    const plotSettings = {
        hoverinfo: "none" as const,
        ids: plotData.ids,
        customdata: plotData.customdata,
        marker: {
            size: GENERAL_PLOT_SETTINGS.circleRadius,
            symbol: "circle",
        },
        // literal typing to avoid a widened type inferred
        mode: "markers" as const,
        name: plotData.plotName,
        showlegend: false,
        // literal typing to avoid a widened type inferred
        type: "scattergl" as const,
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
        type: "histogram" as const,
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
        type: "histogram" as const,
        xaxis: "x2",
        y: data,
    };
}

export const getScatterPlotDataArray = createSelector([composePlotlyData], (allPlotData) => {
    const { mainPlotData, selectedGroupPlotData } = allPlotData;
    const data = [
        makeHistogramPlotX(mainPlotData.x),
        makeHistogramPlotY(mainPlotData.y),
        makeScatterPlotData(mainPlotData),
    ];
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

export const getColorByDisplayOptions = createSelector(
    [getMeasuredFeaturesDefs, getGroupByTitle],
    (featureDefs): MeasuredFeatureDef[] => {
        // TODO: use "exclude" in database to filter measured features
        return featureDefs;
    }
);

const makeNumberToTextConversion = (options: MeasuredFeaturesOptions) => {
    return {
        tickText: map(options, "name"),
        tickValues: map(options, (_, key) => Number(key)),
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

export const getDataForOverlayCard = createSelector(
    [getHoveredPointData, getGroupingCategoryNamesAsArray],
    (pointData, categoryNames) => {
        if (!pointData || !categoryNames.length) {
            return pointData;
        }
        return {
            ...pointData,
            [GROUP_BY_KEY]: categoryNames[pointData.index],
        };
    }
);

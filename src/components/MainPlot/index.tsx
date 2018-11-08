import {
    flatten,
    map,
    values,
} from "lodash";
import {
    Data,
    PlotMouseEvent,
    PlotSelectionEvent,
} from "plotly.js";
import React from "react";
import Plot from "react-plotly.js";

import {
    GENERAL_PLOT_SETTINGS,
    PROTEIN_NAME_KEY,
    SCATTER_PLOT_NAME,
} from "../../constants";
import {
    SelectedGroups,
} from "../../state/selection/types";
import { Annotation } from "../../state/types";

interface MainPlotProps {
    applyColorToSelections: boolean;
    colorBy: string;
    filtersToExclude: string[];
    plotData: {[key: string]: any[]};
    onPointClicked: (clicked: PlotMouseEvent) => void;
    onGroupSelected: (selected: PlotSelectionEvent) => void;
    selectedGroups: SelectedGroups;
    annotations: Annotation[];
}

export default class MainPlot extends React.Component<MainPlotProps, {}> {
    public static makeAxis(domain: number[], hoverformat: string, zeroline: boolean) {
        return {
            color: GENERAL_PLOT_SETTINGS.textColor,
            domain,
            hoverformat,
            linecolor: GENERAL_PLOT_SETTINGS.textColor,
            showgrid: false,
            tickcolor: GENERAL_PLOT_SETTINGS.textColor,
            zeroline,
        };
    }

    constructor(props: MainPlotProps) {
        super(props);
        this.makeScatterPlotData = this.makeScatterPlotData.bind(this);
        this.makeScatterPlotSelectedPointsData = this.makeScatterPlotSelectedPointsData.bind(this);
        this.makeAnnotations = this.makeAnnotations.bind(this);
        this.colorSettings = this.colorSettings.bind(this);
    }

    public makeAnnotations(): Annotation[] {
        const { annotations } = this.props;

        return annotations.map((point: Annotation) => {
            return {
                arrowhead: 6,
                ax: 0,
                ay: -30,
                bgcolor: "#a4a2a45c",
                bordercolor: "#a4a2a45c",
                borderpad: 4,
                borderwidth: 1.5,
                captureevents: true,
                cellID: point.cellID,
                cellLine: point.cellLine,
                font: {
                    color: "#ffffff",
                    family: "tahoma, arial, verdana, sans-serif",
                    size: 12,
                },
                fovID: point.fovID,
                pointIndex: point.pointIndex,
                // TODO full AICS cell name?
                text: `Cell ${point.cellID}<br><i>click to load in 3D</i>`,
                x: point.x,
                y: point.y,
            };
        });
    }

    public colorSettings(plotSettings: Data): Data {
        const {
            colorBy,
            plotData,
        } = this.props;
        if (colorBy === PROTEIN_NAME_KEY) {
            return {
                 ...plotSettings,
                 transforms: [ {
                     groups: plotData.groups,
                     nameformat: `%{group}`,
                     styles: plotData.proteinNames.map((ele: string, index: number) => {
                         return {
                             target: ele,
                             value: {
                                 marker:
                                 { color: plotData.proteinColors[index],
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
                color: plotData.groups,
            },

        };
    }

    public makeScatterPlotSelectedPointsData(): Data {
        const {
            selectedGroups,
        } = this.props;

        const allSelected = flatten(values(selectedGroups));
        const plotData = {
            marker: {
                color: map(allSelected, "groupColor"),
                opacity: GENERAL_PLOT_SETTINGS.unselectedCircleOpacity,
                size: GENERAL_PLOT_SETTINGS.circleRadius,
                symbol: "circle",
            },
            mode: "markers" as "markers",
            name: "overlay",
            showlegend: false,
            // literal typing to avoid a widened type inferred
            type: "scattergl" as "scattergl",
            x: map( allSelected, "x"),
            y: map( allSelected, "y"),
            z: [],
        };
        return plotData;

    }

    public makeScatterPlotData(): Data {
        const { plotData } = this.props;
        const plotSettings =  {
            marker: {
                opacity: GENERAL_PLOT_SETTINGS.unselectedCircleOpacity,
                size: GENERAL_PLOT_SETTINGS.circleRadius,
                symbol: "circle",
            },
            // literal typing to avoid a widened type inferred
            mode: "markers" as "markers",
            name: SCATTER_PLOT_NAME,
            showlegend: false,
            // literal typing to avoid a widened type inferred
            type: "scattergl" as "scattergl",
            x: plotData.x,
            y: plotData.y,
            z: [],
        };

        return this.colorSettings(plotSettings);
    }

    public makeHistogramPlotX(data: number[]) {
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
    public makeHistogramPlotY(data: number[]) {
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

    public render() {
        const { plotData, onPointClicked, onGroupSelected, applyColorToSelections } = this.props;
        const options = {
            displayModeBar: true,
            displaylogo: false,
            modeBarButtonsToRemove: [
                // literal typing to avoid a widened type inferred
                "sendDataToCloud" as "sendDataToCloud",
                "toImage" as "toImage",
                "resetScale2d" as "resetScale2d",
                "hoverClosestCartesian" as "hoverClosestCartesian",
                "hoverCompareCartesian" as "hoverCompareCartesian",
                "toggleSpikelines" as "toggleSpikelines",
            ],

        };
        return (
            <Plot
                data={applyColorToSelections ? [
                    this.makeHistogramPlotX(plotData.x),
                    this.makeHistogramPlotY(plotData.y),
                    this.makeScatterPlotData(),
                    this.makeScatterPlotSelectedPointsData(),
                ] : [
                    this.makeHistogramPlotX(plotData.x),
                    this.makeHistogramPlotY(plotData.y),
                    this.makeScatterPlotData(),
                ]
                }
                useResizeHandler={true}
                layout={{
                    annotations: this.makeAnnotations(),
                    autosize: true,
                    hovermode: "closest",
                    legend: GENERAL_PLOT_SETTINGS.legend,
                    margin: {
                        b: 30,
                        r: 200,
                        t: 10,
                    },
                    paper_bgcolor: GENERAL_PLOT_SETTINGS.backgroundColor,
                    plot_bgcolor: GENERAL_PLOT_SETTINGS.backgroundColor,
                    xaxis: MainPlot.makeAxis([0, 0.85], ".1f", false),
                    xaxis2: MainPlot.makeAxis([0.86, 1], "f", true),
                    yaxis: MainPlot.makeAxis([0, 0.85], ".1f", false),
                    yaxis2: MainPlot.makeAxis([0.86, 1], "f", true),

                }}
                config={options}
                onClick={onPointClicked}
                onSelected={onGroupSelected}
            />
        );
    }
}

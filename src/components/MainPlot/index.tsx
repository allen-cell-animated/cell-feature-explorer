import { map } from "lodash";
import {
    Color,
    Data,
    PlotMouseEvent,
    PlotSelectionEvent,
} from "plotly.js";
import React from "react";
import Plot from "react-plotly.js";

import {
    GENERAL_PLOT_SETTINGS,
} from "../../constants";

import {
    Annotation,
    ContinuousPlotData,
    GroupedPlotData,
} from "../../state/types";

interface MainPlotProps {
    annotations: Annotation[];
    plotDataArray: Data[];
    onPointClicked: (clicked: PlotMouseEvent) => void;
    onGroupSelected: (selected: PlotSelectionEvent) => void;
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
        this.makeAnnotations = this.makeAnnotations.bind(this);
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

    public render() {
        const { onPointClicked, onGroupSelected, plotDataArray } = this.props;
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
                data={plotDataArray}
                useResizeHandler={true}
                layout={{
                    annotations: this.makeAnnotations(),
                    autosize: true,
                    hovermode: "closest",
                    legend: GENERAL_PLOT_SETTINGS.legend,
                    margin: {
                        b: 30,
                        r: 20,
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

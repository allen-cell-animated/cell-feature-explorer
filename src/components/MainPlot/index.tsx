import { Annotations, Data, PlotMouseEvent, PlotSelectionEvent } from "plotly.js";
import React from "react";
import Plot from "react-plotly.js";
import { isEqual } from "lodash";

import { GENERAL_PLOT_SETTINGS } from "../../constants";
import { TickConversion } from "../../state/selection/types";
import { Annotation } from "../../state/types";

interface MainPlotProps {
    annotations: Annotation[];
    plotDataArray: Data[];
    onPointClicked: (clicked: PlotMouseEvent) => void;
    onPointHovered: (hovered: PlotMouseEvent) => void;
    onPointUnhovered: (unhovered: PlotMouseEvent) => void;
    onGroupSelected: (selected: PlotSelectionEvent) => void;
    xAxisType: string;
    yAxisType: string;
    xTickConversion: TickConversion;
    yTickConversion: TickConversion;
}

type AxisType = "array" | "auto" | "linear" | undefined;

interface MainPlotState {
    layout: any;
    height: any;
    showFullAnnotation: boolean;
}

type PlotlyAnnotation = Partial<Annotations>;

const histogramAxis = {
    color: GENERAL_PLOT_SETTINGS.textColor,
    domain: [0.86, 1],
    hoverformat: "f",
    linecolor: GENERAL_PLOT_SETTINGS.textColor,
    showgrid: false,
    tickcolor: GENERAL_PLOT_SETTINGS.textColor,
    zeroline: true,
};

export default class MainPlot extends React.Component<MainPlotProps, MainPlotState> {
    constructor(props: MainPlotProps) {
        super(props);
        this.makeAnnotations = this.makeAnnotations.bind(this);
        this.clickedAnnotation = this.clickedAnnotation.bind(this);

        this.state = {
            layout: {
                annotations: this.makeAnnotations(),
                autosize: true,
                height: window.innerHeight - GENERAL_PLOT_SETTINGS.heightMargin,
                hovermode: "closest",
                legend: GENERAL_PLOT_SETTINGS.legend,
                margin: GENERAL_PLOT_SETTINGS.margin,
                paper_bgcolor: GENERAL_PLOT_SETTINGS.backgroundColor,
                plot_bgcolor: GENERAL_PLOT_SETTINGS.backgroundColor,
                xaxis: this.makeAxis(
                    [0, 0.85],
                    ".1f",
                    false,
                    props.xAxisType as AxisType,
                    props.xTickConversion
                ),
                xaxis2: histogramAxis,
                yaxis: this.makeAxis(
                    [0, 0.85],
                    ".1f",
                    false,
                    props.yAxisType as AxisType,
                    props.yTickConversion
                ),
                yaxis2: histogramAxis,
            },
            height: window.innerHeight,
            showFullAnnotation: true,
        };
    }

    public componentDidUpdate(prevProps: MainPlotProps) {
        const { xAxisType, yAxisType, xTickConversion, yTickConversion } = this.props;
        if (
            xTickConversion !== prevProps.xTickConversion ||
            yTickConversion !== prevProps.yTickConversion
        ) {
            this.setState({
                layout: {
                    ...this.state.layout,
                    annotations: this.makeAnnotations(),
                    xaxis: this.makeAxis(
                        [0, 0.85],
                        ".1f",
                        false,
                        xAxisType as AxisType,
                        xTickConversion
                    ),
                    yaxis: this.makeAxis(
                        [0, 0.85],
                        ".1f",
                        false,
                        yAxisType as AxisType,
                        yTickConversion
                    ),
                },
            });
        }
    }

    public componentDidMount() {
        const setState = this.setState.bind(this);
        window.addEventListener("resize", function () {
            // Using Plotly's relayout-function with graph-name and
            // the variable with the new height and width
            setState({
                height: window.innerHeight,
            });
        });
    }

    public clickedAnnotation() {
        this.setState({ showFullAnnotation: false });
    }

    public makeAxis(
        domain: number[],
        hoverformat: string,
        zeroline: boolean,
        type: AxisType,
        tickConversion: any
    ) {
        return {
            color: GENERAL_PLOT_SETTINGS.textColor,
            domain,
            hoverformat,
            linecolor: GENERAL_PLOT_SETTINGS.textColor,
            showgrid: false,
            tickcolor: GENERAL_PLOT_SETTINGS.textColor,
            tickmode: type,
            ticktext: tickConversion.tickText,
            tickvals: tickConversion.tickValues,
            zeroline,
        };
    }

    public makeAnnotations(): PlotlyAnnotation[] {
        const { annotations } = this.props;
        const getText = (point: Annotation, show: boolean) => {
            if (show) {
                return `Cell ${point.cellID}<br><i>click thumbnail in gallery<br>on the right to load in 3D</i>`;
            }
            if (point.hovered) {
                return `Cell ${point.cellID}`;
            }
            return "";
        };

        return annotations.map((point, index) => {
            const lastOne = index + 1 === annotations.length;
            const show = lastOne && this.state.showFullAnnotation;
            const hasText = !!show || !!point.hovered;
            return {
                align: "left",
                arrowcolor: point.hovered ? "#7440f1" : "#ffffffab",
                arrowhead: 6,
                ax: 0,
                ay: show ? -60 : point.hovered ? -20 : 0,
                bgcolor: "#00000094",
                bordercolor: point.hovered ? "#7440f1" : "#ffffffab",
                borderpad: hasText ? 4 : 0,
                borderwidth: 1,
                captureevents: true,
                cellID: point.cellID,
                font: {
                    color: "#ffffff",
                    family: "tahoma, arial, verdana, sans-serif",
                    size: 11,
                },
                fovID: point.fovID,
                pointIndex: point.pointIndex,
                text: getText(point, show),
                x: point.x,
                y: point.y,
            };
        });
    }

    public makeLayout() {
        const { xAxisType, xTickConversion, yAxisType, yTickConversion } = this.props;
        const { height } = this.state;

        return {
            annotations: this.makeAnnotations(),
            autosize: true,
            height: height - GENERAL_PLOT_SETTINGS.heightMargin,
            hovermode: "closest" as const,
            legend: GENERAL_PLOT_SETTINGS.legend,
            margin: GENERAL_PLOT_SETTINGS.margin,
            paper_bgcolor: GENERAL_PLOT_SETTINGS.backgroundColor,
            plot_bgcolor: GENERAL_PLOT_SETTINGS.backgroundColor,
            xaxis: this.makeAxis([0, 0.85], ".1f", false, xAxisType as AxisType, xTickConversion),
            xaxis2: histogramAxis,
            yaxis: this.makeAxis([0, 0.85], ".1f", false, yAxisType as AxisType, yTickConversion),
            yaxis2: histogramAxis,
        };
    }

    public render() {
        const { onPointClicked, onPointHovered, onPointUnhovered, onGroupSelected, plotDataArray } =
            this.props;
        const options = {
            responsive: true,
            displayModeBar: true,
            displaylogo: false,
            modeBarButtonsToRemove: [
                // literal typing to avoid a widened type inferred
                "sendDataToCloud" as const,
                "toImage" as const,
                "resetScale2d" as const,
                "hoverClosestCartesian" as const,
                "hoverCompareCartesian" as const,
                "toggleSpikelines" as const,
            ],
        };
        return (
            <Plot
                data={plotDataArray}
                useResizeHandler={true}
                layout={this.state.layout}
                config={options}
                onClick={onPointClicked}
                onClickAnnotation={this.clickedAnnotation}
                onHover={onPointHovered}
                onUnhover={onPointUnhovered}
                onSelected={onGroupSelected}
            />
        );
    }
}

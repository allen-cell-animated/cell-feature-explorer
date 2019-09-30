import { isEqual } from "lodash";
import {
    Annotations,
    Data,
    PlotMouseEvent,
    PlotSelectionEvent,
} from "plotly.js";
import React from "react";
import Plot from "react-plotly.js";

import {
    GENERAL_PLOT_SETTINGS,
} from "../../constants";
import { TickConversion } from "../../state/selection/types";
import {
    Annotation,
} from "../../state/types";

interface MainPlotProps {
    annotations: Annotation[];
    plotDataArray: Data[];
    onPointClicked: (clicked: PlotMouseEvent) => void;
    onPlotHovered: (hovered: PlotMouseEvent) => void;
    onGroupSelected: (selected: PlotSelectionEvent) => void;
    xAxisType: string;
    yAxisType: string;
    xTickConversion: TickConversion;
    yTickConversion: TickConversion;
}

interface MainPlotState {
    layout: any;
    showFullAnnotation: boolean;
}

type PlotlyAnnotation =  Partial<Annotations>;

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
                height: GENERAL_PLOT_SETTINGS.plotHeight,
                hovermode: "closest",
                legend: GENERAL_PLOT_SETTINGS.legend,
                margin: {
                    b: 50,
                    l: 150,
                    r: 50,
                    t: 10,
                },
                paper_bgcolor: GENERAL_PLOT_SETTINGS.backgroundColor,
                plot_bgcolor: GENERAL_PLOT_SETTINGS.backgroundColor,
                xaxis: this.makeAxis([0, 0.85], ".1f", false, props.xAxisType, props.xTickConversion ),
                xaxis2: histogramAxis,
                yaxis: this.makeAxis([0, 0.85], ".1f", false,  props.yAxisType, props.yTickConversion ),
                yaxis2: histogramAxis,
            },
            showFullAnnotation: true,
        };
    }

    public componentDidUpdate(prevProps: MainPlotProps, prevState: MainPlotState) {
        const {
            annotations,
            xAxisType,
            yAxisType,
            xTickConversion,
            yTickConversion,
        } = this.props;
        if (!isEqual(annotations, prevProps.annotations) ||
            prevState.showFullAnnotation !== this.state.showFullAnnotation) {
            this.setState({
                layout: {
                    ...this.state.layout,
                    annotations: this.makeAnnotations(),
                },
            });
        }
        if (xAxisType !== prevProps.xAxisType || yAxisType !== prevProps.yAxisType) {
            this.setState(
                {
                    layout: {
                        ...this.state.layout,
                        annotations: this.makeAnnotations(),

                        xaxis: this.makeAxis([0, 0.85], ".1f", false, xAxisType, xTickConversion ),
                        xaxis2: histogramAxis,
                        yaxis: this.makeAxis([0, 0.85], ".1f", false, yAxisType, yTickConversion ),
                        yaxis2:  histogramAxis,
                    },
            });
        }
    }

    public clickedAnnotation() {
        this.setState({ showFullAnnotation: false });
    }

    public makeAxis(domain: number[], hoverformat: string, zeroline: boolean, type: string, tickConversion: any) {
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
                return `x <br>Cell ${point.cellID} *<i>click thumbnail in gallery<br>on the right to load in 3D</i>`;
            }
            if (point.hovered ) {
                return `Cell ${point.cellID}`;
            }
            return "";
        };

        return annotations.map((point, index) => {
            const lastOne =  index + 1  === annotations.length;
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
                borderpad:  hasText ? 4 : 0,
                borderwidth: 1,
                captureevents: true,
                cellID: point.cellID,
                cellLine: point.cellLine,
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

    public render() {
        const {
            onPointClicked,
            onPlotHovered,
            onGroupSelected,
            plotDataArray,
        } = this.props;
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
                layout={this.state.layout}
                config={options}
                onClick={onPointClicked}
                onClickAnnotation={this.clickedAnnotation}
                onHover={onPlotHovered}
                onSelected={onGroupSelected}
            />
        );
    }
}

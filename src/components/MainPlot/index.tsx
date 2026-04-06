import type {
    Annotations,
    Config,
    Data,
    Layout,
    PlotMouseEvent,
    PlotSelectionEvent,
} from "plotly.js";
import React from "react";
import Plot from "react-plotly.js";

import { GENERAL_PLOT_SETTINGS } from "../../constants";
import { TickConversion } from "../../state/selection/types";

interface MainPlotProps {
    annotations: PlotlyAnnotation[];
    plotDataArray: Data[];
    onPointClicked: (clicked: PlotMouseEvent) => void;
    onPointHovered: (hovered: PlotMouseEvent) => void;
    onPointUnhovered: (unhovered: PlotMouseEvent) => void;
    onGroupSelected: (selected: PlotSelectionEvent) => void;
    xAxisType: AxisType;
    yAxisType: AxisType;
    xTickConversion: TickConversion;
    yTickConversion: TickConversion;
    xAxisRange?: [number, number];
    yAxisRange?: [number, number];
}

type AxisType = "array" | "auto" | "linear" | undefined;

export interface PlotlyAnnotation extends Partial<Annotations> {
    cellID: string;
    fovID: string;
    pointIndex: number;
}

const histogramAxis = {
    color: GENERAL_PLOT_SETTINGS.textColor,
    domain: [0.86, 1],
    hoverformat: "f",
    linecolor: GENERAL_PLOT_SETTINGS.textColor,
    showgrid: false,
    tickcolor: GENERAL_PLOT_SETTINGS.textColor,
    zeroline: true,
};

function padAxisRange(range: [number, number]): [number, number] {
    const delta = range[1] - range[0];
    const padding = delta * 0.05;
    return [range[0] - padding, range[1] + padding];
}

const PLOT_CONFIG: Partial<Config> = {
    responsive: true,
    displayModeBar: true,
    displaylogo: false,
    modeBarButtonsToRemove: [
        "sendDataToCloud",
        "toImage",
        "resetScale2d",
        "hoverClosestCartesian",
        "hoverCompareCartesian",
        "toggleSpikelines",
    ],
};

const MainPlot: React.FC<MainPlotProps> = (props) => {
    const [showFullAnnotation, setShowFullAnnotation] = React.useState(true);
    const [height, setHeight] = React.useState(window.innerHeight);

    React.useEffect(() => {
        // Using Plotly's relayout-function with graph-name and
        // the variable with the new height and width
        const resize = () => setHeight(window.innerHeight);
        window.addEventListener("resize", resize);
        return () => window.removeEventListener("resize", resize);
    }, []);

    const { annotations } = props;
    const updatedAnnotations = React.useMemo((): PlotlyAnnotation[] => {
        // on first load show the help text for one annotation, but the user can dismiss it by clicking on
        // it or clicking on a point, and it won't show again until they refresh the page

        return annotations.map((point, index) => {
            const isLastOne = index === annotations.length - 1;
            const showHelpText = isLastOne && showFullAnnotation;
            const text = showHelpText
                ? `ID: ${point.cellID}<br><i>click thumbnail in gallery<br>on the right to load in 3D</i>`
                : point.text;

            return {
                ...point,
                ay: showHelpText ? -60 : point.ay,
                borderpad: showHelpText ? 4 : point.borderpad,
                text,
            };
        });
    }, [annotations, showFullAnnotation]);

    const { xAxisType, xTickConversion, xAxisRange, yAxisType, yTickConversion, yAxisRange } =
        props;
    const layout = React.useMemo((): Partial<Layout> => {
        const makeAxis = (type: AxisType, tickConversion: any, range?: [number, number]) => ({
            color: GENERAL_PLOT_SETTINGS.textColor,
            domain: [0, 0.85],
            hoverformat: ".1f",
            linecolor: GENERAL_PLOT_SETTINGS.textColor,
            showgrid: false,
            tickcolor: GENERAL_PLOT_SETTINGS.textColor,
            tickmode: type,
            ticktext: tickConversion.tickText,
            tickvals: tickConversion.tickValues,
            zeroline: false,
            range,
        });

        return {
            annotations: updatedAnnotations,
            autosize: true,
            height: height - GENERAL_PLOT_SETTINGS.heightMargin,
            hovermode: "closest",
            legend: GENERAL_PLOT_SETTINGS.legend,
            margin: GENERAL_PLOT_SETTINGS.margin,
            paper_bgcolor: GENERAL_PLOT_SETTINGS.backgroundColor,
            plot_bgcolor: GENERAL_PLOT_SETTINGS.backgroundColor,
            xaxis: makeAxis(xAxisType, xTickConversion, xAxisRange && padAxisRange(xAxisRange)),
            xaxis2: histogramAxis,
            yaxis: makeAxis(yAxisType, yTickConversion, yAxisRange && padAxisRange(yAxisRange)),
            yaxis2: histogramAxis,
        };
    }, [
        height,
        updatedAnnotations,
        xAxisType,
        xTickConversion,
        xAxisRange,
        yAxisType,
        yTickConversion,
        yAxisRange,
    ]);

    const handlePointClick = React.useCallback(
        (event: PlotMouseEvent) => {
            setShowFullAnnotation(false);
            props.onPointClicked(event);
        },
        [props.onPointClicked]
    );

    const clickedAnnotation = React.useCallback(() => setShowFullAnnotation(false), []);

    const { onPointHovered, onPointUnhovered, onGroupSelected, plotDataArray } = props;

    return (
        <Plot
            data={plotDataArray}
            useResizeHandler={true}
            layout={layout}
            config={PLOT_CONFIG}
            onClick={handlePointClick}
            onClickAnnotation={clickedAnnotation}
            onHover={onPointHovered}
            onUnhover={onPointUnhovered}
            onSelected={onGroupSelected}
        />
    );
};

export default MainPlot;

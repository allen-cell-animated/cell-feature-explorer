import { Annotations, Data, PlotMouseEvent, PlotSelectionEvent } from "plotly.js";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import Plot from "react-plotly.js";

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
    xAxisType: AxisType;
    yAxisType: AxisType;
    xTickConversion: TickConversion;
    yTickConversion: TickConversion;
    xAxisRange?: [number, number];
    yAxisRange?: [number, number];
}

type AxisType = "array" | "auto" | "linear" | undefined;

type PlotlyAnnotation = Partial<Annotations>;

/**
 * Configuration for histogram axes displayed on the periphery of the main plot
 */
const histogramAxis = {
    color: GENERAL_PLOT_SETTINGS.textColor,
    domain: [0.86, 1],
    hoverformat: "f",
    linecolor: GENERAL_PLOT_SETTINGS.textColor,
    showgrid: false,
    tickcolor: GENERAL_PLOT_SETTINGS.textColor,
    zeroline: true,
};

/**
 * Creates an axis configuration for the plot
 * @param domain - The domain range for the axis [min, max]
 * @param hoverformat - Format string for hover text
 * @param zeroline - Whether to show the zero line
 * @param type - The axis type (array, auto, linear, or undefined)
 * @param tickConversion - Conversion settings for tick labels and values
 * @param range - Optional fixed range for the axis
 * @returns Axis configuration object
 */
const makeAxis = (
    domain: number[],
    hoverformat: string,
    zeroline: boolean,
    type: AxisType,
    tickConversion: TickConversion,
    range?: [number, number]
) => {
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
        range,
    };
};

/**
 * MainPlot component renders an interactive Plotly scatter plot with histograms
 * Displays cell feature data with annotations, hover interactions, and selection capabilities
 */
const MainPlot: React.FC<MainPlotProps> = ({
    annotations,
    plotDataArray,
    onPointClicked,
    onPointHovered,
    onPointUnhovered,
    onGroupSelected,
    xAxisType,
    yAxisType,
    xTickConversion,
    yTickConversion,
    xAxisRange,
    yAxisRange,
}) => {
    const [height, setHeight] = useState(window.innerHeight);
    const [showFullAnnotation, setShowFullAnnotation] = useState(true);

    /**
     * Handle window resize events to update plot dimensions
     */
    const handleResize = useCallback(() => {
        setHeight(window.innerHeight);
    }, []);

    /**
     * Set up and clean up window resize listener
     */
    useEffect(() => {
        window.addEventListener("resize", handleResize);
        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, [handleResize]);

    /**
     * Handle annotation click events to collapse the full annotation display
     */
    const handleClickAnnotation = useCallback(() => {
        setShowFullAnnotation(false);
    }, []);

    /**
     * Generate Plotly annotation objects from application annotation data
     * The last annotation shows full details with instructions, others show brief info on hover
     */
    const plotlyAnnotations = useMemo((): PlotlyAnnotation[] => {
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
            const show = lastOne && showFullAnnotation;
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
    }, [annotations, showFullAnnotation]);

    /**
     * Construct the plot layout configuration
     * Updates when axis settings, dimensions, or annotations change
     */
    const layout = useMemo(
        () => ({
            annotations: plotlyAnnotations,
            autosize: true,
            height: height - GENERAL_PLOT_SETTINGS.heightMargin,
            hovermode: "closest" as const,
            legend: GENERAL_PLOT_SETTINGS.legend,
            margin: GENERAL_PLOT_SETTINGS.margin,
            paper_bgcolor: GENERAL_PLOT_SETTINGS.backgroundColor,
            plot_bgcolor: GENERAL_PLOT_SETTINGS.backgroundColor,
            xaxis: makeAxis(
                [0, 0.85],
                ".1f",
                false,
                xAxisType,
                xTickConversion,
                xAxisRange
            ),
            xaxis2: histogramAxis,
            yaxis: makeAxis(
                [0, 0.85],
                ".1f",
                false,
                yAxisType,
                yTickConversion,
                yAxisRange
            ),
            yaxis2: histogramAxis,
        }),
        [
            plotlyAnnotations,
            height,
            xAxisType,
            xTickConversion,
            xAxisRange,
            yAxisType,
            yTickConversion,
            yAxisRange,
        ]
    );

    /**
     * Plotly configuration options
     */
    const config = useMemo(
        () => ({
            responsive: true,
            displayModeBar: true,
            displaylogo: false,
            modeBarButtonsToRemove: [
                "sendDataToCloud" as const,
                "toImage" as const,
                "resetScale2d" as const,
                "hoverClosestCartesian" as const,
                "hoverCompareCartesian" as const,
                "toggleSpikelines" as const,
            ],
        }),
        []
    );

    return (
        <Plot
            data={plotDataArray}
            useResizeHandler={true}
            layout={layout}
            config={config}
            onClick={onPointClicked}
            onClickAnnotation={handleClickAnnotation}
            onHover={onPointHovered}
            onUnhover={onPointUnhovered}
            onSelected={onGroupSelected}
        />
    );
};

export default MainPlot;

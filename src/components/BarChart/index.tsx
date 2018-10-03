import {
    Color,
    PlotMouseEvent,
} from "plotly.js";
import React from "react";
import Plot from "react-plotly.js";

import { GENERAL_PLOT_SETTINGS } from "../../constants";
import { NumberOrString } from "../../state/types";

interface BarChartProps {
    colors: Color[];
    names: NumberOrString[];
    filtersToExclude?: string[];
    onBarClicked?: (clicked: PlotMouseEvent) => void;
    totals: number[];
}

const BarChart: React.SFC<BarChartProps> = (props) => {
    return (

        <Plot
            data={[
                {
                    marker: {
                        color: props.colors,
                        width: 1,
                    },
                    orientation: "h",
                    type: "bar",
                    x: props.totals,
                    y: props.names
                        .map((ele: NumberOrString, index: number) => typeof ele === "string" ? ele : index),
                },
            ]}
            layout={{
                height: 300,
                margin: {
                    b: 0,
                    l: 10,
                    r: 10,
                    t: 0,
                },
                paper_bgcolor: GENERAL_PLOT_SETTINGS.backgroundColor,
                plot_bgcolor: GENERAL_PLOT_SETTINGS.backgroundColor,
                width: 240,
                xaxis:     {
                    color: GENERAL_PLOT_SETTINGS.textColor,
                    domain: [.5, 1],
                    fixedrange: true,
                    linecolor: GENERAL_PLOT_SETTINGS.textColor,
                    showgrid: false,
                    tickcolor: GENERAL_PLOT_SETTINGS.textColor,
                },
                yaxis:     {

                    color: GENERAL_PLOT_SETTINGS.textColor,
                    fixedrange: true,
                    linecolor: GENERAL_PLOT_SETTINGS.textColor,
                    showgrid: false,
                    tickcolor: GENERAL_PLOT_SETTINGS.textColor,
                    tickvals: props.names,
                },
            }}
            config={{
                displayModeBar: false,
            }}
            onClick={props.onBarClicked}

        />
    );
};

export default BarChart;

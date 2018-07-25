import React from "react";
import Plot from "react-plotly.js";

const settings = {
    cellName: "Cell ID",
    chartParent: "ace-scatter-chart",
    dataFile: "/js/AICS/cell-feature-analysis.json",
    imagesDir: "/aics/thumbnails",
    textColor: "rgb(255,255,255)",
    backgroundColor: "rgba(0,0,0,0)",
    xAxisInitial: "Nuclear volume (fL)",
    yAxisInitial: "Cellular volume (fL)",
    unselectedCircleOpacity: .7,
    cirleRadius: 4,
    legend: {
        y: 60,
        orientation: "h",
        font: {
            color: "rgb(255,255,255)",
        },
    },
    histogramColor: "rgb(164,162,164)",
    margin: {
        top: 10,
        right: 25,
        bottom: 10,
        left: 25,
    },
    showLegendCutoffHeight: 635,
    showLegendCutoffWidth: 692,
    moveDropdownCutoffWidth: 370,
    annotation: {
        bgcolor: "#a4a2a45c",
        borderwidth: 1.5,
        borderpad: 4,
        captureevents: true,
        arrowhead: 6,
        font: {
            family: "tahoma, arial, verdana, sans-serif",
            size: 12,
            color: "#ffffff",
        },
        ax: 0,
        ay: -30,

    },
};

interface MainPlotProps {
    plotData: any;
}

class InteractivePlot extends React.Component<MainPlotProps, {}> {
    constructor(props) {
        super(props);
        this.makeScatterPlotData = this.makeScatterPlotData.bind(this);
    }
    public makeScatterPlotData() {
        const { plotData } = this.props;
        return {
            x: plotData.x,
            y: plotData.y,
            mode: "markers",
            name: "scatter plot",
            hoverlabel: {
            namelength: -1,

        },
        marker: {
            symbol: "circle",
                size: settings.cirleRadius,
                opacity: settings.unselectedCircleOpacity,
        },
        showlegend: true,
            type: "scattergl",
            transforms: [{
            type: "groupby",
            groups: plotData.groups,
            nameformat: `%{group}`,
        }],
        };
    }

    public render() {
        const { plotData } = this.props;

        return (
            <Plot
                data={[this.makeScatterPlotData()]}
                layout={{
                    autosize: true,
                    height: 800,
                    hovermode: "closest",
                    legend: settings.legend,
                    paper_bgcolor: settings.backgroundColor,
                    plot_bgcolor: settings.backgroundColor,
                    showlegend: true,
                    width: 600,
                    // annotations: annotations,
                    // thumbnails: thumbnails,
                    // xaxis: settings.makeAxis(plotByOnX, [0, 0.85], '.1f'),
                    // yaxis: settings.makeAxis(plotByOnY, [0, 0.85], '.1f'),
                    // xaxis2: settings.makeAxis(null, [0.85, 1], 'f'),
                    // yaxis2: settings.makeAxis(null, [0.85, 1], 'f'),
                } }
            />
        );
    }
}

export default InteractivePlot;

import { isEqual, map } from "lodash";
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
import {
    Annotation,
} from "../../state/types";

interface DiversityPlotProps {
    annotations: Annotation[];
    plotDataArray: Data[];
    onPointClicked: (clicked: PlotMouseEvent) => void;
    onPlotHovered: (hovered: PlotMouseEvent) => void;
    onGroupSelected: (selected: PlotSelectionEvent) => void;
}
const styles = require("./style.css");

interface MainPlotState {
    layout: any;
    showFullAnnotation: boolean;
}

type PlotlyAnnotation =  Partial<Annotations>;

export default class DiversityPlot extends React.Component<DiversityPlotProps, MainPlotState> {
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

    constructor(props: DiversityPlotProps) {
        super(props);
        this.makeAnnotations = this.makeAnnotations.bind(this);
        this.clickedAnnotation = this.clickedAnnotation.bind(this);
        this.state = {
            layout: {
                autosize: true,
                height: GENERAL_PLOT_SETTINGS.plotHeight,
                hovermode: "closest",
                paper_bgcolor: GENERAL_PLOT_SETTINGS.backgroundColor,
                plot_bgcolor: GENERAL_PLOT_SETTINGS.backgroundColor,
                // width: 220,

            },
        };
    }

    public componentDidUpdate(prevProps: DiversityPlotProps) {
        if (!isEqual(prevProps.annotations, this.props.annotations)) {
            this.setState({layout: {
                ...this.state.layout,
                annotations: this.makeAnnotations(),
            }});
        }
    }

    public clickedAnnotation() {
        this.setState({showFullAnnotation: false});
    }

    public makeAnnotations(): PlotlyAnnotation[] {
        const { annotations } = this.props;
        const getText = (point: Annotation, show: boolean) => {
            if (show) {
                return `Cell ${point.cellID}<br><i>click thumbnail in gallery to load in 3D</i>`;
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

    public graphClicked(e) {
        console.log(e.points);
    }


    public graphHovered(e) {
        console.log(e.points);
    }

    public render() {
        const {
            onPointClicked,
            onPlotHovered,
            onGroupSelected,
            plotDataArray,
        } = this.props;
        const options = {
            displayModeBar: false,
            displaylogo: false,
        };
        const layout = {
            margin: {
                b: 200,
                l: 5,
                r: 0,
                t: 0,
            },
            paper_bgcolor: GENERAL_PLOT_SETTINGS.backgroundColor,
            plot_bgcolor: GENERAL_PLOT_SETTINGS.backgroundColor,
            showlegend: false,
            width: 50,
            xaxis: {
                color: GENERAL_PLOT_SETTINGS.textColor,
                tickangle: -90,

            },
            yaxis: {
                color: GENERAL_PLOT_SETTINGS.textColor,
                nticks: 3,
                showgrid: false,
                showline: false,
                tickmode: "auto" as "auto",
                ticks: "",
                visible: true,
            },

        };
        return (
            <div className={styles.diversityPlots}>
                {map(plotDataArray, (data) =>
                     (
                         <Plot
                            key={`plot-${data.x[0]}`}
                            data={[data]}
                            useResizeHandler={true}
                            layout={layout}
                            config={options}
                            onClick={this.graphClicked}
                            onHover={this.graphHovered}
                            onSelected={onGroupSelected}
                         />
                     ))
                }
            </div>
        );

    }
}

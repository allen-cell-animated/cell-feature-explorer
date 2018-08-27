import {
    Color,
    PlotMouseEvent,
    PlotSelectionEvent,
} from "plotly.js";
import * as React from "react";
import { ActionCreator, connect } from "react-redux";

import InteractivePlot from "../../components/MainPlot";

import { SCATTER_PLOT_NAME, X_AXIS_ID, Y_AXIS_ID } from "../../constants";
import {
    Annotation,
    State,
} from "../../state/types";

import { requestFeatureData } from "../../state/metadata/actions";
import { getFeatureData, getProteinNames } from "../../state/metadata/selectors";
import { RequestAction } from "../../state/metadata/types";

import selectionStateBranch from "../../state/selection";
import {
    DeselectPointAction,
    SelectedGroups,
    SelectGroupOfPointsAction,
    SelectPointAction,
} from "../../state/selection/types";

import {
    getAnnotations,
    getClickedScatterPoints,
} from "../../state/selection/selectors";

import AxisDropDown from "../AxisDropDown";

const styles = require("./style.css");

interface MainPlotContainerProps {
    annotations: Annotation[];
    colorBy: string;
    clickedPoints: number[];
    colorByGroupings: string[];
    data: any;
    requestFeatureData: ActionCreator<RequestAction>;
    plotByOnX: string;
    plotByOnY: string;
    proteinColors: Color[];
    proteinNames: string[];
    handleSelectPoint: ActionCreator<SelectPointAction>;
    handleDeselectPoint: ActionCreator<DeselectPointAction>;
    handleSelectGroupOfPoints: ActionCreator<SelectGroupOfPointsAction>;
    xDataValues: number[];
    yDataValues: number[];
}

class MainPlotContainer extends React.Component<MainPlotContainerProps, {}> {

    constructor(props: MainPlotContainerProps) {
         super(props);
         this.onPointClicked = this.onPointClicked.bind(this);
         this.onGroupSelected = this.onGroupSelected.bind(this);
    }

    public componentWillMount() {
        this.props.requestFeatureData();
    }

    public onPointClicked(clicked: PlotMouseEvent) {
        const { points } = clicked;
        const {
            clickedPoints,
            handleSelectPoint,
            handleDeselectPoint,
        } = this.props;
        points.forEach((point) => {
            if (point.data.name === SCATTER_PLOT_NAME) {
                if (clickedPoints.indexOf(point.pointIndex) > -1) {
                    handleDeselectPoint(point.pointIndex);
                } else {
                    handleSelectPoint(point.pointIndex);
                }
            }
        });
    }

    public onGroupSelected(eventData: PlotSelectionEvent) {
        const { points } = eventData;
        const { handleSelectGroupOfPoints } = this.props;
        const key = Date.now().valueOf().toString();
        const payload = points.map((point) => point.pointIndex);
        handleSelectGroupOfPoints(key, payload);
    }

    public render() {
         const {
             annotations,
             colorBy,
             colorByGroupings,
             proteinColors,
             proteinNames,
             xDataValues,
             yDataValues,
             data,
         } = this.props;
         if (data.length === 0) {return null; }
         const plotData = {
             groups: colorByGroupings,
             proteinColors,
             proteinNames,
             x: xDataValues,
             y: yDataValues,
         };

         return (
            <div className={styles.container}>My Plot
                <AxisDropDown axisId={X_AXIS_ID}/>
                <AxisDropDown axisId={Y_AXIS_ID}/>
                <InteractivePlot
                    plotData={plotData}
                    onPointClicked={this.onPointClicked}
                    annotations={annotations}
                    onGroupSelected={this.onGroupSelected}
                    colorBy={colorBy}
                />
            </div>
        );
    }
}

function mapStateToProps(state: State) {
    return {
        annotations: getAnnotations(state),
        clickedPoints: getClickedScatterPoints(state),
        colorBy: selectionStateBranch.selectors.getColorBySelection(state),
        colorByGroupings: selectionStateBranch.selectors.getColorByValues(state),
        data: getFeatureData(state),
        plotByOnX: selectionStateBranch.selectors.getPlotByOnX(state),
        plotByOnY: selectionStateBranch.selectors.getPlotByOnY(state),
        proteinColors: selectionStateBranch.selectors.getProteinColors(state),
        proteinNames: getProteinNames(state),
        xDataValues: selectionStateBranch.selectors.getXValues(state),
        yDataValues: selectionStateBranch.selectors.getYValues(state),
    };
}

const dispatchToPropsMap = {
    handleDeselectPoint: selectionStateBranch.actions.deselectPoint,
    handleSelectGroupOfPoints: selectionStateBranch.actions.selectGroupOfPoints,
    handleSelectPoint: selectionStateBranch.actions.selectPoint,
    requestFeatureData,
};

export default connect(mapStateToProps, dispatchToPropsMap)(MainPlotContainer);

import { includes } from "lodash";
import {
    Color,
    PlotMouseEvent,
    PlotSelectionEvent,
} from "plotly.js";
import * as React from "react";
import {
    ActionCreator,
    connect,
} from "react-redux";

import MainPlot from "../../components/MainPlot";

import {
    SCATTER_PLOT_NAME,
    X_AXIS_ID,
    Y_AXIS_ID,
} from "../../constants";
import {
    Annotation,
    State,
} from "../../state/types";

import metadataStateBranch from "../../state/metadata";
import { CellLineDef, RequestAction } from "../../state/metadata/types";

import selectionStateBranch from "../../state/selection";
import {
    DeselectPointAction,
    SelectedGroupData,
    SelectGroupOfPointsAction,
    SelectPointAction,
} from "../../state/selection/types";

import AxisDropDown from "../AxisDropDown";

const styles = require("./style.css");

interface MainPlotContainerProps {
    annotations: Annotation[];
    applyColorToSelections: boolean;
    cellLineDefs: CellLineDef;
    clickedPoints: number[];
    colorBy: string;
    colorByGroupings: string[] | number[];
    dotOpacity: number[];
    plotByOnX: string;
    plotByOnY: string;
    proteinColors: Color[];
    proteinLabels: string[];
    proteinNames: string[];
    handleSelectionToolUsed: () => void;
    handleSelectPoint: ActionCreator<SelectPointAction>;
    handleDeselectPoint: ActionCreator<DeselectPointAction>;
    handleSelectGroupOfPoints: ActionCreator<SelectGroupOfPointsAction>;
    requestCellLineData: ActionCreator<RequestAction>;
    requestFeatureData: ActionCreator<RequestAction>;
    selectedGroups: SelectedGroupData;
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
        this.props.requestCellLineData();
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
                if (includes(clickedPoints, point.pointIndex)) {
                    handleDeselectPoint(point.pointIndex);
                } else {
                    handleSelectPoint(point.pointIndex);
                }
            }
        });
    }

    public onGroupSelected(eventData: PlotSelectionEvent) {
        const { points } = eventData;
        const {
            handleSelectGroupOfPoints,
            handleSelectionToolUsed,
        } = this.props;
        const key = Date.now().valueOf().toString();
        const payload = points.map((point) => point.pointIndex);
        handleSelectGroupOfPoints(key, payload);
        handleSelectionToolUsed();
    }

    public render() {
         const {
             applyColorToSelections,
             annotations,
             colorBy,
             colorByGroupings,
             dotOpacity,
             selectedGroups,
             proteinColors,
             proteinLabels,
             proteinNames,
             xDataValues,
             yDataValues,
         } = this.props;
         if (xDataValues.length === 0) {
             return null;
         }
         const plotData = {
             dotOpacity,
             groups: colorByGroupings,
             proteinColors,
             proteinLabels,
             proteinNames,
             x: xDataValues,
             y: yDataValues,
         };
         return (
            <div
                id="main-plot"
                className={styles.container}
            >
                <AxisDropDown axisId={X_AXIS_ID}/>
                <AxisDropDown axisId={Y_AXIS_ID}/>
                <MainPlot
                    plotData={plotData}
                    onPointClicked={this.onPointClicked}
                    annotations={annotations}
                    onGroupSelected={this.onGroupSelected}
                    selectedGroups={selectedGroups}
                    colorBy={colorBy}
                    applyColorToSelections={applyColorToSelections}
                />
            </div>
        );
    }
}

function mapStateToProps(state: State) {
    return {
        annotations: selectionStateBranch.selectors.getAnnotations(state),
        applyColorToSelections: selectionStateBranch.selectors.getApplyColorToSelections(state),
        cellLineDefs: metadataStateBranch.selectors.getFullCellLineDefs(state),
        clickedPoints: selectionStateBranch.selectors.getClickedScatterPoints(state),
        colorBy: selectionStateBranch.selectors.getColorBySelection(state),
        colorByGroupings: selectionStateBranch.selectors.getColorByValues(state),
        dotOpacity: selectionStateBranch.selectors.getOpacity(state),
        plotByOnX: selectionStateBranch.selectors.getPlotByOnX(state),
        plotByOnY: selectionStateBranch.selectors.getPlotByOnY(state),
        proteinColors: selectionStateBranch.selectors.getProteinColors(state),
        proteinLabels: metadataStateBranch.selectors.getProteinLabels(state),
        proteinNames: metadataStateBranch.selectors.getProteinNames(state),
        selectedGroups: selectionStateBranch.selectors.getSelectedGroupsData(state),
        xDataValues: selectionStateBranch.selectors.getXValues(state),
        yDataValues: selectionStateBranch.selectors.getYValues(state),
    };
}

const dispatchToPropsMap = {
    handleDeselectPoint: selectionStateBranch.actions.deselectPoint,
    handleSelectGroupOfPoints: selectionStateBranch.actions.selectGroupOfPoints,
    handleSelectPoint: selectionStateBranch.actions.selectPoint,
    requestCellLineData: metadataStateBranch.actions.requestCellLineData,
    requestFeatureData: metadataStateBranch.actions.requestFeatureData,
};

export default connect(mapStateToProps, dispatchToPropsMap)(MainPlotContainer);

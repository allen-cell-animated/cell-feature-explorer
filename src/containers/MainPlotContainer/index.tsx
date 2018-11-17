import {
    filter,
    includes,
    map,
    reduce,
} from "lodash";
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
    ContinuousPlotData,
    GroupedPlotData,
    SelectedGroupDatum,
    State,
} from "../../state/types";

import metadataStateBranch from "../../state/metadata";
import { CellLineDef, RequestAction } from "../../state/metadata/types";

import selectionStateBranch from "../../state/selection";
import {
    DeselectPointAction,
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
    clusteringResultData: ContinuousPlotData;
    colorBy: string;
    colorByGroupings: string[] | number[];
    dotOpacity: number[];
    mainPlotDataValues: GroupedPlotData;
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
    selectedGroups: ContinuousPlotData;
    showClusters: boolean;
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
        const payload = map(filter(points, (ele) => ele.data.name === SCATTER_PLOT_NAME), "pointIndex");
        handleSelectGroupOfPoints(key, payload);
        handleSelectionToolUsed();
    }

    public render() {
        const {
            applyColorToSelections,
            annotations,
            clusteringResultData,
            mainPlotDataValues,
            showClusters,
            selectedGroups,
        } = this.props;
        if (mainPlotDataValues.x.length === 0) {
            return null;
        }
        const mainPlotData = {
            ...mainPlotDataValues,
            groupSettings : {
                ...mainPlotDataValues.groupSettings,
            },
            plotName: SCATTER_PLOT_NAME,

        };

        const selectedGroupPlotData = applyColorToSelections ? {
                ...selectedGroups,
            groupBy: false,
            plotName: "Selections",
        } : null;
        const clusteringPlotData = showClusters ? {
            ...clusteringResultData,
            groupBy: false,
            opacity: 0.5,
            plotName: "Clusters",
        } : null;

        return (
            <div
                id="main-plot"
                className={styles.container}
            >
                <AxisDropDown axisId={X_AXIS_ID}/>
                <AxisDropDown axisId={Y_AXIS_ID}/>
                <MainPlot
                    mainPlotData={mainPlotData}
                    selectGroupPlotData={selectedGroupPlotData}
                    onPointClicked={this.onPointClicked}
                    annotations={annotations}
                    clusteringPlotData={clusteringPlotData}
                    onGroupSelected={this.onGroupSelected}
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
        clusteringResultData: selectionStateBranch.selectors.getClusteringResult(state),
        colorBy: selectionStateBranch.selectors.getColorBySelection(state),
        colorByGroupings: selectionStateBranch.selectors.getColorByValues(state),
        dotOpacity: selectionStateBranch.selectors.getOpacity(state),
        mainPlotDataValues: selectionStateBranch.selectors.getMainPlotData(state),
        plotByOnX: selectionStateBranch.selectors.getPlotByOnX(state),
        plotByOnY: selectionStateBranch.selectors.getPlotByOnY(state),
        proteinColors: selectionStateBranch.selectors.getProteinColors(state),
        proteinLabels: metadataStateBranch.selectors.getProteinLabels(state),
        proteinNames: metadataStateBranch.selectors.getProteinNames(state),
        selectedGroups: selectionStateBranch.selectors.getSelectedGroupsData(state),
        showClusters: selectionStateBranch.selectors.getClustersOn(state),
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

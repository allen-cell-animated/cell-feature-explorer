import {
    filter,
    includes,
    map,
} from "lodash";
import {
    Data,
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
import metadataStateBranch from "../../state/metadata";
import { RequestAction } from "../../state/metadata/types";

import selectionStateBranch from "../../state/selection";
import {
    DeselectPointAction,
    SelectGroupOfPointsAction,
    SelectPointAction,
} from "../../state/selection/types";
import {
    Annotation,
    State,
} from "../../state/types";

import AxisDropDown from "../AxisDropDown";

import { getScatterPlotDataArray } from "./selectors";

const styles = require("./style.css");

interface MainPlotContainerProps {
    annotations: Annotation[];
    clickedPoints: number[];
    plotDataArray: Data[];
    handleSelectionToolUsed: () => void;
    handleSelectPoint: ActionCreator<SelectPointAction>;
    handleDeselectPoint: ActionCreator<DeselectPointAction>;
    handleSelectGroupOfPoints: ActionCreator<SelectGroupOfPointsAction>;
    requestCellLineData: ActionCreator<RequestAction>;
    requestFeatureData: ActionCreator<RequestAction>;
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

    // TODO: retype once plotly has id and fullData types
    public onPointClicked(clicked: any) {
        const { points } = clicked;
        const {
            clickedPoints,
            handleSelectPoint,
            handleDeselectPoint,
        } = this.props;
        points.forEach((point: any) => {
            if (point.data.name === SCATTER_PLOT_NAME) {
                if (includes(clickedPoints, Number(point.id))) {
                    handleDeselectPoint(Number(point.id));
                } else if (point.fullData.marker.opacity) {
                    handleSelectPoint(Number(point.id));
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
        const payload = map(filter(points, (ele) => ele.data.name === SCATTER_PLOT_NAME), "id");
        handleSelectGroupOfPoints(key, payload);
        handleSelectionToolUsed();
    }

    public render() {
        const {
            annotations,
            plotDataArray,
        } = this.props;
        if (plotDataArray.length === 0) {
            return null;
        }

        return (
            <div
                id="main-plot"
                className={styles.container}
            >
                <AxisDropDown axisId={X_AXIS_ID}/>
                <AxisDropDown axisId={Y_AXIS_ID}/>
                <MainPlot
                    plotDataArray={plotDataArray}
                    onPointClicked={this.onPointClicked}
                    annotations={annotations}
                    onGroupSelected={this.onGroupSelected}
                />
            </div>
        );
    }
}

function mapStateToProps(state: State) {
    return {
        annotations: selectionStateBranch.selectors.getAnnotations(state),
        clickedPoints: selectionStateBranch.selectors.getClickedScatterPoints(state),
        plotDataArray: getScatterPlotDataArray(state),
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

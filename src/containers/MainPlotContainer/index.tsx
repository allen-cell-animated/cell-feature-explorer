import { Popover } from "antd";
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
import MouseFollower from "../../components/MouseFollower";
import PopoverCard from "../../components/PopoverCard/index";

import {
    CELL_ID_KEY,
    PROTEIN_NAME_KEY,
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
import { convertFileInfoToImgSrc } from "../../state/util";

import AxisDropDown from "../AxisDropDown";

import { getScatterPlotDataArray } from "./selectors";

const styles = require("./style.css");

interface MainPlotContainerProps {
    annotations: Annotation[];
    clickedPoints: number[];
    plotDataArray: Data[];
    filtersToExclude: string[];
    handleSelectionToolUsed: () => void;
    handleSelectPoint: ActionCreator<SelectPointAction>;
    handleDeselectPoint: ActionCreator<DeselectPointAction>;
    handleSelectGroupOfPoints: ActionCreator<SelectGroupOfPointsAction>;
    requestCellLineData: ActionCreator<RequestAction>;
    requestFeatureData: ActionCreator<RequestAction>;
}

interface MainPlotContainerState {
    popoverContent: JSX.Element | null;
}

class MainPlotContainer extends React.Component<MainPlotContainerProps, MainPlotContainerState> {

    constructor(props: MainPlotContainerProps) {
        super(props);
        this.onPointClicked = this.onPointClicked.bind(this);
        this.onPlotHovered = this.onPlotHovered.bind(this);
        this.onGroupSelected = this.onGroupSelected.bind(this);
        this.onPlotUnhovered = this.onPlotUnhovered.bind(this);
        this.state = {
            popoverContent: null,
        };
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

    // TODO: retype once plotly has customdata and fullData types
    public onPlotHovered(hovered: any) {
        const { points } = hovered;
        const {
            filtersToExclude,
        } = this.props;
        points.forEach((point: any) => {
            if (point.data.name === SCATTER_PLOT_NAME ) {
                const fileInfo = point.data.customdata[point.pointIndex];
                if (!includes(filtersToExclude, point.fullData.name) && fileInfo) {

                    this.setState({popoverContent:
                        (
                            <PopoverCard
                                title={fileInfo[PROTEIN_NAME_KEY]}
                                description={fileInfo[CELL_ID_KEY]}
                                src={convertFileInfoToImgSrc(fileInfo)}
                            />
                        ),
                    });
                } else {
                    this.setState({popoverContent: null});
                }
            }
        });
    }

    public onPlotUnhovered({relatedTarget}: any) {
        // prevents click events from triggering the popover to close
        if (relatedTarget.className) {
            this.setState({popoverContent: null});
        }
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
            <React.Fragment>
                <Popover
                    placement="right"
                    content={this.state.popoverContent}
                    visible={!!this.state.popoverContent}
                >
                    <MouseFollower/>
                </Popover>
            <div
                id="main-plot"
                className={styles.container}
                onMouseLeave={this.onPlotUnhovered}
            >

                <AxisDropDown axisId={X_AXIS_ID}/>
                <AxisDropDown axisId={Y_AXIS_ID}/>

                <MainPlot

                    plotDataArray={plotDataArray}
                    onPointClicked={this.onPointClicked}
                    annotations={annotations}
                    onGroupSelected={this.onGroupSelected}
                    onPlotHovered={this.onPlotHovered}
                />
            </div>
            </React.Fragment>

        );
    }
}

function mapStateToProps(state: State) {
    return {
        annotations: selectionStateBranch.selectors.getAnnotations(state),
        clickedPoints: selectionStateBranch.selectors.getClickedScatterPoints(state),
        filtersToExclude: selectionStateBranch.selectors.getFiltersToExclude(state),
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

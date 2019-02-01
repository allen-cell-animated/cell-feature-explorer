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
import { FileInfo, RequestAction } from "../../state/metadata/types";
import selectionStateBranch from "../../state/selection";
import {
    ChangeHoveredPointAction,
    ChangeMousePositionAction,
    DeselectPointAction,
    LassoOrBoxSelectAction,
    MousePosition,
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
    changeHoverCellId: ActionCreator<ChangeHoveredPointAction>;
    clickedPoints: number[];
    hoveredPointData: FileInfo;
    plotDataArray: Data[];
    mousePosition: MousePosition;
    filtersToExclude: string[];
    handleSelectionToolUsed: () => void;
    handleSelectPoint: ActionCreator<SelectPointAction>;
    handleClickedChart: () => void;
    handleDeselectPoint: ActionCreator<DeselectPointAction>;
    handleLassoOrBoxSelect: ActionCreator<LassoOrBoxSelectAction>;
    requestCellLineData: ActionCreator<RequestAction>;
    requestFeatureData: ActionCreator<RequestAction>;
    updateMousePosition: ActionCreator<ChangeMousePositionAction>;
}

class MainPlotContainer extends React.Component<MainPlotContainerProps, {}> {

    constructor(props: MainPlotContainerProps) {
        super(props);
        this.onPointClicked = this.onPointClicked.bind(this);
        this.onPlotHovered = this.onPlotHovered.bind(this);
        this.onGroupSelected = this.onGroupSelected.bind(this);
        this.onPlotUnhovered = this.onPlotUnhovered.bind(this);
        this.renderPopover = this.renderPopover.bind(this);
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
            handleClickedChart,
        } = this.props;
        handleClickedChart();
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

    // TODO: retype once plotly has id and fullData types
    public onPlotHovered(hovered: any) {
        const { points, event } = hovered;
        const {
            filtersToExclude,
            updateMousePosition,
            changeHoverCellId,
        } = this.props;
        updateMousePosition({
            pageX: event.pageX,
            pageY: event.pageY,
        });
        points.forEach((point: any) => {
            if (point.data.name === SCATTER_PLOT_NAME ) {
                if (!includes(filtersToExclude, point.fullData.name)) {
                    changeHoverCellId(Number(point.id));
                } else {
                    changeHoverCellId(-1);
                }
            }
        });
    }

    public onPlotUnhovered({relatedTarget}: any) {
        const {
            changeHoverCellId,
        } = this.props;
        // prevents click events from triggering the popover to close
        if (relatedTarget.className) {
            changeHoverCellId(-1);
        }
    }

    public onGroupSelected(eventData: PlotSelectionEvent) {
        if (!eventData) {
            return;
        }
        const { points } = eventData;
        const {
            handleLassoOrBoxSelect,
            handleSelectionToolUsed,
        } = this.props;
        const key = Date.now().valueOf().toString();
        const payload = map(filter(points, (ele) => ele.data.name === SCATTER_PLOT_NAME), "id");
        handleLassoOrBoxSelect(key, payload);
        handleSelectionToolUsed();
    }

    public renderPopover() {
        const {
            hoveredPointData,
        } = this.props;
        return (hoveredPointData &&
            (
                <PopoverCard
                    title={hoveredPointData[PROTEIN_NAME_KEY]}
                    description={hoveredPointData[CELL_ID_KEY].toString()}
                    src={convertFileInfoToImgSrc(hoveredPointData)}
                />
            )
        );
    }

    public render() {
        const {
            annotations,
            plotDataArray,
            mousePosition,
        } = this.props;

        if (plotDataArray.length === 0) {
            return null;
        }

        const popover = this.renderPopover();

        return (
            <React.Fragment>
                <Popover
                    placement="right"
                    content={popover}
                    visible={!!popover}
                >
                    <MouseFollower
                        pageX={mousePosition.pageX}
                        pageY={mousePosition.pageY}
                    />
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
        hoveredPointData: selectionStateBranch.selectors.getHoveredPointData(state),
        mousePosition: selectionStateBranch.selectors.getMousePosition(state),
        plotDataArray: getScatterPlotDataArray(state),
    };
}

const dispatchToPropsMap = {
    changeHoverCellId: selectionStateBranch.actions.changeHoveredPoint,
    handleDeselectPoint: selectionStateBranch.actions.deselectPoint,
    handleLassoOrBoxSelect: selectionStateBranch.actions.lassoOrBoxSelectGroup,
    handleSelectPoint: selectionStateBranch.actions.selectPoint,
    requestCellLineData: metadataStateBranch.actions.requestCellLineData,
    requestFeatureData: metadataStateBranch.actions.requestFeatureData,
    updateMousePosition: selectionStateBranch.actions.changeMousePosition,
};

export default connect(mapStateToProps, dispatchToPropsMap)(MainPlotContainer);

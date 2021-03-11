import { Popover } from "antd";
import { InfoCircleOutlined } from "@ant-design/icons"
import {
    filter,
    includes,
    map,
} from "lodash";
import {
    PlotSelectionEvent,
} from "plotly.js";
import * as React from "react";
import {
    ActionCreator,
    connect,
} from "react-redux";

import AxisDropDown from "../../components/AxisDropDown";
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
import { FileInfo, MeasuredFeatureDef, RequestAction } from "../../state/metadata/types";
import selectionStateBranch from "../../state/selection";
import {
    ChangeHoveredPointAction,
    ChangeMousePositionAction,
    DeselectPointAction,
    LassoOrBoxSelectAction,
    MousePosition,
    SelectAxisAction,
    SelectPointAction,
    TickConversion,
} from "../../state/selection/types";
import {
    Annotation,
    State,
} from "../../state/types";

import {
    getScatterPlotDataArray,
    getXDisplayOptions,
    getXTickConversion,
    getYDisplayOptions,
    getYTickConversion
} from "./selectors";

const styles = require("./style.css");

interface PropsFromState {
    annotations: Annotation[];
    categoricalFeatures: string[];
    clickedPoints: string[];
    filtersToExclude: string[];
    galleryCollapsed: boolean;
    hoveredPointData: FileInfo | undefined;
    mousePosition: MousePosition;
    plotDataArray: any;
    thumbnailRoot: string;
    xDropDownValue: string;
    yDropDownValue: string;
    yDropDownOptions: MeasuredFeatureDef[];
    xDropDownOptions: MeasuredFeatureDef[];
    xTickConversion: TickConversion;
    yTickConversion: TickConversion;
}

interface DispatchProps {
    changeHoveredCell: ActionCreator<ChangeHoveredPointAction>;
    handleDeselectPoint: ActionCreator<DeselectPointAction>;
    handleLassoOrBoxSelect: ActionCreator<LassoOrBoxSelectAction>;
    handleSelectPoint: ActionCreator<SelectPointAction>;
    requestCellLineData: ActionCreator<RequestAction>;
    requestFeatureData: ActionCreator<RequestAction>;
    updateMousePosition: ActionCreator<ChangeMousePositionAction>;
    handleChangeAxis: ActionCreator<SelectAxisAction>;
    requestCellFileInfoData: ActionCreator<RequestAction>;
}

interface OwnProps {
    // props from <App />
    handleSelectionToolUsed: () => void;
}

type MainPlotContainerProps = PropsFromState & DispatchProps & OwnProps;

class MainPlotContainer extends React.Component<MainPlotContainerProps> {

    constructor(props: MainPlotContainerProps) {
        super(props);
        this.onPointClicked = this.onPointClicked.bind(this);
        this.onPlotHovered = this.onPlotHovered.bind(this);
        this.onGroupSelected = this.onGroupSelected.bind(this);
        this.onPlotUnhovered = this.onPlotUnhovered.bind(this);
        this.renderPopover = this.renderPopover.bind(this);
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
                if (includes(clickedPoints, point.id)) {
                    handleDeselectPoint(point.id);
                } else if (point.fullData.marker.opacity) {
                    handleSelectPoint(point.id);
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
            changeHoveredCell,
        } = this.props;
        updateMousePosition({
            pageX: event.pageX,
            pageY: event.pageY,
        });
        points.forEach((point: any) => {
            if (point.data.name === SCATTER_PLOT_NAME ) {
                if (!includes(filtersToExclude, point.fullData.name)) {
                    changeHoveredCell({[CELL_ID_KEY]: point.id, [PROTEIN_NAME_KEY]: point.fullData.name, thumbnailPath: point.customdata});
                } else {
                    changeHoveredCell(null);
                }
            }
        });
    }

    public onPlotUnhovered({relatedTarget}: any) {
        const {
            changeHoveredCell,
        } = this.props;
        // prevents click events from triggering the popover to close
        if (relatedTarget.className) {
            changeHoveredCell(null);
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
        const { hoveredPointData, galleryCollapsed, thumbnailRoot } = this.props;
        return (
            hoveredPointData &&
            galleryCollapsed && (
                <PopoverCard
                    title={hoveredPointData[PROTEIN_NAME_KEY]}
                    description={hoveredPointData[CELL_ID_KEY].toString()}
                    src={`${thumbnailRoot}/${hoveredPointData.thumbnailPath}`}
                />
            )
        );
    }

    public render() {
        const {
            annotations,
            plotDataArray,
            mousePosition,
            xDropDownValue,
            yDropDownValue,
            yDropDownOptions,
            xDropDownOptions,
            handleChangeAxis,
            yTickConversion,
            xTickConversion,
            categoricalFeatures,
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
                    {...{
                        // props not in ant.d component, but do exist
                        // needed to style this component since it's out of the DOM structure
                        id: "thumbnail-popover",
                    }}
                >
                    <MouseFollower pageX={mousePosition.pageX} pageY={mousePosition.pageY} />
                </Popover>
                <div
                    id="main-plot"
                    className={styles.container}
                    onMouseLeave={this.onPlotUnhovered}
                >
                    <AxisDropDown
                        axisId={X_AXIS_ID}
                        value={xDropDownValue}
                        options={xDropDownOptions}
                        handleChangeAxis={handleChangeAxis}
                    />
                    <div className={styles.glossaryLink}>
                        <a
                            href="https://www.allencell.org/glossary-of-cell-features-v2.html"
                            target="_blank"
                            rel="noreferrer"
                        >
                            <InfoCircleOutlined /> Open axis glossary
                        </a>
                    </div>
                    <AxisDropDown
                        axisId={Y_AXIS_ID}
                        value={yDropDownValue}
                        options={yDropDownOptions}
                        handleChangeAxis={handleChangeAxis}
                    />

                    <MainPlot
                        plotDataArray={plotDataArray}
                        onPointClicked={this.onPointClicked}
                        annotations={annotations}
                        onGroupSelected={this.onGroupSelected}
                        onPlotHovered={this.onPlotHovered}
                        xAxisType={includes(categoricalFeatures, xDropDownValue) ? "array" : "auto"}
                        yAxisType={includes(categoricalFeatures, yDropDownValue) ? "array" : "auto"}
                        yTickConversion={yTickConversion}
                        xTickConversion={xTickConversion}
                    />
                </div>
            </React.Fragment>
        );
    }
}

function mapStateToProps(state: State): PropsFromState {
    return {
        annotations: selectionStateBranch.selectors.getAnnotations(state),
        clickedPoints: selectionStateBranch.selectors.getClickedScatterPoints(state),
        categoricalFeatures: metadataStateBranch.selectors.getCategoricalFeatureKeys(state),
        filtersToExclude: selectionStateBranch.selectors.getFiltersToExclude(state),
        galleryCollapsed: selectionStateBranch.selectors.getGalleryCollapsed(state),
        hoveredPointData: selectionStateBranch.selectors.getHoveredPointData(state),
        mousePosition: selectionStateBranch.selectors.getMousePosition(state),
        plotDataArray: getScatterPlotDataArray(state),
        thumbnailRoot: selectionStateBranch.selectors.getThumbnailRoot(state),
        xDropDownOptions: getXDisplayOptions(state),
        xDropDownValue: selectionStateBranch.selectors.getPlotByOnX(state),
        xTickConversion: getXTickConversion(state),
        yDropDownOptions: getYDisplayOptions(state),
        yDropDownValue: selectionStateBranch.selectors.getPlotByOnY(state),
        yTickConversion: getYTickConversion(state),
    };
}

const dispatchToPropsMap: DispatchProps = {
    changeHoveredCell: selectionStateBranch.actions.changeHoveredPoint,
    handleChangeAxis: selectionStateBranch.actions.changeAxis,
    handleDeselectPoint: selectionStateBranch.actions.deselectPoint,
    handleLassoOrBoxSelect: selectionStateBranch.actions.lassoOrBoxSelectGroup,
    handleSelectPoint: selectionStateBranch.actions.selectPoint,
    requestCellFileInfoData: metadataStateBranch.actions.requestCellFileInfoData,
    requestCellLineData: metadataStateBranch.actions.requestCellLineData,
    requestFeatureData: metadataStateBranch.actions.requestFeatureData,
    updateMousePosition: selectionStateBranch.actions.changeMousePosition,
};

export default connect<PropsFromState, DispatchProps, OwnProps, State>
    (mapStateToProps, dispatchToPropsMap)(MainPlotContainer);

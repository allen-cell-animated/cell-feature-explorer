import { Popover } from "antd";
import { InfoCircleOutlined } from "@ant-design/icons";
import { filter, includes, map } from "lodash";
import * as React from "react";
import { ActionCreator, connect } from "react-redux";

import AxisDropDown from "../../components/AxisDropDown";
import MainPlot from "../../components/MainPlot";
import MouseFollower from "../../components/MouseFollower";
import PopoverCard from "../../components/PopoverCard/index";
import {
    CELL_ID_KEY,
    GROUP_BY_KEY,
    SCATTER_PLOT_NAME,
    X_AXIS_ID,
    Y_AXIS_ID,
} from "../../constants";
import metadataStateBranch from "../../state/metadata";
import { MeasuredFeatureDef, RequestAction } from "../../state/metadata/types";
import selectionStateBranch from "../../state/selection";
import {
    ChangeHoveredPointAction,
    ChangeMousePositionAction,
    DeselectPointAction,
    LassoOrBoxSelectAction,
    MousePosition,
    SelectAxisAction,
    LassoOrBoxSelectPointData,
    SelectPointAction,
    TickConversion,
    SelectedPointData,
} from "../../state/selection/types";
import { Annotation, State } from "../../state/types";

import {
    getAnnotations,
    getDataForOverlayCard,
    getScatterPlotDataArray,
    getXDisplayOptions,
    getXTickConversion,
    getYDisplayOptions,
    getYTickConversion,
} from "./selectors";
import { getFeatureDefTooltip } from "../../state/selection/selectors";
import { formatThumbnailSrc } from "../../state/util";

import styles from "./style.css";

interface PropsFromState {
    annotations: Annotation[];
    categoricalFeatures: string[];
    clickedPoints: string[];
    filtersToExclude: string[];
    galleryCollapsed: boolean;
    hoveredPointData: SelectedPointData | null;
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
    changeHoveredPoint: ActionCreator<ChangeHoveredPointAction>;
    handleDeselectPoint: ActionCreator<DeselectPointAction>;
    handleLassoOrBoxSelect: ActionCreator<LassoOrBoxSelectAction>;
    handleSelectPoint: ActionCreator<SelectPointAction>;
    requestFeatureData: ActionCreator<RequestAction>;
    updateMousePosition: ActionCreator<ChangeMousePositionAction>;
    handleChangeAxis: ActionCreator<SelectAxisAction>;
    requestCellFileInfoData: ActionCreator<RequestAction>;
}

interface PropsFromApp {
    // props from <App />
    handleSelectionToolUsed: () => void;
}

type MainPlotContainerProps = PropsFromState & DispatchProps & PropsFromApp;

class MainPlotContainer extends React.Component<MainPlotContainerProps> {
    private popoverContainer: React.RefObject<HTMLDivElement>;

    constructor(props: MainPlotContainerProps) {
        super(props);

        this.popoverContainer = React.createRef();

        this.onPointClicked = this.onPointClicked.bind(this);
        this.onPointHovered = this.onPointHovered.bind(this);
        this.onPointUnhovered = this.onPointUnhovered.bind(this);
        this.onGroupSelected = this.onGroupSelected.bind(this);
        this.onPlotUnhovered = this.onPlotUnhovered.bind(this);
        this.renderPopover = this.renderPopover.bind(this);
    }

    private thumbnailTimeout = 0;

    // TODO: retype once plotly has id and fullData types
    public onPointClicked(clicked: any) {
        const { points } = clicked;
        const { clickedPoints, handleSelectPoint, handleDeselectPoint } = this.props;
        points.forEach((point: any) => {
            if (point.data.name === SCATTER_PLOT_NAME) {
                if (includes(clickedPoints, point.id)) {
                    handleDeselectPoint(point.id);
                } else if (point.fullData.marker.opacity) {
                    handleSelectPoint({ id: point.id, index: point.customdata.index });
                }
            }
        });
    }

    // TODO: retype once plotly has id and fullData types
    public onPointHovered(hovered: any) {
        const { points, event } = hovered;
        const { filtersToExclude, updateMousePosition, changeHoveredPoint } = this.props;
        updateMousePosition({
            pageX: event.pageX,
            pageY: event.pageY,
        });

        points.forEach((point: any) => {
            if (
                point.data.name === SCATTER_PLOT_NAME &&
                !includes(filtersToExclude, point.fullData.name)
            ) {
                window.clearTimeout(this.thumbnailTimeout);
                changeHoveredPoint({
                    [CELL_ID_KEY]: point.id,
                    index: point.customdata.index,
                    thumbnailPath: point.customdata.thumbnailPath,
                });
            } else {
                changeHoveredPoint(null);
            }
        });
    }

    public onPointUnhovered() {
        this.thumbnailTimeout = window.setTimeout(() => this.props.changeHoveredPoint(null), 500);
    }

    public onPlotUnhovered({ relatedTarget }: any) {
        const { changeHoveredPoint } = this.props;
        // prevents click events from triggering the popover to close
        if (relatedTarget.className) {
            changeHoveredPoint(null);
        }
    }

    public onGroupSelected(eventData: any) {
        if (!eventData) {
            return;
        }
        const { points } = eventData;
        const pointsWithIds = points;
        const { handleLassoOrBoxSelect, handleSelectionToolUsed } = this.props;
        const key = Date.now().valueOf().toString();
        const payload: LassoOrBoxSelectPointData[] = map(
            filter(pointsWithIds, (ele) => ele.data.name === SCATTER_PLOT_NAME),
            (point) => ({
                pointIndex: point.customdata.index as number,
                cellId: point.id as string,
            })
        );
        handleLassoOrBoxSelect(key, payload);
        handleSelectionToolUsed();
    }

    public renderPopover() {
        const { hoveredPointData, galleryCollapsed, thumbnailRoot } = this.props;
        const thumbnailSrc = formatThumbnailSrc(
            thumbnailRoot,
            hoveredPointData?.thumbnailPath || ""
        );
        return (
            hoveredPointData &&
            galleryCollapsed && (
                <PopoverCard
                    title={hoveredPointData[GROUP_BY_KEY] || ""}
                    description={hoveredPointData[CELL_ID_KEY].toString()}
                    src={thumbnailSrc}
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
                <MouseFollower
                    ref={this.popoverContainer}
                    pageX={mousePosition.pageX}
                    pageY={mousePosition.pageY}
                >
                    <Popover
                        placement="right"
                        content={popover}
                        open={!!popover}
                        getPopupContainer={() => this.popoverContainer.current || document.body}
                        {...{
                            // props not in ant.d component, but do exist
                            // needed to style this component since it's out of the DOM structure
                            id: "thumbnail-popover",
                        }}
                    />
                </MouseFollower>
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
                        tooltip={getFeatureDefTooltip(xDropDownValue, xDropDownOptions)}
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
                        tooltip={getFeatureDefTooltip(yDropDownValue, yDropDownOptions)}
                    />

                    <MainPlot
                        plotDataArray={plotDataArray}
                        onPointClicked={this.onPointClicked}
                        annotations={annotations}
                        onGroupSelected={this.onGroupSelected}
                        onPointHovered={this.onPointHovered}
                        onPointUnhovered={this.onPointUnhovered}
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
        annotations: getAnnotations(state),
        clickedPoints: selectionStateBranch.selectors.getClickedScatterPoints(state),
        categoricalFeatures: metadataStateBranch.selectors.getCategoricalFeatureKeys(state),
        filtersToExclude: selectionStateBranch.selectors.getFiltersToExclude(state),
        galleryCollapsed: selectionStateBranch.selectors.getGalleryCollapsed(state),
        hoveredPointData: getDataForOverlayCard(state),
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
    changeHoveredPoint: selectionStateBranch.actions.changeHoveredPoint,
    handleChangeAxis: selectionStateBranch.actions.changeAxis,
    handleDeselectPoint: selectionStateBranch.actions.deselectPoint,
    handleLassoOrBoxSelect: selectionStateBranch.actions.lassoOrBoxSelectGroup,
    handleSelectPoint: selectionStateBranch.actions.selectPoint,
    requestCellFileInfoData: metadataStateBranch.actions.requestCellFileInfoData,
    requestFeatureData: metadataStateBranch.actions.requestFeatureData,
    updateMousePosition: selectionStateBranch.actions.changeMousePosition,
};

export default connect<PropsFromState, DispatchProps, PropsFromApp, State>(
    mapStateToProps,
    dispatchToPropsMap
)(MainPlotContainer);

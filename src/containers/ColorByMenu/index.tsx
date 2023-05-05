import { Checkbox, Col, Collapse, Row } from "antd";
import { CheckboxChangeEvent } from "antd/es/checkbox";
// import { RadioChangeEvent } from "antd/es/radio";
import { filter, includes } from "lodash";
import React from "react";
import { ActionCreator, connect } from "react-redux";

import AxisDropDown from "../../components/AxisDropDown";
import InteractiveLegend from "../../components/InteractiveLegend";
import ColorBySwitcher from "../../components/ColorBySwitcher";
import ColorLegendRow from "../../components/ColorLegend";
import {
    COLOR_BY_SELECTOR,
    DOWNLOAD_CONFIG_TYPE_PROTEIN,
    DOWNLOAD_CONFIG_TYPE_SELECTION_SET,
} from "../../constants";
import metadataStateBranch from "../../state/metadata";
import { MappingOfMeasuredValuesArrays, MeasuredFeatureDef } from "../../state/metadata/types";
import selectionStateBranch from "../../state/selection";
import { getFeatureDefTooltip, getDownloadRoot } from "../../state/selection/selectors";

import {
    BoolToggleAction,
    ChangeDownloadConfigAction,
    ChangeSelectionAction,
    ColorForPlot,
    DeselectGroupOfPointsAction,
    DownloadConfig,
    SelectAxisAction,
} from "../../state/selection/types";
import { State } from "../../state/types";
import { getColorByDisplayOptions } from "../MainPlotContainer/selectors";

import {
    createUrlFromListOfIds,
    getCheckAllCheckboxIsIntermediate,
    getLegendColors,
    getGroupByTitle,
    getInteractivePanelData,
    getSelectionPanelData,
} from "./selectors";
import { PanelData } from "./types";

import styles from "./style.css";

// const initIndex = 2;

const { Panel } = Collapse;

interface PropsFromState {
    // selector props
    colorBy: keyof MappingOfMeasuredValuesArrays;
    downloadUrls: string[];
    downloadConfig: DownloadConfig;
    downloadRoot: string;
    filtersToExclude: string[];
    interactivePanelData: PanelData[];
    selectionSetsPanelData: PanelData[];
    isInIndeterminateState: boolean;
    colorByMenuOptions: MeasuredFeatureDef[];
    colorForPlot: ColorForPlot[];
    categoryCounts: number[];
    categoricalFeatures: string[];
    groupByTitle: string;
}

interface DispatchProps {
    handleApplyColorSwitchChange: ActionCreator<BoolToggleAction>;
    handleChangeAxis: ActionCreator<SelectAxisAction>;
    handleCloseSelectionSet: ActionCreator<DeselectGroupOfPointsAction>;
    handleFilterByCategoryName: ActionCreator<ChangeSelectionAction>;
    handleChangeDownloadSettings: ActionCreator<ChangeDownloadConfigAction>;
}

interface PropsFromApp {
    // props from <App />
    panelKeys: string[];
    openKeys: string[];
    defaultActiveKey: string[];
    onPanelClicked: (value: string[]) => void;
}

type ColorByMenuProps = PropsFromApp & PropsFromState & DispatchProps;

class ColorByMenu extends React.Component<ColorByMenuProps> {
    // submenu keys of first level

    constructor(props: ColorByMenuProps) {
        super(props);
        this.onBarClicked = this.onBarClicked.bind(this);
        this.onActivePanelChange = this.onActivePanelChange.bind(this);
        this.renderTaggedStructuresPanel = this.renderTaggedStructuresPanel.bind(this);
        this.renderSelectionPanel = this.renderSelectionPanel.bind(this);
        this.allOnOff = this.allOnOff.bind(this);
        this.onCategorySetDownloadButtonClicked = this.onCategorySetDownloadButtonClicked.bind(this);
        this.onSelectionSetDownloadButtonClicked =
            this.onSelectionSetDownloadButtonClicked.bind(this);
    }

    public onBarClicked({ target }: CheckboxChangeEvent) {
        const { handleFilterByCategoryName, filtersToExclude } = this.props;
        const newFilterList = includes(filtersToExclude, target.value)
            ? filter(filtersToExclude, (e) => e !== target.value)
            : [...filtersToExclude, target.value];
        handleFilterByCategoryName(newFilterList);
    }

    public onCategorySetDownloadButtonClicked(categoryName: string) {
        const { handleChangeDownloadSettings } = this.props;
        handleChangeDownloadSettings({
            key: categoryName,
            type: DOWNLOAD_CONFIG_TYPE_PROTEIN,
        });
    }

    public onSelectionSetDownloadButtonClicked(selectionSetId: string) {
        const { handleChangeDownloadSettings } = this.props;
        handleChangeDownloadSettings({
            key: selectionSetId,
            type: DOWNLOAD_CONFIG_TYPE_SELECTION_SET,
        });
    }

    public allOnOff({ target }: CheckboxChangeEvent) {
        const { handleFilterByCategoryName, interactivePanelData } = this.props;
        if (target.checked) {
            return handleFilterByCategoryName([]);
        }
        const keys = interactivePanelData.map((ele: PanelData) => ele.id);
        handleFilterByCategoryName(keys);
    }

    public onActivePanelChange(value: string | string[]) {
        const { onPanelClicked } = this.props;
        onPanelClicked(value as string[]);
    }

    public renderSelectionPanel() {
        const {
            downloadUrls,
            downloadConfig,
            downloadRoot,
            handleApplyColorSwitchChange,
            selectionSetsPanelData,
            handleCloseSelectionSet,
        } = this.props;
        return selectionSetsPanelData.length === 0 ? (
            <span>
                No selected sets yet. Make a selection on the plot using the
                <strong> Lasso Select</strong> or
                <strong> Box Select</strong> tools on the plot, and it will get saved here.
            </span>
        ) : (
            <React.Fragment>
                <ColorBySwitcher
                    defaultChecked={true}
                    handleChange={handleApplyColorSwitchChange}
                    label="Show selections: "
                />
                <div>
                    <InteractiveLegend
                        closeable={true}
                        hideable={false}
                        showTooltips={false}
                        handleCloseSelectionSet={handleCloseSelectionSet}
                        panelData={selectionSetsPanelData}
                        downloadUrls={downloadUrls}
                        downloadConfig={downloadConfig}
                        downloadRoot={downloadRoot}
                        handleDownload={this.onSelectionSetDownloadButtonClicked}
                    />
                </div>
            </React.Fragment>
        );
    }

    public renderTaggedStructuresPanel() {
        const {
            filtersToExclude,
            isInIndeterminateState,
            interactivePanelData,
            downloadUrls,
            downloadConfig,
            downloadRoot,
            colorBy,
            colorByMenuOptions,
            handleChangeAxis,
            colorForPlot,
            categoryCounts,
            categoricalFeatures,
        } = this.props;
        return (
            <React.Fragment>
                <Row className={styles.colorByRow}>
                    <Col span={6}>Color by:</Col>
                    <Col span={18}>
                        <AxisDropDown
                            axisId={COLOR_BY_SELECTOR}
                            value={colorBy as string}
                            options={colorByMenuOptions}
                            handleChangeAxis={handleChangeAxis}
                            tooltip={getFeatureDefTooltip(colorBy as string, colorByMenuOptions)}
                        />
                    </Col>
                </Row>
                {includes(categoricalFeatures, colorBy) && (
                    <Row className={styles.colorByRow}>
                        <Col span={6} />
                        <Col span={18}>
                            {colorForPlot.map((ele, index) => {
                                return (
                                    <ColorLegendRow
                                        color={ele.color}
                                        name={ele.label}
                                        key={ele.name}
                                        total={categoryCounts[index]}
                                    />
                                );
                            })}
                        </Col>
                    </Row>
                )}

                <div>
                    <div className={styles.interactiveLegendHeader}>
                        <Checkbox
                            indeterminate={isInIndeterminateState}
                            checked={filtersToExclude.length === 0}
                            onChange={this.allOnOff}
                        >
                            Show/Hide all
                        </Checkbox>
                        <span className={styles.label}># of cells</span>
                    </div>

                    <InteractiveLegend
                        closeable={false}
                        showTooltips={true}
                        panelData={interactivePanelData}
                        downloadUrls={downloadUrls}
                        downloadConfig={downloadConfig}
                        downloadRoot={downloadRoot}
                        hideable={true}
                        onBarClicked={this.onBarClicked}
                        handleDownload={this.onCategorySetDownloadButtonClicked}
                    />
                </div>
            </React.Fragment>
        );
    }

    public render() {
        const { defaultActiveKey, openKeys, panelKeys, groupByTitle } = this.props;
        return (
            <Collapse
                defaultActiveKey={defaultActiveKey}
                activeKey={openKeys}
                onChange={this.onActivePanelChange}
            >
                <Panel key={panelKeys[0]} header={`Data grouped by ${groupByTitle}`}>
                    {this.renderTaggedStructuresPanel()}
                </Panel>
                <Panel key={panelKeys[1]} header="Selected sets">
                    {this.renderSelectionPanel()}
                </Panel>
            </Collapse>
        );
    }
}

function mapStateToProps(state: State): PropsFromState {
    return {
        categoryCounts: selectionStateBranch.selectors.getColorByCategoryCounts(state),
        colorBy: selectionStateBranch.selectors.getColorBySelection(state),
        colorByMenuOptions: getColorByDisplayOptions(state),
        colorForPlot: getLegendColors(state),
        categoricalFeatures: metadataStateBranch.selectors.getCategoricalFeatureKeys(state),
        downloadConfig: selectionStateBranch.selectors.getDownloadConfig(state),
        downloadUrls: createUrlFromListOfIds(state),
        downloadRoot: getDownloadRoot(state),
        filtersToExclude: selectionStateBranch.selectors.getFiltersToExclude(state),
        groupByTitle: getGroupByTitle(state),
        interactivePanelData: getInteractivePanelData(state),
        selectionSetsPanelData: getSelectionPanelData(state),
        isInIndeterminateState: getCheckAllCheckboxIsIntermediate(state),
    };
}

const dispatchToPropsMap: DispatchProps = {
    handleApplyColorSwitchChange: selectionStateBranch.actions.toggleApplySelectionSetColors,
    handleChangeAxis: selectionStateBranch.actions.changeAxis,
    handleChangeDownloadSettings: selectionStateBranch.actions.changeDownloadSettings,
    handleCloseSelectionSet: selectionStateBranch.actions.deselectGroupOfPoints,
    handleFilterByCategoryName: selectionStateBranch.actions.toggleFilterByCategoryName,
};
export default connect<PropsFromState, DispatchProps, PropsFromApp, State>(
    mapStateToProps,
    dispatchToPropsMap
)(ColorByMenu);

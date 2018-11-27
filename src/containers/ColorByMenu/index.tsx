import {
    Col,
    Collapse,
    Radio,
    Row,
} from "antd";
import { CheckboxChangeEvent } from "antd/es/checkbox";
import "antd/es/collapse/style";
import { RadioChangeEvent } from "antd/es/radio";
import "antd/es/radio/style";
import "antd/es/switch/style";

import {
    includes,
    indexOf,
    values,
} from "lodash";
import {
    Color,
} from "plotly.js";
import React from "react";
import {
    ActionCreator,
    connect,
} from "react-redux";

import BarChart from "../../components/BarChart";
import {
    AGGLOMERATIVE_KEY,
    COLOR_BY_SELECTOR,
    DBSCAN_KEY,
    DISABLE_COLOR,
    KMEANS_KEY,
    OFF_COLOR,
    PROTEIN_NAME_KEY
} from "../../constants";
import {
    getProteinNames,
    getProteinTotals
} from "../../state/metadata/selectors";

import selectionStateBranch from "../../state/selection";
import {
    CLUSTERING_LABEL,
    CLUSTERING_MAP,
} from "../../state/selection/constants";
import {
    BoolToggleAction,
    ChangeClusterNumberAction,
    ChangeSelectionAction,
    ClusteringTypeChoices,
    DeselectGroupOfPointsAction,
    SelectAxisAction,
} from "../../state/selection/types";

import {
    NumberOrString,
    State,
} from "../../state/types";

import ColorBySwitcher from "../../components/ColorBySwitcher";
import SliderWithCustomMarks from "../../components/SliderWithCustomMarks";
import AxisDropDown from "../AxisDropDown";

const styles = require("./style.css");

const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;
const initIndex = 2;

const { Panel } = Collapse;

interface ColorByMenuProps {
    applyColorToSelections: boolean;
    colorBy: string;
    clusteringAlgorithm: ClusteringTypeChoices;
    clusteringOptions: string[];
    clusteringSetting: string;
    defaultActiveKey: string[];
    filtersToExclude: string[];
    handleApplyColorSwitchChange: ActionCreator<BoolToggleAction>;
    handleChangeAxis: ActionCreator<SelectAxisAction>;
    handleChangeClusteringAlgorithm: ActionCreator<ChangeSelectionAction>;
    handleChangeClusteringNumber: ActionCreator<ChangeClusterNumberAction>;
    handleCloseSelectionSet: ActionCreator<DeselectGroupOfPointsAction>;
    handleClusteringToggle: ActionCreator<BoolToggleAction>;
    handleFilterByProteinName: ActionCreator<ChangeSelectionAction>;
    openKeys: string[];
    onPanelClicked: (value: string[]) => void;
    panelKeys: string[];
    proteinColors: Color[];
    proteinNames: string[];
    proteinTotals: number[];
    selectedSetColors: Color[];
    selectedSetNames: NumberOrString[];
    selectedSetTotals: number[];
    showClusters: boolean;
}

class ColorByMenu extends React.Component<ColorByMenuProps> {
    // submenu keys of first level

    constructor(props: ColorByMenuProps) {
        super(props);
        this.onBarClicked = this.onBarClicked.bind(this);
        this.onColorBySwitchChanged = this.onColorBySwitchChanged.bind(this);
        this.onActivePanelChange = this.onActivePanelChange.bind(this);
        this.changeClusteringAlgorithm = this.changeClusteringAlgorithm.bind(this);
        this.changeClusteringNumber = this.changeClusteringNumber.bind(this);
        this.renderProteinPanel = this.renderProteinPanel.bind(this);
        this.renderSelectionPanel = this.renderSelectionPanel.bind(this);
        this.renderClusteringPanel = this.renderClusteringPanel.bind(this);
    }

    public componentDidUpdate() {
        const {
            clusteringAlgorithm,
            handleChangeClusteringNumber,
            clusteringSetting,
            clusteringOptions,
        } = this.props;
        if (!clusteringSetting) {
            handleChangeClusteringNumber(
                CLUSTERING_MAP(clusteringAlgorithm), clusteringOptions[initIndex]);
        }
    }

    public onBarClicked({ target }: CheckboxChangeEvent) {
        const { handleFilterByProteinName } = this.props;
        handleFilterByProteinName(target.value);
    }

    public onColorBySwitchChanged(colorByProtein: boolean) {
        const { handleChangeAxis } = this.props;
        if (colorByProtein) {
            return handleChangeAxis(COLOR_BY_SELECTOR, PROTEIN_NAME_KEY);
        }
        handleChangeAxis(COLOR_BY_SELECTOR, "Nuclear Volume (fL)");
    }

    public onActivePanelChange(value: string | string[]) {
        this.props.onPanelClicked(value as string[]);
    }

    public changeClusteringAlgorithm({ target }: RadioChangeEvent) {
        const { handleChangeClusteringAlgorithm } = this.props;
        handleChangeClusteringAlgorithm(target.value);
    }

    public changeClusteringNumber(value: string) {
        const { handleChangeClusteringNumber, clusteringAlgorithm } = this.props;
        handleChangeClusteringNumber(CLUSTERING_MAP(clusteringAlgorithm), value);
    }

    public renderClusteringPanel() {
        const {
            clusteringAlgorithm,
            clusteringSetting,
            handleClusteringToggle,
            clusteringOptions,
            showClusters,
        } = this.props;
        const initSliderSetting: number = indexOf(clusteringOptions, clusteringSetting) || initIndex;

        return (

            <React.Fragment>
                <ColorBySwitcher
                    defaultChecked={false}
                    handleChange={handleClusteringToggle}
                    label="Show clusters:"
                />
                <Row
                    className={styles.colorByRow}
                    type="flex"
                    align="middle"
                >
                    <RadioGroup
                        onChange={this.changeClusteringAlgorithm}
                        defaultValue={KMEANS_KEY}
                        disabled={!showClusters}
                    >
                        <RadioButton value={KMEANS_KEY}>KMeans</RadioButton>
                        <RadioButton value={AGGLOMERATIVE_KEY}>Agglomerative</RadioButton>
                        <RadioButton value={DBSCAN_KEY}>DBSCAN</RadioButton>
                    </RadioGroup>
                </Row>
                    <SliderWithCustomMarks
                        disabled={!showClusters}
                        label={CLUSTERING_LABEL[CLUSTERING_MAP(clusteringAlgorithm)]}
                        onValueChange={this.changeClusteringNumber}
                        valueOptions={clusteringOptions}
                        initIndex={initSliderSetting}
                    />
            </React.Fragment>
        );
    }

    public renderSelectionPanel() {
        const {
            applyColorToSelections,
            selectedSetNames,
            selectedSetColors,
            selectedSetTotals,
            handleApplyColorSwitchChange,
            handleCloseSelectionSet,
        } = this.props;
        return selectedSetTotals.length === 0 ?
            (
                <span>No selected sets yet. Make a selection on the chart using the
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
                    <BarChart
                        names={
                            selectedSetNames.map(
                                (ele: number | string, index: number) => Number(ele) ? index : ele)
                        }
                        ids={selectedSetNames}
                        closeable={true}
                        hideable={false}
                        totals={selectedSetTotals}
                        handleCloseSelectionSet={handleCloseSelectionSet}
                        colors={applyColorToSelections ?
                            values(selectedSetColors) :
                            Array(selectedSetTotals.length).fill(DISABLE_COLOR)
                        }
                    />
                </div>
            </React.Fragment>
        );
    }

    public renderProteinPanel() {
        const {
            colorBy,
            filtersToExclude,
            proteinNames,
            proteinTotals,
            proteinColors,

        } = this.props;

        return (
            <React.Fragment>
                <ColorBySwitcher
                    defaultChecked={true}
                    label="Color by: "
                    handleChange={this.onColorBySwitchChanged}
                    includeCol={12}
                    checkedChildren="protein"
                    unCheckedChildren="cellular feature"
                >
                    {colorBy === PROTEIN_NAME_KEY ? null : (
                        <Col span={6}>
                            <AxisDropDown
                                axisId={COLOR_BY_SELECTOR}
                            />
                        </Col>
                    )}
                </  ColorBySwitcher >
                <div>
                    <BarChart
                        names={proteinNames}
                        ids={proteinNames}
                        totals={proteinTotals}
                        closeable={false}
                        hideable={true}
                        colors={colorBy === PROTEIN_NAME_KEY ?
                            proteinNames
                                .map((ele: NumberOrString, index: number) =>
                                    includes(filtersToExclude, ele) ? OFF_COLOR : proteinColors[index]) :
                            proteinNames
                                .map((ele: NumberOrString, index: number) =>
                                    includes(filtersToExclude, ele) ? OFF_COLOR : DISABLE_COLOR)
                    }
                        onBarClicked={this.onBarClicked}
                    />
                </div>
            </React.Fragment>
        );
    }

    public render() {
        const {
            defaultActiveKey,
            openKeys,
            panelKeys,
        } = this.props;
        return (
                <Collapse
                    defaultActiveKey={defaultActiveKey}
                    activeKey={openKeys}
                    onChange={this.onActivePanelChange}
                >
                    <Panel
                        key={panelKeys[0]}
                        header="Data grouped by tagged structures"
                    >
                        {this.renderProteinPanel()}
                    </Panel>
                    <Panel
                        key={panelKeys[1]}
                        header="Selected sets"
                    >
                        {this.renderSelectionPanel()}
                    </Panel>
                    <Panel
                        key={panelKeys[2]}
                        header="Data group by clustering"
                    >
                        {this.renderClusteringPanel()}
                    </Panel>
                </Collapse>
        );
    }
}

function mapStateToProps(state: State) {
    return {
        applyColorToSelections: selectionStateBranch.selectors.getApplyColorToSelections(state),
        clusteringAlgorithm: selectionStateBranch.selectors.getClusteringAlgorithm(state),
        clusteringOptions: selectionStateBranch.selectors.getClusteringRange(state),
        clusteringSetting: selectionStateBranch.selectors.getClusteringSetting(state),
        colorBy: selectionStateBranch.selectors.getColorBySelection(state),
        filtersToExclude: selectionStateBranch.selectors.getFiltersToExclude(state),
        proteinColors: selectionStateBranch.selectors.getProteinColors(state),
        proteinNames: getProteinNames(state),
        proteinTotals: getProteinTotals(state),
        selectedSetColors: selectionStateBranch.selectors.getSelectionSetColors(state),
        selectedSetNames: selectionStateBranch.selectors.getSelectedGroupKeys(state),
        selectedSetTotals: selectionStateBranch.selectors.getSelectedSetTotals(state),
        showClusters: selectionStateBranch.selectors.getClustersOn(state),
    };
}

const dispatchToPropsMap = {
    handleApplyColorSwitchChange: selectionStateBranch.actions.toggleApplySelectionSetColors,
    handleChangeAxis: selectionStateBranch.actions.changeAxis,
    handleChangeClusteringAlgorithm: selectionStateBranch.actions.changeClusteringAlgorithm,
    handleChangeClusteringNumber: selectionStateBranch.actions.changeClusteringNumber,
    handleCloseSelectionSet: selectionStateBranch.actions.deselectGroupOfPoints,
    handleClusteringToggle: selectionStateBranch.actions.toggleShowClusters,
    handleFilterByProteinName: selectionStateBranch.actions.toggleFilterByProteinName,
};

export default connect(mapStateToProps, dispatchToPropsMap)(ColorByMenu);

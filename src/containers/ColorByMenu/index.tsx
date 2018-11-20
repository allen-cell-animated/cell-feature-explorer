import {
    Col,
    Collapse,
    Radio,
    Row,
    Switch,
} from "antd";
import { CheckboxChangeEvent } from "antd/lib/checkbox";
import "antd/lib/collapse/style";
import { RadioChangeEvent } from "antd/lib/radio";
import "antd/lib/radio/style";
import "antd/lib/switch/style";

import {
    includes,
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
    COLOR_BY_SELECTOR,
    DISABLE_COLOR,
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

import SliderWithCustomMarks from "../../components/SliderWithCustomMarks";
import AxisDropDown from "../AxisDropDown";

const styles = require("./style.css");

const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;

const { Panel } = Collapse;

interface ColorByMenuProps {
    applyColorToSelections: boolean;
    colorBy: string;
    clusteringAlgorithm: ClusteringTypeChoices;
    clusteringOptions: string[];
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

    public render() {
        const {
            applyColorToSelections,
            clusteringAlgorithm,
            colorBy,
            defaultActiveKey,
            openKeys,
            filtersToExclude,
            panelKeys,
            proteinNames,
            proteinTotals,
            proteinColors,
            selectedSetNames,
            selectedSetColors,
            selectedSetTotals,
            handleApplyColorSwitchChange,
            handleCloseSelectionSet,
            handleClusteringToggle,
            clusteringOptions,
            showClusters,
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
                        <Row
                            className={styles.colorByRow}
                            type="flex"
                            align="middle"
                        >
                            <Col span={12}>
                                <label className={styles.label}>Color by:</label>
                                <Switch
                                    className={styles.colorBySwitch}
                                    defaultChecked={true}
                                    checkedChildren="protein"
                                    unCheckedChildren="cellular feature"
                                    onChange={this.onColorBySwitchChanged}
                                />
                            </Col>
                                {colorBy === PROTEIN_NAME_KEY ? null : (
                                <Col span={6}>
                                    <AxisDropDown
                                        axisId={COLOR_BY_SELECTOR}
                                    />
                                </Col>
                            )}
                        </Row>
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
                    </Panel>
                    <Panel
                        key={panelKeys[1]}
                        header="Selected sets"
                    >
                        {selectedSetTotals.length === 0 ?
                            (<span>
                                No selected sets yet. Make a selection on the chart using the
                                <strong> Lasso Select</strong> or
                                <strong> Box Select</strong> tools on the plot, and it will get saved here.
                            </span>) :

                            (<React.Fragment>
                                <Row
                                    className={styles.colorByRow}
                                    type="flex"
                                    align="middle"
                                >

                                <label className={styles.label}>Show selections: </label>
                                    <Switch
                                        className={styles.colorBySwitch}
                                        defaultChecked={true}
                                        onChange={handleApplyColorSwitchChange}
                                    />
                                </Row>
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
                                        values(selectedSetColors) : Array(selectedSetTotals.length).fill(DISABLE_COLOR)
                                    }
                                />
                                </div>
                            </React.Fragment>
                            )
                        }
                    </Panel>
                    <Panel
                        key={panelKeys[2]}
                        header="Data group by clustering"
                    >
                        <Row
                            className={styles.colorByRow}
                            type="flex"
                            align="middle"
                        >
                            <label className={styles.label}>Show clusters: </label>
                            <Switch
                                className={styles.colorBySwitch}
                                defaultChecked={false}
                                onChange={handleClusteringToggle}
                            />
                        </Row>
                        <Row
                            className={styles.colorByRow}
                            type="flex"
                            align="middle"
                        >
                            <RadioGroup
                                onChange={this.changeClusteringAlgorithm}
                                defaultValue="KMeans"
                                disabled={!showClusters}
                            >
                                <RadioButton value="KMeans">KMeans</RadioButton>
                                <RadioButton value="Agglomerative">Agglomerative</RadioButton>
                                <RadioButton value="DBSCAN">DBSCAN</RadioButton>
                            </RadioGroup>
                        </Row>
                        <SliderWithCustomMarks
                            disabled={!showClusters}
                            label={CLUSTERING_LABEL[CLUSTERING_MAP(clusteringAlgorithm)]}
                            onValueChange={this.changeClusteringNumber}
                            valueOptions={clusteringOptions}
                        />
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

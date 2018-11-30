import {
    Checkbox,
    Col,
    Collapse,
    Radio,
    Row,
} from "antd";
import { CheckboxChangeEvent } from "antd/es/checkbox";
import { RadioChangeEvent } from "antd/es/radio";

import {
    filter,
    includes,
    indexOf,
    map,
} from "lodash";
import React from "react";
import {
    ActionCreator,
    connect,
} from "react-redux";

import {
    AGGLOMERATIVE_KEY,
    COLOR_BY_SELECTOR,
    DBSCAN_KEY,
    KMEANS_KEY,
    PROTEIN_NAME_KEY
} from "../../constants";
import {
    getProteinNames,
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
    State,
} from "../../state/types";

import BarChart from "../../components/BarChart";
import ColorBySwitcher from "../../components/ColorBySwitcher";
import SliderWithCustomMarks from "../../components/SliderWithCustomMarks";
import AxisDropDown from "../AxisDropDown";

import {
    getCellIdsByProteinName,
    getCheckAllCheckboxIsIntermediate,
    getInteractivePanelData,
    getSelectionPanelData,
} from "./selectors";
import { PanelData } from "./types";
const styles = require("./style.css");

const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;
const initIndex = 2;

const { Panel } = Collapse;

interface ColorByMenuProps {
    clusteringAlgorithm: ClusteringTypeChoices;
    clusteringOptions: string[];
    clusteringSetting: string;
    colorBy: string;
    defaultActiveKey: string[];
    filtersToExclude: string[];
    proteinPanelData: PanelData[];
    showClusters: boolean;
    someProteinsOff: boolean;
    proteinNames: string[];
    selectionSetsPanelData: PanelData[];
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
        this.allOnOff = this.allOnOff.bind(this);
        this.onProteinDownloadButtonClicked = this.onProteinDownloadButtonClicked.bind(this);
        this.state = {
            downloadAllUrl: '',
        }
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
        const { handleFilterByProteinName, filtersToExclude } = this.props;
        const newFilterList = includes(filtersToExclude, target.value) ?
            filter(filtersToExclude, (e) => e !== target.value) : [...filtersToExclude, target.value];
        handleFilterByProteinName(newFilterList);
    }

    public onProteinDownloadButtonClicked(proteinName) {
        const { cellIdsByProteinName } = this.props;
        const idsToDownload = cellIdsByProteinName[proteinName].slice(0,3);
        this.setState({ downloadAllUrl: `https://files.allencell.org/api/2.0/file/download?collection=cellviewer-1-3${map(idsToDownload, (cellId) => `&id=${cellId}`).join("")}`})
    }

    public allOnOff({ target }: CheckboxChangeEvent) {
        const { handleFilterByProteinName, proteinNames } = this.props;
        if (target.checked) {
            return handleFilterByProteinName([]);
        }
        handleFilterByProteinName(proteinNames);
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
            handleApplyColorSwitchChange,
            selectionSetsPanelData,
            handleCloseSelectionSet,
        } = this.props;
        return selectionSetsPanelData.length === 0 ?
            (
                <span>No selected sets yet. Make a selection on the plot using the
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
                        closeable={true}
                        hideable={false}
                        handleCloseSelectionSet={handleCloseSelectionSet}
                        panelData={selectionSetsPanelData}
                    />
                </div>
            </React.Fragment>
        );
    }

    public renderProteinPanel() {
        const {
            filtersToExclude,
            someProteinsOff,
            proteinPanelData,
        } = this.props;
        return (
            <React.Fragment>

                <Row className={styles.colorByRow}>
                        <Col span={6}>
                            Color by:
                        </Col>
                        <Col span={6}>
                            <AxisDropDown
                                axisId={COLOR_BY_SELECTOR}
                            />
                        </Col>
                </Row>

                <div>
                    <div className={styles.barChartHeader}>
                        <Checkbox
                            indeterminate={someProteinsOff}
                            checked={filtersToExclude.length === 0}
                            onChange={this.allOnOff}
                        >
                            Show/Hide all
                        </Checkbox>
                        <span className={styles.label}># of cells</span>
                    </div>

                    <BarChart
                        closeable={false}
                        panelData={proteinPanelData}
                        downloadAllUrl={this.state.downloadAllUrl}
                        hideable={true}
                        onBarClicked={this.onBarClicked}
                        handleDownload={this.onProteinDownloadButtonClicked}
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
        cellIdsByProteinName: getCellIdsByProteinName(state),
        clusteringAlgorithm: selectionStateBranch.selectors.getClusteringAlgorithm(state),
        clusteringOptions: selectionStateBranch.selectors.getClusteringRange(state),
        clusteringSetting: selectionStateBranch.selectors.getClusteringSetting(state),
        colorBy: selectionStateBranch.selectors.getColorBySelection(state),
        filtersToExclude: selectionStateBranch.selectors.getFiltersToExclude(state),
        proteinNames: getProteinNames(state),
        proteinPanelData: getInteractivePanelData(state),
        selectionSetsPanelData: getSelectionPanelData(state),
        showClusters: selectionStateBranch.selectors.getClustersOn(state),
        someProteinsOff: getCheckAllCheckboxIsIntermediate(state),
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

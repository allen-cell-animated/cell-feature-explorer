import {
    Checkbox,
    Col,
    Collapse,
    Row,
} from "antd";
import { CheckboxChangeEvent } from "antd/es/checkbox";
// import { RadioChangeEvent } from "antd/es/radio";
import {
    filter,
    includes,
} from "lodash";
import React from "react";
import {
    ActionCreator,
    connect,
} from "react-redux";

import AxisDropDown from "../../components/AxisDropDown";
import BarChart from "../../components/BarChart";
import ColorBySwitcher from "../../components/ColorBySwitcher";
import ColorLegendRow from "../../components/ColorLegend";
import {
    COLOR_BY_SELECTOR,
    DOWNLOAD_CONFIG_TYPE_PROTEIN,
    DOWNLOAD_CONFIG_TYPE_SELECTION_SET,
} from "../../constants";
import metadataStateBranch from "../../state/metadata";
import { MeasuredFeatureDef } from "../../state/metadata/types";
import selectionStateBranch from "../../state/selection";
import { getFeatureDefTooltip } from "../../state/selection/selectors";

import {
    BoolToggleAction,
    ChangeDownloadConfigAction,
    ChangeSelectionAction,
    ColorForPlot,
    DeselectGroupOfPointsAction,
    DownloadConfig,
    SelectAxisAction,
} from "../../state/selection/types";
import {
    State,
} from "../../state/types";
import { getColorByDisplayOptions } from "../MainPlotContainer/selectors";

import {
    createUrlFromListOfIds,
    getCheckAllCheckboxIsIntermediate,
    getInteractivePanelData,
    getSelectionPanelData,
} from "./selectors";
import { PanelData } from "./types";

const styles = require("./style.css");

// const initIndex = 2;

const { Panel } = Collapse;

interface PropsFromState {
    // selector props
    // clusteringAlgorithm: ClusteringTypeChoices;
    // clusteringOptions: string[];
    // clusteringSetting: string;
    colorBy: string;
    downloadUrls: string[];
    downloadConfig: DownloadConfig;
    filtersToExclude: string[];
    proteinPanelData: PanelData[];
    proteinNames: string[];
    selectionSetsPanelData: PanelData[];
    showClusters: boolean;
    someProteinsOff: boolean;
    colorByMenuOptions: MeasuredFeatureDef[];
    colorForPlot: ColorForPlot[];
    categoryCounts: number[];
    categoricalFeatures: string[];
}

interface DispatchProps {
    handleApplyColorSwitchChange: ActionCreator<BoolToggleAction>;
    handleChangeAxis: ActionCreator<SelectAxisAction>;
    // handleChangeClusteringAlgorithm: ActionCreator<ChangeSelectionAction>;
    // handleChangeClusteringNumber: ActionCreator<ChangeClusterNumberAction>;
    handleCloseSelectionSet: ActionCreator<DeselectGroupOfPointsAction>;
    // handleClusteringToggle: ActionCreator<BoolToggleAction>;
    handleFilterByProteinName: ActionCreator<ChangeSelectionAction>;
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

class ColorByMenu extends React.Component<ColorByMenuProps, {}> {
    // submenu keys of first level

    constructor(props: ColorByMenuProps) {
        super(props);
        this.onBarClicked = this.onBarClicked.bind(this);
        this.onActivePanelChange = this.onActivePanelChange.bind(this);
        // this.changeClusteringAlgorithm = this.changeClusteringAlgorithm.bind(this);
        // this.changeClusteringNumber = this.changeClusteringNumber.bind(this);
        this.renderProteinPanel = this.renderProteinPanel.bind(this);
        this.renderSelectionPanel = this.renderSelectionPanel.bind(this);
        this.renderClusteringPanel = this.renderClusteringPanel.bind(this);
        this.allOnOff = this.allOnOff.bind(this);
        this.onProteinDownloadButtonClicked = this.onProteinDownloadButtonClicked.bind(this);
        this.onSelectionSetDownloadButtonClicked = this.onSelectionSetDownloadButtonClicked.bind(this);
    }

    public onBarClicked({ target }: CheckboxChangeEvent) {
        const { handleFilterByProteinName, filtersToExclude } = this.props;
        const newFilterList = includes(filtersToExclude, target.value) ?
            filter(filtersToExclude, (e) => e !== target.value) : [...filtersToExclude, target.value];
        handleFilterByProteinName(newFilterList);
    }

    public onProteinDownloadButtonClicked(proteinName: string) {
        const { handleChangeDownloadSettings } = this.props;
        handleChangeDownloadSettings({
            key: proteinName,
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
        const { handleFilterByProteinName, proteinNames } = this.props;
        if (target.checked) {
            return handleFilterByProteinName([]);
        }
        handleFilterByProteinName(proteinNames);
    }

    public onActivePanelChange(value: string | string[]) {
        const { onPanelClicked } = this.props;
        onPanelClicked(value as string[]);
    }

    public changeClusteringAlgorithm() {
        // const { handleChangeClusteringAlgorithm } = this.props;
        // handleChangeClusteringAlgorithm(target.value);
    }

    public changeClusteringNumber() {
        // const { handleChangeClusteringNumber, clusteringAlgorithm } = this.props;
        // handleChangeClusteringNumber(CLUSTERING_MAP(clusteringAlgorithm), value);
    }

    public renderClusteringPanel() {
        // const {
        //     clusteringAlgorithm,
        //     clusteringSetting,
        //     handleClusteringToggle,
        //     clusteringOptions,
        //     showClusters,
        // } = this.props;
        // const initSliderSetting: number = indexOf(clusteringOptions, clusteringSetting) || initIndex;

        // return (
        //     <React.Fragment>
        //         <ColorBySwitcher
        //             defaultChecked={false}
        //             handleChange={handleClusteringToggle}
        //             label="Show clusters:"
        //         />
        //         <Row
        //             className={styles.colorByRow}
        //             type="flex"
        //             align="middle"
        //         >
        //             <RadioGroup
        //                 onChange={this.changeClusteringAlgorithm}
        //                 defaultValue={KMEANS_KEY}
        //                 disabled={!showClusters}
        //             >
        //                 <RadioButton value={KMEANS_KEY}>KMeans</RadioButton>
        //                 <RadioButton value={AGGLOMERATIVE_KEY}>Agglomerative</RadioButton>
        //                 <RadioButton value={SPECTRAL_KEY}>Spectral</RadioButton>
        //             </RadioGroup>
        //         </Row>
        //             <SliderWithCustomMarks
        //                 disabled={!showClusters}
        //                 label={CLUSTERING_LABEL[CLUSTERING_MAP(clusteringAlgorithm)]}
        //                 onValueChange={this.changeClusteringNumber}
        //                 valueOptions={clusteringOptions}
        //                 initIndex={initSliderSetting}
        //             />
        //     </React.Fragment>
        // );
    }

    public renderSelectionPanel() {
        const {
            downloadUrls,
            downloadConfig,
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
                        downloadUrls={downloadUrls}
                        downloadConfig={downloadConfig}
                        handleDownload={this.onSelectionSetDownloadButtonClicked}
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
            downloadUrls,
            downloadConfig,
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
                            value={colorBy}
                            options={colorByMenuOptions}
                            handleChangeAxis={handleChangeAxis}
                            tooltip={getFeatureDefTooltip(colorBy, colorByMenuOptions)}
                        />
                    </Col>
                </Row>
                {includes(categoricalFeatures, colorBy) && (
                    <Row className={styles.colorByRow}>
                        <Col span={6} />
                        <Col span={18}>
                            {colorForPlot.map((ele, index) => {
                                return (<ColorLegendRow
                                        color={ele.color}
                                        name={ele.label}
                                        key={ele.name}
                                        total={categoryCounts[index]}
                                    />);
                            })}
                        </Col>
                    </Row>
                )}

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
                        downloadUrls={downloadUrls}
                        downloadConfig={downloadConfig}
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
                    {/* <Panel
                        key={panelKeys[2]}
                        header="Data group by clustering"
                    >
                        {this.renderClusteringPanel()}
                    </Panel> */}
                </Collapse>
        );
    }
}

function mapStateToProps(state: State): PropsFromState {
    return {
        categoryCounts: selectionStateBranch.selectors.getCategoryCounts(state),
        colorBy: selectionStateBranch.selectors.getColorBySelection(state),
        colorByMenuOptions: getColorByDisplayOptions(state),
        colorForPlot: selectionStateBranch.selectors.getColorsForPlot(state),
        categoricalFeatures: metadataStateBranch.selectors.getCategoricalFeatureKeys(state),
        downloadConfig: selectionStateBranch.selectors.getDownloadConfig(state),
        downloadUrls: createUrlFromListOfIds(state),
        filtersToExclude: selectionStateBranch.selectors.getFiltersToExclude(state),
        proteinNames: metadataStateBranch.selectors.getProteinNames(state),
        proteinPanelData: getInteractivePanelData(state),
        selectionSetsPanelData: getSelectionPanelData(state),
        showClusters: selectionStateBranch.selectors.getClustersOn(state),
        someProteinsOff: getCheckAllCheckboxIsIntermediate(state),
    };
}

const dispatchToPropsMap: DispatchProps = {
    handleApplyColorSwitchChange: selectionStateBranch.actions.toggleApplySelectionSetColors,
    handleChangeAxis: selectionStateBranch.actions.changeAxis,
    // handleChangeClusteringAlgorithm: selectionStateBranch.actions.changeClusteringAlgorithm,
    // handleChangeClusteringNumber: selectionStateBranch.actions.changeClusteringNumber,
    handleChangeDownloadSettings: selectionStateBranch.actions.changeDownloadSettings,
    handleCloseSelectionSet: selectionStateBranch.actions.deselectGroupOfPoints,
    // handleClusteringToggle: selectionStateBranch.actions.toggleShowClusters,
    handleFilterByProteinName: selectionStateBranch.actions.toggleFilterByProteinName,
};
export default connect<PropsFromState, DispatchProps, PropsFromApp, State>(
    mapStateToProps,
    dispatchToPropsMap
)(ColorByMenu);

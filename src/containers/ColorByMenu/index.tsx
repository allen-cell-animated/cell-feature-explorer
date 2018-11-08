import {
    Col,
    Collapse,
    Row,
    Switch,
} from "antd";
import "antd/lib/collapse/style";
import "antd/lib/switch/style";
import { includes, values } from "lodash";
import {
    Color,
    PlotMouseEvent,
} from "plotly.js";
import React from "react";
import { connect } from "react-redux";

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
import {
    changeAxis, toggleApplySelectionSetColors,
    toggleFilterByProteinName,
} from "../../state/selection/actions";
import {
    getApplyColorToSelections,
    getColorBySelection,
    getFiltersToExclude,
    getProteinColors,
    getSelectedGroupKeys,
    getSelectedSetTotals,
    getSelectionSetColors,
} from "../../state/selection/selectors";
import {
    SelectAxisAction,
    ToggleApplyColorAction,
    ToggleFilterAction,
} from "../../state/selection/types";

import {
    NumberOrString,
    State,
} from "../../state/types";
import AxisDropDown from "../AxisDropDown";

const styles = require("./style.css");

const { Panel } = Collapse;

interface ColorByMenuProps {
    applyColorToSelections: boolean;
    colorBy: string;
    filtersToExclude: string[];
    handleChangeAxis: (axisName: string, proteinName: string) => SelectAxisAction;
    handleFilterByProteinName: (payload: string) => ToggleFilterAction;
    handleApplyColorSwitchChange: (payload: boolean) => ToggleApplyColorAction;
    proteinColors: Color[];
    proteinNames: string[];
    proteinTotals: number[];
    selectedSetColors: Color[];
    selectedSetNames: NumberOrString[];
    selectedSetTotals: number[];
}

class ColorByMenu extends React.Component<ColorByMenuProps> {
    // submenu keys of first level
    public panelKeys = ["strucutreProteinName", "clusters"];
    public defaultActiveKey =  this.panelKeys[0];

    constructor(props: ColorByMenuProps) {
        super(props);
        this.onBarClicked = this.onBarClicked.bind(this);
        this.onColorBySwitchChanged = this.onColorBySwitchChanged.bind(this);

    }

    public onBarClicked(clickEvent: PlotMouseEvent) {
        const { handleFilterByProteinName } = this.props;
        const { points } = clickEvent;
        const proteinName = points[0].y as string;
        handleFilterByProteinName(proteinName);
    }

    public onColorBySwitchChanged(colorByProtein: boolean) {
        const { handleChangeAxis } = this.props;
        if (colorByProtein) {
            return handleChangeAxis(COLOR_BY_SELECTOR, PROTEIN_NAME_KEY);
        }
        handleChangeAxis(COLOR_BY_SELECTOR, "Nuclear Volume (fL)");
    }

    public render() {
        const {
            applyColorToSelections,
            colorBy,
            filtersToExclude,
            proteinNames,
            proteinTotals,
            proteinColors,
            selectedSetNames,
            selectedSetColors,
            selectedSetTotals,
            handleApplyColorSwitchChange,
        } = this.props;

        return (
                <Collapse
                    defaultActiveKey={[this.defaultActiveKey]}
                >
                    <Panel
                        key={this.panelKeys[0]}
                        header="Data grouped by tagged structures"
                    >
                        <Row
                            className={styles.colorByRow}
                            type="flex"
                            align="middle"
                        >
                            <Col span={12}>
                                <span>Color by:</span>
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
                                totals={proteinTotals}
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
                        key={this.panelKeys[1]}
                        header="Selected sets"
                    >
                        {selectedSetTotals.length === 0 ?
                            (<span>
                                No selected sets yet. Make a selection on the chart using the
                                <strong> Lasso Select</strong> or
                                <strong> Box Select</strong> tools on the plot, and it will get saved here.
                            </span>) :

                            (<Col span={12}>

                            <span>Show selections: </span>
                                <Switch
                                    className={styles.colorBySwitch}
                                    defaultChecked={true}
                                    onChange={handleApplyColorSwitchChange}
                                />

                                <BarChart
                                    names={
                                        selectedSetNames.map(
                                            (ele: number | string, index: number) => Number(ele) ? index : ele)
                                    }
                                    totals={selectedSetTotals}
                                    colors={applyColorToSelections ?
                                        values(selectedSetColors) : Array(selectedSetTotals.length).fill(DISABLE_COLOR)
                                    }
                                />
                                </Col>
                            )
                        }
                    </Panel>
                </Collapse>
        );
    }
}

function mapStateToProps(state: State) {
    return {
        applyColorToSelections: getApplyColorToSelections(state),
        colorBy: getColorBySelection(state),
        filtersToExclude: getFiltersToExclude(state),
        proteinColors: getProteinColors(state),
        proteinNames: getProteinNames(state),
        proteinTotals: getProteinTotals(state),
        selectedSetColors: getSelectionSetColors(state),
        selectedSetNames: getSelectedGroupKeys(state),
        selectedSetTotals: getSelectedSetTotals(state),
    };
}

const dispatchToPropsMap = {
    handleApplyColorSwitchChange: toggleApplySelectionSetColors,
    handleChangeAxis: changeAxis,
    handleFilterByProteinName: toggleFilterByProteinName,
};

export default connect(mapStateToProps, dispatchToPropsMap)(ColorByMenu);

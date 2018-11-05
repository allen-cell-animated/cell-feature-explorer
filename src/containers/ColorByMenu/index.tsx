import {
    Col,
    Collapse,
    Row,
    Switch,
} from "antd";
import "antd/lib/collapse/style";
import "antd/lib/switch/style";

import {
    Color,
    PlotMouseEvent,
} from "plotly.js";
import React from "react";
import { connect } from "react-redux";

import BarChart from "../../components/BarChart";
import { COLOR_BY_SELECTOR, PROTEIN_NAME_KEY } from "../../constants";
import {
    getProteinNames,
    getProteinTotals
} from "../../state/metadata/selectors";
import {
    changeAxis,
    toggleFilterByProteinName,
} from "../../state/selection/actions";
import {
    getColorBySelection,
    getFiltersToExclude,
    getProteinColors,
    getSelectedGroupKeys,
    getSelectedSetTotals,
    getSelectionSetColors,
} from "../../state/selection/selectors";
import {
    SelectAxisAction,
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
    colorBy: string;
    filtersToExclude: string[];
    handleChangeAxis: (axisName: string, proteinName: string) => SelectAxisAction;
    handleFilterByProteinName: (payload: string) => ToggleFilterAction;
    proteinColors: Color[];
    proteinNames: string[];
    proteinTotals: number[];
    selectedSetColors: Color[];
    selectedSetNames: NumberOrString[];
    selectedSetTotals: number[];
}

class ColorByMenu extends React.Component<ColorByMenuProps> {
    // submenu keys of first level
    public panelkeys = ["strucutreProteinName", "clusters"];
    public defaultActiveKey =  this.panelkeys[0];

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
            colorBy,
            filtersToExclude,
            proteinNames,
            proteinTotals,
            proteinColors,
            selectedSetNames,
            selectedSetColors,
            selectedSetTotals,
        } = this.props;

        return (
                <Collapse
                    defaultActiveKey={[this.defaultActiveKey]}
                >
                    <Panel
                        key={this.panelkeys[0]}
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
                                colors={proteinColors}
                                colorBy={colorBy}
                                onBarClicked={this.onBarClicked}
                                filtersToExclude={filtersToExclude}
                            />
                        </div>
                    </Panel>
                    <Panel
                        key={this.panelkeys[1]}
                        header="Selections"
                    >
                        <BarChart
                            names={
                                selectedSetNames.map((ele: number| string, index: number) => Number(ele) ? index : ele)
                            }
                            totals={selectedSetTotals}
                            colors={selectedSetColors}
                        />

                    </Panel>
                </Collapse>
        );
    }
}

function mapStateToProps(state: State) {
    return {
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
    handleChangeAxis: changeAxis,
    handleFilterByProteinName: toggleFilterByProteinName,
};

export default connect(mapStateToProps, dispatchToPropsMap)(ColorByMenu);

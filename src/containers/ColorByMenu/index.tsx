import {
    Collapse,
    Switch
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

interface ColorByMenuState {
    openKeys: string[];
}
class ColorByMenu extends React.Component<ColorByMenuProps, ColorByMenuState> {
    // submenu keys of first level

    public defaultActiveKey =  "structureProteinName";

    constructor(props: ColorByMenuProps) {
        super(props);
        this.onOpenChange = this.onOpenChange.bind(this);
        this.onBarClicked = this.onBarClicked.bind(this);
        this.onColorBySwitchChanged = this.onColorBySwitchChanged.bind(this);
    }

    public onOpenChange(openKeys: string[]) {
        this.setState({ openKeys });
    }

    public onBarClicked(clickEvent: PlotMouseEvent) {
        const { handleFilterByProteinName } = this.props;
        const { points } = clickEvent;
        const proteinName = points[0].y as string;
        handleFilterByProteinName(proteinName);
    }

    public onColorBySwitchChanged(colorByProtein: string) {
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
                    defaultActiveKey={this.defaultActiveKey}
                >
                    <Panel
                        key="structureProteinName"
                        header={<span>Tagged Structures</span>}
                    >
                        <div>
                            <span>Color by:</span>
                                <Switch
                                    defaultChecked={true}
                                    checkedChildren="protein"
                                    unCheckedChildren="cellular feature"
                                    onChange={this.onColorBySwitchChanged}
                                />
                        </div>
                        <div>
                            {colorBy === PROTEIN_NAME_KEY ? null : (
                                    <AxisDropDown
                                        axisId={COLOR_BY_SELECTOR}
                                    />
                            )}
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
                        key="clusters"
                        header="Cluster"
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

import {
    Menu,
} from "antd";
import "antd/lib/menu/style";
import {
    difference,
    includes,
} from "lodash";
import {
    Color,
    PlotMouseEvent,
} from "plotly.js";
import React from "react";
import { connect } from "react-redux";

import BarChart from "../../components/BarChart";
import { COLOR_BY_SELECTOR } from "../../constants";
import {
    getProteinNames,
    getProteinTotals
} from "../../state/metadata/selectors";
import {
    toggleFilterByProteinName
} from "../../state/selection/actions";
import {
    getFiltersToExclude,
    getProteinColors,
    getSelectedGroupKeys,
    getSelectedSetTotals,
    getSelectionSetColors,
} from "../../state/selection/selectors";
import { ToggleFilterAction } from "../../state/selection/types";

import {
    NumberOrString,
    State,
} from "../../state/types";
import AxisDropDown from "../AxisDropDown";

const { SubMenu } = Menu;

interface ColorByMenuProps {
    filtersToExclude: string[];
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
    public rootSubmenuKeys = ["structureProteinName", "cellularFeatures", "clusters"];

    public state: ColorByMenuState = {
        openKeys: ["structureProteinName"],
    };

    constructor(props: ColorByMenuProps) {
        super(props);
        this.onBarClicked = this.onBarClicked.bind(this);
    }

    public onOpenChange = (openKeys: string[]) => {
        const latestOpenKey = difference(openKeys, this.state.openKeys)[0];
        if (!includes(this.rootSubmenuKeys, latestOpenKey)) {
            this.setState({ openKeys });
        } else {
            this.setState({
                openKeys: latestOpenKey ? [latestOpenKey] : [],
            });
        }
    }

    public onBarClicked = (clickEvent: PlotMouseEvent) => {
        const { handleFilterByProteinName } = this.props;
        const { points } = clickEvent;
        const proteinName = points[0].y as string;
        handleFilterByProteinName(proteinName);
    }

    public render() {
        const {
            filtersToExclude,
            proteinNames,
            proteinTotals,
            proteinColors,
            selectedSetNames,
            selectedSetColors,
            selectedSetTotals,
        } = this.props;

        return (
                <Menu
                    mode="inline"
                    openKeys={this.state.openKeys}
                    onOpenChange={this.onOpenChange}
                >
                    <SubMenu
                        key="structureProteinName"
                        title={<span>Tagged Structures</span>}
                    >
                        <BarChart
                            names={proteinNames}
                            totals={proteinTotals}
                            colors={proteinColors}
                            onBarClicked={this.onBarClicked}
                            filtersToExclude={filtersToExclude}

                        />
                    </SubMenu>
                    <SubMenu
                        key="cellularFeatures"
                        title={<span>Cellular Features</span>}
                    >
                        <AxisDropDown axisId={COLOR_BY_SELECTOR}/>

                    </SubMenu>
                    <SubMenu
                        key="clusters"
                        title={<span>Cluster</span>}
                    >
                        <BarChart
                            names={
                                selectedSetNames.map((ele: number| string, index: number) => Number(ele) ? index : ele)
                            }
                            totals={selectedSetTotals}
                            colors={selectedSetColors}
                        />

                    </SubMenu>
                </Menu>
        );
    }
}

function mapStateToProps(state: State) {
    return {
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
    handleFilterByProteinName: toggleFilterByProteinName,
};

export default connect(mapStateToProps, dispatchToPropsMap)(ColorByMenu);

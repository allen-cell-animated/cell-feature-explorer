
import {
    Icon,
    Menu,
} from "antd";
import "antd/lib/menu/style";
import {
    difference,
    includes,
} from "lodash";
import { Color } from "plotly.js";
import React from "react";
import { connect } from "react-redux";

import BarChart from "../../components/BarChart";
import { COLOR_BY_SELECTOR } from "../../constants";
import {
    getProteinNames,
    getProteinTotals
} from "../../state/metadata/selectors";
import {
    getProteinColors,
    getSelectedGroupKeys,
    getSelectedSetTotals,
    getSelectionSetColors,
} from "../../state/selection/selectors";
import { NumberOrString, State } from "../../state/types";
import AxisDropDown from "../AxisDropDown";

const { SubMenu } = Menu;

interface ColorByMenuProps {
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

    public render() {
        const {
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
                style={{ width: 256 }}
            >
                <SubMenu
                    key="structureProteinName"
                    title={<span><Icon type="mail" /><span>Tagged Structures</span></span>}
                >
                    <BarChart
                        names={proteinNames}
                        totals={proteinTotals}
                        colors={proteinColors}
                    />
                </SubMenu>
                <SubMenu
                    key="cellularFeatures"
                    title={<span><Icon type="appstore" /><span>Cellular Features</span></span>}
                >
                    <AxisDropDown axisId={COLOR_BY_SELECTOR}/>

                </SubMenu>
                <SubMenu key="clusters" title={<span><Icon type="setting" /><span>Cluster</span></span>}>
                    <BarChart
                        names={selectedSetNames.map((ele: number| string, index: number) => Number(ele) ? index : ele)}
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
        proteinColors: getProteinColors(state),
        proteinNames: getProteinNames(state),
        proteinTotals: getProteinTotals(state),
        selectedSetColors: getSelectionSetColors(state),
        selectedSetNames: getSelectedGroupKeys(state),
        selectedSetTotals: getSelectedSetTotals(state),
    };
}

const dispatchToPropsMap = {
};

export default connect(mapStateToProps, null)(ColorByMenu);

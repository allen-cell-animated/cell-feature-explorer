import { Select } from "antd";
import "antd/lib/select/style";
import React from "react";
import { connect } from "react-redux";

import { X_AXIS_ID, Y_AXIS_ID } from "../../constants";
import { getFeatureData } from "../../state/metadata/selectors";
import { changeAxis } from "../../state/selection/actions";
import { getPlotByOnX, getPlotByOnY } from "../../state/selection/selectors";
import { State } from "../../state/types";

interface AxisDropDownProps {
    handleChange: () => void;
    axisId: string;
    yDropDownValue: string;
    xDropDownValue: string;
}

const Option = Select.Option;

class AxisDropDown extends React.Component<{}, {}> {
    constructor(props) {
        super(props);
        this.handleChange = this.handleChange.bind(this);
    }

    public handleChange(value) {
        const {
            axisId,
            handleChangeAxis,
        } = this.props;

        handleChangeAxis(axisId, value);
    }
    public render() {
        const {
            allData,
            axisId,
            xDropDownValue,
            yDropDownValue,
        } = this.props;

        const allOptions = Object.keys(allData[0])
            .filter( (ele) => ele !== "structureProteinName" && ele !== "Cell ID" && ele !== "datadir");
        const axisIDMap: {string: string} = {
            [X_AXIS_ID] : xDropDownValue,
            [Y_AXIS_ID] : yDropDownValue,
        };

        return (
            <div>
                <Select defaultValue={axisIDMap[axisId]} onChange={this.handleChange}>
                    {allOptions.map((option) => {
                        return (<Option value={option} key={option}>{option}</Option>
                        );
                    })}
                </Select>

            </div>
        );
    }
}

function mapStateToProps(state: State): AxisDropDownProps {
    return {
        allData: getFeatureData(state),
        xDropDownValue: getPlotByOnX(state),
        yDropDownValue: getPlotByOnY(state),
    };
}

const dispatchToPropsMap = {
    handleChangeAxis: changeAxis,
};

export default connect(mapStateToProps, dispatchToPropsMap)(AxisDropDown);

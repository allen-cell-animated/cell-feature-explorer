import { Select } from "antd";
import { SelectValue } from "antd/es/select";
import { includes } from "lodash";
import React from "react";
import {
    ActionCreator,
    connect,
} from "react-redux";

import {
    COLOR_BY_SELECTOR,
    PROTEIN_NAME_KEY,
    X_AXIS_ID,
    Y_AXIS_ID,
} from "../../constants";
import { getFeatureNames } from "../../state/metadata/selectors";
import { changeAxis } from "../../state/selection/actions";
import {
    getColorBySelection,
    getPlotByOnX,
    getPlotByOnY,
} from "../../state/selection/selectors";
import { SelectAxisAction } from "../../state/selection/types";
import { State } from "../../state/types";

const styles = require("./style.css");

interface AxisDropDownProps {
    axisId: string;
    colorByValue: string;
    handleChangeAxis: ActionCreator<SelectAxisAction>;
    featureNames: string[];
    yDropDownValue: string;
    xDropDownValue: string;
}

const Option = Select.Option;

class AxisDropDown extends React.Component<AxisDropDownProps, {}> {

    constructor(props: AxisDropDownProps) {
        super(props);
        this.handleChange = this.handleChange.bind(this);
    }

    public handleChange(value: SelectValue): void {
        const {
            axisId,
            handleChangeAxis,
        } = this.props;
        const axisSettingValue = value as string;
        handleChangeAxis(axisId, axisSettingValue);
    }

    public render() {
        const {
            axisId,
            colorByValue,
            xDropDownValue,
            yDropDownValue,
            featureNames,
        } = this.props;

        const axisIDMap: { [key: string]: string } = {
            [X_AXIS_ID]: xDropDownValue,
            [Y_AXIS_ID]: yDropDownValue,
            [COLOR_BY_SELECTOR]: colorByValue,
        };
        let displayOptions;
        if (axisId === COLOR_BY_SELECTOR && !includes(featureNames, PROTEIN_NAME_KEY)) {
            displayOptions = [PROTEIN_NAME_KEY, ...featureNames];
        } else {
            displayOptions = featureNames;
        }

        return (
            <div className={styles[axisId]}>
                <Select
                    defaultValue={axisIDMap[axisId]}
                    onChange={this.handleChange}
                >
                    {displayOptions.map((option) => {
                        return (
                            <Option
                                value={option}
                                key={option}
                            >
                                {option === PROTEIN_NAME_KEY ? "Protein" : option}
                            </Option>
                        );
                    })}
                </Select>
            </div>
        );
    }
}

function mapStateToProps(state: State) {
    return {
        colorByValue: getColorBySelection(state),
        featureNames: getFeatureNames(state),
        xDropDownValue: getPlotByOnX(state),
        yDropDownValue: getPlotByOnY(state),
    };
}

const dispatchToPropsMap = {
    handleChangeAxis: changeAxis,
};

export default connect(mapStateToProps, dispatchToPropsMap)(AxisDropDown);

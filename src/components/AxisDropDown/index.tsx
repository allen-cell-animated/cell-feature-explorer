import { Select } from "antd";
import { SelectValue } from "antd/es/select";
import React from "react";
import {
    ActionCreator,
} from "react-redux";

import {
    PROTEIN_NAME_KEY,
} from "../../constants";
import { SelectAxisAction } from "../../state/selection/types";

const styles = require("./style.css");

interface AxisDropDownProps {
    axisId: string;
    handleChangeAxis: ActionCreator<SelectAxisAction>;
    value: string;
    options: string[];
}

const Option = Select.Option;

export default class AxisDropDown extends React.Component<AxisDropDownProps, {}> {

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
            value,
            options,
        } = this.props;

        return (
            <div className={styles[axisId]}>
                <Select
                    onChange={this.handleChange}
                    value={value}
                >
                    {options.map((option) => {
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

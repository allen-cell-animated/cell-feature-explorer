import { Select, Tooltip } from "antd";
import { SelectValue } from "antd/es/select";
import React from "react";
import { ActionCreator } from "react-redux";

import { MeasuredFeatureDef } from "../../state/metadata/types";
import { SelectAxisAction } from "../../state/selection/types";

import styles from "./style.css";

interface AxisDropDownProps {
    axisId: string;
    handleChangeAxis: ActionCreator<SelectAxisAction>;
    value: string;
    options: MeasuredFeatureDef[];
    tooltip: string;
}

const Option = Select.Option;

export default class AxisDropDown extends React.Component<AxisDropDownProps> {
    constructor(props: AxisDropDownProps) {
        super(props);
        this.handleChange = this.handleChange.bind(this);
    }

    public handleChange(value: SelectValue): void {
        const { axisId, handleChangeAxis } = this.props;
        const axisSettingValue = value as string;
        handleChangeAxis(axisId, axisSettingValue);
    }

    public render() {
        const { axisId, value, options, tooltip } = this.props;
        return (
            <div className={styles[axisId]}>
                <Tooltip title={tooltip}>
                    <Select onChange={this.handleChange} value={value}>
                        {options.map((option) => {
                            return (
                                <Option value={option.key} key={option.key}>
                                    {option.displayName} {option.unit ? `(${option.unit})` : ""}
                                </Option>
                            );
                        })}
                    </Select>
                </Tooltip>
            </div>
        );
    }
}

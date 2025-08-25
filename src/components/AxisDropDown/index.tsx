import { Select, Tooltip } from "antd";
import { SelectProps, SelectValue } from "antd/es/select";
import React from "react";
import type { ActionCreator } from "redux";

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

        const selectOptions: SelectProps["options"] = options.map((option) => {
            return {
                label: `${option.displayName} ${option.unit ? `(${option.unit})` : ""}`,
                key: option.key,
                value: option.key,
                tooltip: option.tooltip,
            };
        });

        const selectedOptionLabel = selectOptions
            .find((option) => option.key === value)
            ?.label?.toString();

        return (
            <div className={styles[axisId]}>
                <Tooltip title={tooltip}>
                    <Select
                        onChange={this.handleChange}
                        value={selectedOptionLabel || value}
                        options={selectOptions}
                    ></Select>
                </Tooltip>
            </div>
        );
    }
}

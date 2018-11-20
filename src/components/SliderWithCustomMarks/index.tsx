import { reduce } from "lodash";
import React from "react";

import { Col, InputNumber, Row, Slider } from "antd";

import { SliderValue } from "antd/es/slider";
import "antd/lib/input-number/style";
import "antd/lib/slider/style";

interface SliderWithCustomMarksProps {
    disabled: boolean;
    onValueChange: (value: string) => void;
    label: string;
    valueOptions: string[];
}
export default class SliderWithCustomMarks extends React.Component<SliderWithCustomMarksProps, {}> {
    public state = {
        inputValue: 2,
    };

    constructor(props: SliderWithCustomMarksProps) {
        super(props);
        this.onChange = this.onChange.bind(this);
    }

    public onChange = (value: SliderValue) => {
        const { valueOptions } = this.props;
        this.setState({
            inputValue: value,
        });
        // SliderValue can be [number, number]
        this.props.onValueChange(valueOptions[value as number]);
    }

    public render() {
        const { inputValue } = this.state;
        const {
            disabled,
            label,
            valueOptions,
        } = this.props;
        const tip = (value: number): string => valueOptions[value].slice(0, 2);
        if (disabled) {
            return null;
        }
        const accInit: {[key: string]: number} = {};
        const marks: {[key: string]: number} = reduce(valueOptions, (acc, cur: string, index: number) => {
            acc[index] = Math.round(Number(cur));
            return acc;
        }, accInit);
        return (
            <Row>
                <Col span={6}>
                    <span>{label}</span>
                </Col>
                <Col span={14}>
                    <Slider
                        min={0}
                        max={valueOptions.length - 1}
                        onChange={this.onChange}
                        step={1}
                        tipFormatter={tip}
                        value={typeof inputValue === "number" ? inputValue : 0}
                        marks={marks}
                    />
                </Col>

            </Row>
        );
    }
}

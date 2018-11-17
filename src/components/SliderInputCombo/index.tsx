import React from "react";

import { Col, InputNumber, Row, Slider } from "antd";

import { SliderValue } from "antd/es/slider";
import "antd/lib/input-number/style";
import "antd/lib/slider/style";

interface SliderInputComboProps {
    onValueChange: (value: string) => void;
    valueOptions: string[];
}
export default class SliderInputCombo extends React.Component<SliderInputComboProps, {}> {
    public state = {
        inputValue: 2,
    };

    constructor(props: SliderInputComboProps) {
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
        const { valueOptions } = this.props;
        const tip = (value: number): string => valueOptions[value];
        return (
            <Row>
                <Col span={12}>
                    <Slider
                        min={0}
                        max={valueOptions.length - 1}
                        onChange={this.onChange}
                        step={1}
                        tipFormatter={tip}
                        value={typeof inputValue === "number" ? inputValue : 0}
                    />
                </Col>
                <Col span={4}>
                    <InputNumber
                        min={Number(valueOptions[0])}
                        max={Number(valueOptions[valueOptions.length - 1 ])}
                        style={{ marginLeft: 16 }}
                        value={Number(valueOptions[inputValue])}
                    />
                </Col>
            </Row>
        );
    }
}

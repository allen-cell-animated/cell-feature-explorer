import { Col, Row, Slider } from "antd";
import { reduce } from "lodash";
import React, { ReactNode } from "react";

interface SliderWithCustomMarksProps {
    disabled: boolean;
    initIndex: number;
    onValueChange: (value: string) => void;
    label: string;
    valueOptions: string[];
}

interface SliderState {
    inputValue: number;
}
export default class SliderWithCustomMarks extends React.Component<
    SliderWithCustomMarksProps,
    SliderState
> {
    constructor(props: SliderWithCustomMarksProps) {
        super(props);
        this.onChange = this.onChange.bind(this);
        this.state = {
            inputValue: props.initIndex || 0,
        };
    }

    public componentDidUpdate(prevProps: SliderWithCustomMarksProps) {
        const { initIndex } = this.props;
        if (prevProps.initIndex !== initIndex) {
            this.setState({ inputValue: initIndex });
        }
    }

    public onChange = (value: number) => {
        const { valueOptions } = this.props;
        this.setState({
            inputValue: value,
        });
        this.props.onValueChange(valueOptions[value]);
    };

    public render() {
        const { inputValue } = this.state;
        const { disabled, label, valueOptions } = this.props;
        const tip = (value?: number): ReactNode =>
            value !== undefined ? valueOptions[value].slice(0, 2) : null;
        if (disabled) {
            return null;
        }
        const accInit: { [key: string]: number } = {};
        const marks: { [key: string]: number } = reduce(
            valueOptions,
            (acc, cur: string, index: number) => {
                acc[index] = Math.round(Number(cur));
                return acc;
            },
            accInit
        );
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
                        tooltip={{ formatter: tip }}
                        value={typeof inputValue === "number" ? inputValue : 0}
                        marks={marks}
                    />
                </Col>
            </Row>
        );
    }
}

import { CheckboxChangeEvent } from "antd/lib/checkbox";
import { max } from "lodash";
import { Color } from "plotly.js";
import React from "react";

import { NumberOrString } from "../../state/types";
import InteractiveRow from "../InteractiveRow";

interface BarChartProps {
    colors: Color[];
    closeable: boolean;
    hideable: boolean;
    names: NumberOrString[];
    onBarClicked?: (clicked: CheckboxChangeEvent) => void;
    handleCloseSelectionSet?: (id: number | string) => void;
    totals: number[];
    ids: NumberOrString[];
}

const BarChart: React.SFC<BarChartProps> = (props) => {
    const {
        colors,
        closeable,
        handleCloseSelectionSet,
        hideable,
        names,
        totals,
        onBarClicked,
        ids,
    } = props;
    const maxTotal = max(props.totals) || 100;
    return (
        <React.Fragment>
            {totals.map((total, index) => {
                return (
                    <InteractiveRow
                        key={names[index]}
                        closeable={closeable}
                        hideable={hideable}
                        percent={total / maxTotal * 100}
                        color={colors[index] as string}
                        name={names[index]}
                        total={total}
                        id={ids[index].toString()}
                        onBarClicked={onBarClicked}
                        handleClose={handleCloseSelectionSet}
                    />
                );
            })
            }

        </React.Fragment>
    );
};

export default BarChart;

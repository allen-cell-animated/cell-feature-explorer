import * as React from "react";
import { connect } from "react-redux";

import InteractivePlot from "../../components/Plot";
import AxisDropDown from "../DropDown";

import { requestFeatureData } from "../../state/metadata/actions";
import { getFeatureData } from "../../state/metadata/selectors";
import { X_AXIS_ID, Y_AXIS_ID } from "../../constants";
import { getPlotByOnX, getPlotByOnY } from "../../state/selection/selectors";
import { State } from "../../state/types";
import { RequestAction } from "../../state/metadata/types";

const styles = require("./style.css");
// const data = [
//     {
//         x: [1, 2, 3],
//         y: [2, 6, 3],
//         type: "scatter",
//         mode: "lines+points",
//         marker: {color: "red"},
//     },
//     {type: "bar", x: [1, 2, 3], y: [2, 5, 3]},
// ];

interface MainPlotProps {
    data: any;
    requestFeatureData: () => RequestAction;
    plotByOnX: string;
    plotByOnY: string;
}

class MainPlot extends React.Component<MainPlotProps, {}> {
     public unpack(rows: any, key: string) {
            return rows.map( (row: any) => {
                return row[key];
            });
        }

    public componentWillMount() {
        this.props.requestFeatureData();
    }

    public render() {
         const {
             plotByOnX,
             plotByOnY,
             data,
         } = this.props;
         if (data.length === 0) {return null; }

         const plotData = {
            groups: this.unpack(data, "structureProteinName"),
            x: this.unpack(data, plotByOnX),
            y: this.unpack(data, plotByOnY),

         };
         return (
            <div className={styles.container}>My Plot
                <AxisDropDown axisId={X_AXIS_ID}/>
                <AxisDropDown axisId={Y_AXIS_ID}/>

                <InteractivePlot plotData={plotData} />
            </div>
        );
    }
}

function mapStateToProps(state: State): MainPlotProps {
    return {
        data: getFeatureData(state),
        plotByOnX: getPlotByOnX(state),
        plotByOnY: getPlotByOnY(state),
    } as MainPlotProps;
}

const dispatchToPropsMap = {
    requestFeatureData,
};

export default connect(mapStateToProps, dispatchToPropsMap)(MainPlot);

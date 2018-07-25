import * as React from "react";
import { connect } from "react-redux";

import InteractivePlot from "../../components/Plot";
import { requestFeatureData } from "../../state/metadata/actions";
import { getFeatureData } from "../../state/metadata/selectors";
import { getPlotByOnX, getPlotByOnY } from "../../state/selection/selectors";
import { State } from "../../state/types";

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
    requestFeatureData: () => void;
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
    };
}

const dispatchToPropsMap = {
    requestFeatureData,
};

export default connect(mapStateToProps, dispatchToPropsMap)(MainPlot);

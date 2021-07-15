import { CheckboxChangeEvent } from "antd/lib/checkbox";
import { map } from "lodash";
import React from "react";

import { PanelData } from "../../containers/ColorByMenu/types";
import { DownloadConfig } from "../../state/selection/types";
import InteractiveRow from "../InteractiveRow";

interface BarChartProps {
    closeable: boolean;
    hideable: boolean;
    panelData: PanelData[];
    handleDownload: (key: string) => void;
    downloadUrls: string[];
    downloadConfig: DownloadConfig;
    onBarClicked?: (clicked: CheckboxChangeEvent) => void;
    handleCloseSelectionSet?: (id: number | string) => void;
}

const BarChart: React.FunctionComponent<BarChartProps> = (props) => {
    const {
        closeable,
        downloadUrls,
        handleCloseSelectionSet,
        handleDownload,
        downloadConfig,
        hideable,
        onBarClicked,
        panelData,
    } = props;
    return (
        <React.Fragment>
            {map(panelData, (item) => {
                return (
                    <InteractiveRow
                        key={item.id}
                        item={item}
                        closeable={closeable}
                        hideable={hideable}
                        onBarClicked={onBarClicked}
                        handleClose={handleCloseSelectionSet}
                        handleDownload={handleDownload}
                        downloadUrls={downloadUrls}
                        downloadConfig={downloadConfig}
                    />
                );
            })
            }

        </React.Fragment>
    );
};

export default BarChart;

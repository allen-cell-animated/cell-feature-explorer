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

const BarChart: React.SFC<BarChartProps> = (props) => {
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
                        key={item.name}
                        closeable={closeable}
                        checked={item.checked}
                        hideable={hideable}
                        color={item.color as string}
                        name={item.name}
                        total={item.total}
                        id={item.id}
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

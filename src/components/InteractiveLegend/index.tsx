import { CheckboxChangeEvent } from "antd/lib/checkbox";
import { map } from "lodash";
import React from "react";

import { PanelData } from "../../containers/ColorByMenu/types";
import { DownloadConfig } from "../../state/selection/types";
import InteractiveRow from "../InteractiveRow";

interface InteractiveLegendProps {
    showTooltips: boolean;
    closeable: boolean;
    hideable: boolean;
    panelData: PanelData[];
    handleDownload: (key: string) => void;
    downloadUrls: string[];
    downloadConfig: DownloadConfig;
    onBarClicked?: (clicked: CheckboxChangeEvent) => void;
    handleCloseSelectionSet?: (id: number | string) => void;
}

const InteractiveLegend: React.FunctionComponent<InteractiveLegendProps> = (props) => {
    const {
        showTooltips,
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
                        showTooltips={showTooltips}
                        closeable={closeable}
                        checked={item.checked}
                        hideable={hideable}
                        disabled={item.disabled || false}
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

export default InteractiveLegend;

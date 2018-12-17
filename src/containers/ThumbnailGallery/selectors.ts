import { reduce } from "lodash";
import { createSelector } from "reselect";

import {
    DOWNLOAD_URL_PREFIX,
    PROTEIN_NAME_KEY,
} from "../../constants";
import { getFileInfo } from "../../state/metadata/selectors";
import { FileInfo } from "../../state/metadata/types";
import { getClickedScatterPoints } from "../../state/selection/selectors";
import { Thumbnail } from "../../state/types";
import {
    convertFileInfoToAICSId,
    convertFileInfoToImgSrc,
    getFileInfoDatumFromCellId,
} from "../../state/util";

export const getThumbnails = createSelector([
        getFileInfo,
        getClickedScatterPoints,
    ],
    (fileInfo: FileInfo[], clickedScatterPointIDs: string[]): Thumbnail[] => {
        const init: Thumbnail[] = [];
        return reduce(clickedScatterPointIDs, (acc, cellID) => {
            const cellData: FileInfo | undefined = getFileInfoDatumFromCellId(fileInfo, cellID);
            if (cellData) {
                const src = convertFileInfoToImgSrc(cellData);
                const downloadHref = `${DOWNLOAD_URL_PREFIX}&id=${convertFileInfoToAICSId(cellData)}`;
                acc.push({
                    cellID: Number(cellID),
                    downloadHref,
                    labeledStructure: cellData[PROTEIN_NAME_KEY],
                    src,
                });
            }
            return acc;
        }, init);
    }
);

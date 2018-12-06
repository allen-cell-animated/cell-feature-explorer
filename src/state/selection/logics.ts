import { createLogic } from "redux-logic";

import { ReduxLogicDeps, State } from "../types";

import { DOWNLOAD_URL_PREFIX } from "../../constants";
import { getFileInfo } from "../metadata/selectors";
import { convertFileInfoToAICSId } from "../util";

import { DOWNLOAD_IMAGE_DATA } from "./constants";

function createAnchorForHref(href: string): HTMLAnchorElement {
    const anchor = document.createElement("a");
    anchor.href = href;
    anchor.download = "true";
    return anchor;
}

const downloadImageData = createLogic({
    process(deps: ReduxLogicDeps) {
        const {
            action,
            getState,
        } = deps;

        const state: State = getState();

        const fileInfoArray = getFileInfo(state);
        const fileInfoData = fileInfoArray[action.payload];

        const url = `${DOWNLOAD_URL_PREFIX}&id=${convertFileInfoToAICSId(fileInfoData)}`;
        const anchor = createAnchorForHref(url);
        anchor.click();
    },
    type: DOWNLOAD_IMAGE_DATA,
});

export default [
    downloadImageData,
];

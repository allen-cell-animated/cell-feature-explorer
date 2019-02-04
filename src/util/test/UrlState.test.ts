import { expect } from "chai";

import {
    COLOR_BY_SELECTOR,
    X_AXIS_ID,
    Y_AXIS_ID,
} from "../../constants";
import {
    changeAxis,
    selectCellFor3DViewer,
    selectPoint,
    toggleShowClusters,
} from "../../state/selection/actions";

import UrlState, { URLSearchParam } from "../UrlState";

describe("UrlState utility class", () => {
    let urlState: UrlState;

    beforeEach(() => {
       urlState = new UrlState();
    });

    describe("toReduxActions", () => {
        it("maps a key value pair to a redux action", () => {
            expect(urlState.toReduxActions({
                [URLSearchParam.cellSelectedFor3D]: 2
            }))
                .to.be.an("array")
                .of.length(1)
                .and.to.have.deep.members([selectCellFor3DViewer(2)]);
        });

        it("maps multiple key value pairs to multiple redux actions", () => {
            expect(urlState.toReduxActions({
                [URLSearchParam.cellSelectedFor3D]: 2,
                [URLSearchParam.plotByOnX]: "feature_x",
                [URLSearchParam.plotByOnY]: "feature_y",
                [URLSearchParam.colorBy]: "feature_z",
                [URLSearchParam.showClusters]: true,
                [URLSearchParam.selectedPoint]: [1, 2, 3, 4, 5],
            }))
                .to.be.an("array")
                .of.length(10)
                .and.to.have.deep.members([
                    selectCellFor3DViewer(2),
                    changeAxis(X_AXIS_ID, "feature_x"),
                    changeAxis(Y_AXIS_ID, "feature_y"),
                    changeAxis(COLOR_BY_SELECTOR, "feature_z"),
                    toggleShowClusters(true),
                    selectPoint(1),
                    selectPoint(2),
                    selectPoint(3),
                    selectPoint(4),
                    selectPoint(5),
                ]);
        });

        it("maps an empty obj of URL params to an empty arr of redux actions", () => {
            expect(urlState.toReduxActions({})).to.eql([]);
        });
    });

    describe("toUrlSearchParameterMap", () => {

    });
});

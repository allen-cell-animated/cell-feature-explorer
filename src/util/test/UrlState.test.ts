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
} from "../../state/selection/actions";
import {
    INITIAL_COLOR_BY,
    INITIAL_PLOT_BY_ON_X,
    INITIAL_PLOT_BY_ON_Y
} from "../../state/selection/constants";
import UrlState, { URLSearchParam } from "../UrlState";

describe("UrlState utility class", () => {
    describe("toAppState", () => {
        it("maps URL search params directly to the shape of the selection state branch", () => {
            expect(UrlState.toAppState({
                [URLSearchParam.cellSelectedFor3D]: "2",
                [URLSearchParam.plotByOnX]: "feature_x",
                [URLSearchParam.plotByOnY]: "feature_y",
                [URLSearchParam.colorBy]: "feature_z",
                [URLSearchParam.selectedPoint]: ["1", "2", "3", "4", "5"],
            })).to.deep.equal({
               cellSelectedFor3D: 2,
               [COLOR_BY_SELECTOR]: "feature_z",
               selectedPoints: [1, 2, 3, 4, 5],
               [X_AXIS_ID]: "feature_x",
               [Y_AXIS_ID]: "feature_y",
            });
        });

        it("adds cellSelectedFor3D to list of selected points if not already there", () => {
            expect(UrlState.toAppState({
                [URLSearchParam.cellSelectedFor3D]: "2",
                [URLSearchParam.selectedPoint]: ["1"],
            })).to.deep.equal({
                cellSelectedFor3D: 2,
                selectedPoints: [2, 1],
            });
        });

        it("does not duplicate cellSelectedFor3D in list of selected points if it is already there", () => {
            expect(UrlState.toAppState({
                [URLSearchParam.cellSelectedFor3D]: "2",
                [URLSearchParam.selectedPoint]: ["2"],
            })).to.deep.equal({
                cellSelectedFor3D: 2,
                selectedPoints: [2],
            });
        });
    });

    describe("toReduxActions", () => {
        it("maps a key value pair to a redux action", () => {
            expect(UrlState.toReduxActions({
                [URLSearchParam.plotByOnX]: "feature_x",
            }))
                .to.be.an("array")
                .of.length(1)
                .and.to.have.deep.members([changeAxis(X_AXIS_ID, "feature_x")]);
        });

        it("adds cellSelectedFor3D to list of selected points if not already there", () => {
            expect(UrlState.toReduxActions({
                [URLSearchParam.cellSelectedFor3D]: "2",
            }))
                .to.be.an("array")
                .of.length(2)
                .and.to.have.deep.members([selectPoint(2), selectCellFor3DViewer(2)]);
        });

        it("does not duplicate cellSelectedFor3D in list of selected points if it is already there", () => {
            expect(UrlState.toReduxActions({
                [URLSearchParam.cellSelectedFor3D]: "2",
                [URLSearchParam.selectedPoint]: ["2"],
            }))
                .to.be.an("array")
                .of.length(2)
                .and.to.have.deep.members([selectPoint(2), selectCellFor3DViewer(2)]);
        });

        it("maps multiple key value pairs to multiple redux actions", () => {
            expect(UrlState.toReduxActions({
                [URLSearchParam.cellSelectedFor3D]: "2",
                [URLSearchParam.plotByOnX]: "feature_x",
                [URLSearchParam.plotByOnY]: "feature_y",
                [URLSearchParam.colorBy]: "feature_z",
                [URLSearchParam.selectedPoint]: ["1", "2", "3", "4", "5"],
            }))
                .to.be.an("array")
                .of.length(9)
                .and.to.have.deep.members([
                    selectCellFor3DViewer(2),
                    changeAxis(X_AXIS_ID, "feature_x"),
                    changeAxis(Y_AXIS_ID, "feature_y"),
                    changeAxis(COLOR_BY_SELECTOR, "feature_z"),
                    selectPoint(1),
                    selectPoint(2),
                    selectPoint(3),
                    selectPoint(4),
                    selectPoint(5),
                ]);
        });

        it("maps an empty obj of URL params to an empty arr of redux actions", () => {
            expect(UrlState.toReduxActions({})).to.eql([]);
        });

        it("ignores search params that are not explicitly configured", () => {
            expect(UrlState.toReduxActions({
                [URLSearchParam.colorBy]: "feature_z",
                superFakeMadeUpUrlParam: "superFakeMadeUpValue",
            }))
                .to.be.an("array")
                .of.length(1)
                .and.to.have.deep.members([changeAxis(COLOR_BY_SELECTOR, "feature_z")]);
        });
    });

    describe("toUrlSearchParameterMap", () => {
        it("re-maps app state to a key:value object", () => {
            const selections = {
                cellSelectedFor3D: 10,
                colorBy: INITIAL_COLOR_BY,
                plotByOnX: INITIAL_PLOT_BY_ON_X,
                plotByOnY: INITIAL_PLOT_BY_ON_Y,
                selectedPoints: [1, 3, 5],
            };

            expect(UrlState.toUrlSearchParameterMap(selections)).to.deep.equal({
                [URLSearchParam.cellSelectedFor3D]: "10",
                [URLSearchParam.colorBy]: INITIAL_COLOR_BY,
                [URLSearchParam.plotByOnX]: INITIAL_PLOT_BY_ON_X,
                [URLSearchParam.plotByOnY]: INITIAL_PLOT_BY_ON_Y,
                [URLSearchParam.selectedPoint]: ["1", "3", "5"],
            });
        });

        it("omits values that are not meaningful to include in the URL", () => {
            const selections = {
                cellSelectedFor3D: null,
                colorBy: INITIAL_COLOR_BY,
                plotByOnX: INITIAL_PLOT_BY_ON_X,
                plotByOnY: INITIAL_PLOT_BY_ON_Y,
                selectedPoints: [],
            };

            expect(UrlState.toUrlSearchParameterMap(selections)).to.deep.equal({
                [URLSearchParam.colorBy]: INITIAL_COLOR_BY,
                [URLSearchParam.plotByOnX]: INITIAL_PLOT_BY_ON_X,
                [URLSearchParam.plotByOnY]: INITIAL_PLOT_BY_ON_Y,
            });
        });

        it("omits values that are not explicitly configured", () => {
            const selections = {
                colorBy: INITIAL_COLOR_BY,
                fakeSelectionKey: "superFake",
            };

            expect(UrlState.toUrlSearchParameterMap(selections)).to.deep.equal({
                [URLSearchParam.colorBy]: INITIAL_COLOR_BY,
            });
        });
    });
});

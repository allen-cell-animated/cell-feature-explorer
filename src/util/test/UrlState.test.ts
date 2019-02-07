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
import {
    INITIAL_COLOR_BY,
    INITIAL_PLOT_BY_ON_X,
    INITIAL_PLOT_BY_ON_Y
} from "../../state/selection/constants";

import UrlState, { URLSearchParam } from "../UrlState";

describe("UrlState utility class", () => {
    describe("urlParamsHaveChanged", () => {
        it("returns true before it is expected to have anything to compare against", () => {
            const nextParams = {
                [URLSearchParam.cellSelectedFor3D]: 2,
                [URLSearchParam.plotByOnX]: "feature_x",
                [URLSearchParam.plotByOnY]: "feature_y",
                [URLSearchParam.colorBy]: "feature_z",
                [URLSearchParam.selectedPoint]: [1, 2, 3, 4, 5],
            };

            expect(new UrlState().urlParamsHaveChanged({}, nextParams)).to.equal(true);
        });

        it("returns true when compared against initialized url params", () => {
            const prevParams = {
                [URLSearchParam.colorBy]: "feature_z",
            };

            const nextParams = {
                [URLSearchParam.colorBy]: "feature_A",
            };

            expect(new UrlState().urlParamsHaveChanged(prevParams, nextParams)).to.equal(true);
        });

        it("returns true when compared against prev params stored from a toReduxActions call", () => {
            const prevParams = {
                [URLSearchParam.colorBy]: "feature_z",
            };

            const nextParams = {
                [URLSearchParam.colorBy]: "feature_A",
            };

            const urlState = new UrlState();
            urlState.toReduxActions(prevParams);

            expect(urlState.urlParamsHaveChanged(prevParams, nextParams)).to.equal(true);
        });

        it("returns false when params have not deeply changed", () => {
            const prevParams = {
                [URLSearchParam.cellSelectedFor3D]: 2,
                [URLSearchParam.plotByOnX]: "feature_x",
                [URLSearchParam.plotByOnY]: "feature_y",
                [URLSearchParam.colorBy]: "feature_z",
                [URLSearchParam.selectedPoint]: [1, 2, 3, 4, 5],
            };

            const nextParams = {
                [URLSearchParam.cellSelectedFor3D]: 2,
                [URLSearchParam.plotByOnX]: "feature_x",
                [URLSearchParam.plotByOnY]: "feature_y",
                [URLSearchParam.colorBy]: "feature_z",
                [URLSearchParam.selectedPoint]: [1, 2, 3, 4, 5],
            };

            expect(new UrlState().urlParamsHaveChanged(prevParams, nextParams)).to.equal(false);
        });
    });

    describe("toReduxActions", () => {
        it("maps a key value pair to a redux action", () => {
            expect(new UrlState().toReduxActions({
                [URLSearchParam.cellSelectedFor3D]: 2,
            }))
                .to.be.an("array")
                .of.length(1)
                .and.to.have.deep.members([selectCellFor3DViewer(2)]);
        });

        it("maps multiple key value pairs to multiple redux actions", () => {
            expect(new UrlState().toReduxActions({
                [URLSearchParam.cellSelectedFor3D]: 2,
                [URLSearchParam.plotByOnX]: "feature_x",
                [URLSearchParam.plotByOnY]: "feature_y",
                [URLSearchParam.colorBy]: "feature_z",
                [URLSearchParam.selectedPoint]: [1, 2, 3, 4, 5],
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
            expect(new UrlState().toReduxActions({})).to.eql([]);
        });

        it("ignores search params that are not explicitly configured", () => {
            expect(new UrlState().toReduxActions({
                [URLSearchParam.cellSelectedFor3D]: 2,
                superFakeMadeUpUrlParam: "superFakeMadeUpValue",
            }))
                .to.be.an("array")
                .of.length(1)
                .and.to.have.deep.members([selectCellFor3DViewer(2)]);
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

            expect(new UrlState().toUrlSearchParameterMap(selections)).to.deep.equal({
                [URLSearchParam.cellSelectedFor3D]: 10,
                [URLSearchParam.colorBy]: INITIAL_COLOR_BY,
                [URLSearchParam.plotByOnX]: INITIAL_PLOT_BY_ON_X,
                [URLSearchParam.plotByOnY]: INITIAL_PLOT_BY_ON_Y,
                [URLSearchParam.selectedPoint]: [1, 3, 5],
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

            expect(new UrlState().toUrlSearchParameterMap(selections)).to.deep.equal({
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

            expect(new UrlState().toUrlSearchParameterMap(selections)).to.deep.equal({
                [URLSearchParam.colorBy]: INITIAL_COLOR_BY,
            });
        });
    });
});

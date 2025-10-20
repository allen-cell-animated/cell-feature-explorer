/* tslint:disable:max-classes-per-file */

import { describe, it, expect } from "vitest";

import { isDevOrStagingSite } from "../";

describe("General utilities", () => {
    describe("isNotProductionSite", () => {
        it("returns true if location is localhost or has staging in the name", () => {
            const notProductionSites = [
                "stg.allencell.org",
                "localhost",
                "localhost:9002",
                "staging.cfe.allencell.org",
                "",
                "cfe.staging.org",
            ];
            const result = notProductionSites.map(isDevOrStagingSite);
            expect(result).to.deep.equal(Array(notProductionSites.length).fill(true));
        });
        it("returns false if location is the main site", () => {
            const productionSite = ["cfe.allencell.org", "allencell.org", "cfe.org"];
            const result = productionSite.map(isDevOrStagingSite);
            expect(result).to.deep.equal(Array(productionSite.length).fill(false));
        });
    });
});

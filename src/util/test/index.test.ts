/* tslint:disable:max-classes-per-file */

import { expect } from "chai";

import { bindAll, isDevOrStagingSite } from "../";

describe("General utilities", () => {
    describe("bindAll", () => {
       it("binds class methods to a class", () => {
           class Foo {
               private message = "Hello from Foo";

               constructor() {
                   bindAll(this, [this.bar]);
               }

               public bar() {
                   return this.message;
               }
           }

           const foo = new Foo();
           const bar = foo.bar;
           expect(foo.bar()).to.equal(bar());
       });

       it("does not bind a method that it was not asked to bind", () => {
           class Foo {
               private message = "Hello from Foo";

               constructor() {
                   bindAll(this, [this.bar]);
               }

               public bar() {
                   return this.message;
               }

               public baz() {
                   return this.message;
               }
           }

           const foo = new Foo();
           const baz = foo.baz;

           expect(foo.baz()).to.equal("Hello from Foo");
           expect(baz).to.throw(TypeError);
       });
    });
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
            const result = notProductionSites.map(isDevOrStagingSite)
            expect(result).to.deep.equal(Array(notProductionSites.length).fill(true))
        })
        it("returns false if location is the main site", () => {
            const productionSite = [
                "cfe.allencell.org",
                "allencell.org",
                "cfe.org",
            ];
            const result = productionSite.map(isDevOrStagingSite);
            expect(result).to.deep.equal(Array(productionSite.length).fill(false));
        });
    });
});

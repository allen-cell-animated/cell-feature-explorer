import {
    forOwn,
    isFunction,
} from "lodash";

export { default as UrlState } from "./UrlState";

export function bindAll<T extends object>(obj: T, methods: Array<() => any>) {
    const setOfMethods = new Set(methods);
    forOwn(obj.constructor.prototype, (value, key) => {
        if (setOfMethods.has(value) && isFunction(value)) {
            Object.assign(obj, { [key]: value.bind(obj) });
        }
    });
}

export function getCellLineFromLegacyCellID(cellID: string): string {
    return cellID.split("_")[0];
}

export function isDevOrStagingSite(host: string): boolean {
    // first condition is for testing with no client
    return !host || host.includes("localhost") || host.includes("staging") || host.includes("stg");
}

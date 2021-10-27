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

export function syncNullValues(array1: (number | null)[], array2: (number | null)[]): void {
    /* At every index where one array has a null value, the other array must also have a null value */

    if (array1.length !== array2.length) {
        console.error("Cannot syncNullValues between two arrays because they have unequal length")
        return;
    }
    for (let i = 0; i < array1.length; i++) {
        if (array1[i] === null) {
            array2[i] = null;
        } else if (array2[i] === null) {
            array1[i] = null;
        }
    }
}
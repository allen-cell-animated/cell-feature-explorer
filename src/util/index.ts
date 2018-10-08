import {
    forOwn,
    isFunction,
} from "lodash";

export function bindAll<T>(obj: T, methods: Array<() => any>) {
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

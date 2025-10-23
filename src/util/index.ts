export { default as UrlState } from "./UrlState";

export function getCellLineFromLegacyCellID(cellID: string): string {
    return cellID.split("_")[0];
}

export function isDevOrStagingSite(host: string): boolean {
    // first condition is for testing with no client
    return !host || host.includes("localhost") || host.includes("staging") || host.includes("stg");
}

export async function fetchCsvText(url: string): Promise<string> {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(
            `Failed to fetch CSV dataset from url '${url}': ${response.status} ${response.statusText}`
        );
    }
    return response.text();
}

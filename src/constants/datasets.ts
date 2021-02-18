import dataset2Image from "../images/card-cover-dataset-2-0.png";
import dataset14Image from "../images/card-cover-dataset-1-4.png";
export interface DatasetMetaData {
    name: string;
    version: string;
    id: string;
    description: string;
    image: string;
    link?: string;
    userData: {
        isNew: boolean;
        inReview: boolean;
        totalTaggedStructures: number;
        totalCells: number;
        totalFOVs: number;
    }
}
// TODO: make this data driven
export type DatasetId = "aics_hipsc_v2020.1" | "aics_hipsc_v2019.1";
export default {
    "aics_hipsc_v2020.1": dataset2Image,
    "aics_hipsc_v2019.1": dataset14Image
}
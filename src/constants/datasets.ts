import dataset2Image from "../images/card-cover-dataset-2-0.png";
import dataset14Image from "../images/card-cover-dataset-1-4.png";
export interface DatasetMetaData {
    name: string;
    version: string;
    id: string;
    isNew: boolean;
    inReview: boolean;
    description: string;
    totalCells: number;
    totalFOVs: number;
    totalTaggedStructures: number;
    image: string;
    link?: string;
}
export default [
    {
        name: "hiPSC Single-Cell Image Dataset",
        version: "v2020.1",
        id: "aics_hipsc_v2020.1",
        isNew: true,
        inReview: true,
        description:
            "Through improved cell and nuclear segmentation methods, this dataset contains 5x the number of single-cell images and includes 5 new fluorescently tagged structures. To learn more about the robust intracellular organization found in this dataset, please see our recent article in <a href='https://www.biorxiv.org/content/10.1101/2020.12.08.415562v1'>bioRxiv.</a>",
        totalCells: 216062,
        totalFOVs: 18186,
        totalTaggedStructures: 25,
        image: dataset2Image,
        link: "https://rev1.cfe.allencell.org/",
    },
    {
        name: "hiPSC Single-Cell Image Dataset",
        version: "v2019.1",
        id: "aics_hipsc_v2019.1",
        isNew: false,
        inReview: false,
        description:
            "This dataset contains individual cells segmented from 3D Field of View (FOV) images taken of 20 fluorescently tagged structures in human induced pluripotent stem cells (hiPSCs). This dataset was collected from 2017 to 2019 and uses relatively simple 3D segmentation methods.",
        totalCells: 39200,
        totalFOVs: 11023,
        totalTaggedStructures: 20,
        image: dataset14Image,
        // link: "v2019-1",
    },
];

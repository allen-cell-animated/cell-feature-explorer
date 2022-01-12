export interface DatasetMetaData {
    name: string;
    title: string;
    version: string;
    id: string;
    description: string;
    image: string;
    link?: string;
    manifest?: string;
    production?: boolean;
    userData: {
        isNew: boolean;
        inReview: boolean;
        totalTaggedStructures: number;
        totalCells: number;
        totalFOVs: number;
    };
}

interface Publication {
    citation: string;
    title: string;
    url: string;
}

export interface Megaset {
    name: string;
    title: string;
    production: boolean;
    datasets: {
        [key: string]: DatasetMetaData
    };
    publications?: Publication[];
}

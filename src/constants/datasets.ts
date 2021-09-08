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

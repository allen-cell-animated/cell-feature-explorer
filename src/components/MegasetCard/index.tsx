import * as React from "react";
import { Col } from "antd";
import { map } from "lodash";

import { Megaset } from "../../state/image-dataset/types";
import DatasetCard from "../../components/DatasetCard";

import styles from "./style.css";

interface MegasetCardProps {
    key: string;
    megaset: Megaset;
    handleSelectDataset: (id: string) => void;
}

const MegasetCard: React.FunctionComponent<MegasetCardProps> = ({
    megaset,
    handleSelectDataset,
}: MegasetCardProps) => {
    const numDatasets = Object.keys(megaset.datasets).length;
    const isMultipleDatasets = numDatasets > 1;
    // Set a max-width for the megacard so that publications shrink into the megacard
    // width instead of the megacard expanding to fit publications
    // TODO: decide on a max number of datasets per row to cap this maxWidth
    const maxWidth = `${numDatasets * 430 + (numDatasets - 1) * 10 + 20}px`;

    return (
        // <Col key={megaset.name}>
        <div key={megaset.name} className={styles.megacard} style={{ maxWidth: maxWidth }}>
            {isMultipleDatasets && 
                <div className={styles.megasetTitle}>{megaset.title}</div>
            }
            <div className={styles.datasetCards}>
                {map(megaset.datasets, (dataset) => (
                    <DatasetCard key={dataset.id} {...dataset} handleSelectDataset={handleSelectDataset} />
                ))}
            </div>
            {megaset.publications && megaset.publications.length > 0 && 
                <div className={styles.publications}>
                    Publications
                    {megaset.publications.map(publication => (
                        <div key={`${megaset.name}-${publication.title}`} className={styles.publication}>
                            <div className={styles.publicationTitle}>
                                <a href={publication.url} target="blank">
                                    {publication.title}
                                </a>
                            </div>
                            <div className={styles.journalDate}>
                                {publication.citation}.
                            </div>
                        </div>
                    ))}
                </div>
            }
        </div>
        // </Col>
    )
};

export default MegasetCard;

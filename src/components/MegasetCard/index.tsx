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
    const isMultipleDatasets = Object.keys(megaset.datasets).length > 1;
    return (
        // <Col key={megaset.name}>
        <div key={megaset.name} className={styles.megacard}>
            {isMultipleDatasets && 
                <div className={styles.megasetTitle}>{megaset.title}</div>
            }
            <div className={styles.datasetCards}>
                {map(megaset.datasets, (dataset) => (
                    <DatasetCard key={dataset.id} {...dataset} handleSelectDataset={handleSelectDataset} />
                ))}
            </div>
            {megaset.publications && megaset.publications.length > 0 && 
                <div>
                    Publications
                    {megaset.publications.map(publication => (
                        <div key={`${megaset.name}-${publication.title}`} className={styles.publication}>
                            <div className={styles.publicationTitle}>{publication.title}</div>
                            <div className={styles.journalDate}>{publication.citation}</div>
                        </div>
                    ))}
                </div>
            }
        </div>
        // </Col>
    )
};

export default MegasetCard;

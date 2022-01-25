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
    console.log(megaset)
    return (
        // <Col key={megaset.name}>
        <div key={megaset.name} className={styles.megacard}>
            {Object.keys(megaset.datasets).length > 1 && megaset.name}
            {map(megaset.datasets, (dataset) => (
                <DatasetCard key={dataset.id} {...dataset} handleSelectDataset={handleSelectDataset} />
            ))}
            {megaset.publications && megaset.publications.length > 0 && 
                <div>
                    Publications
                </div>
            }
        </div>
        // </Col>
    )
};

export default MegasetCard;

import * as React from "react";
import { Card, Descriptions } from "antd";
import { DatasetMetaData } from "../../containers/App/datasets";
const { Meta } = Card;

const styles = require("./style.css");

const DatasetCard: React.FunctionComponent<DatasetMetaData> = ({
    name,
    version,
    image,
    description,
    totalCells,
    totalFOVs,
    totalTaggedStructures,
}: DatasetMetaData) => {
    return (
        <Card
            style={{ width: 400 }}
            className={styles.card}
            cover={
                <img
                    className={styles.staticThumbnail}
                    alt={`Snapshot of simulation for ${name}`}
                    src={image}
                />
            }
        >
            <Meta title={`${name} ${version}`} description={description} />
            <Descriptions title=""  column={1}>
                <Descriptions.Item label="Number of Cells">{totalCells}</Descriptions.Item>
                <Descriptions.Item label="Number of FOVs">{totalFOVs}</Descriptions.Item>
                <Descriptions.Item label="Number of tagged-structures">
                    {totalTaggedStructures}
                </Descriptions.Item>
            </Descriptions>
        </Card>
    );
};

export default DatasetCard;

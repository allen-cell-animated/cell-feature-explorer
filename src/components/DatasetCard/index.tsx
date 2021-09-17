import * as React from "react";
import { Card, Descriptions, Tag, Divider} from "antd";
import { DatasetMetaData } from "../../constants/datasets";
const { Meta } = Card;

import styles from "./style.css";

interface DatasetCardProps extends DatasetMetaData {
    handleSelectDataset: (id: string) => void;
}

const DatasetCard: React.FunctionComponent<DatasetCardProps> = ({
    name,
    version,
    description,
    handleSelectDataset,
    link,
    id,
    userData,
    image,
}: DatasetCardProps) => {
    const title = (
        <>
            <div>
                {userData.isNew && <Tag color="purple">beta</Tag>}
                {name}
            </div>
            <span className={styles.version}>{version}</span>
            {userData.inReview && (
                <>
                    <Divider type="vertical" /> (in review)
                </>
            )}
        </>
    );
    const cardContent = (
        <Card
            style={{ width: 430 }}
            className={styles.card}
            hoverable
            bordered={false}
            cover={
                <img
                    className={styles.staticThumbnail}
                    alt={`Snapshot of simulation for ${name}`}
                    src={image}
                />
            }
        >
            <Meta
                title={title}
                description={
                    <div
                        className="content"
                        dangerouslySetInnerHTML={{ __html: description }}
                    ></div>
                }
            />
            <Descriptions column={1} size="small">
                <Descriptions.Item label="Number of Cells">
                    {userData.totalCells.toLocaleString("en")}
                </Descriptions.Item>
                <Descriptions.Item label="Number of FOVs">
                    {userData.totalFOVs.toLocaleString("en")}
                </Descriptions.Item>
                <Descriptions.Item label="Number of tagged structures">
                    {userData.totalTaggedStructures}
                </Descriptions.Item>
            </Descriptions>
        </Card>
    );
    if (link) {
        return <a href={link}>{cardContent}</a>;
    }
    return <div onClick={() => handleSelectDataset(id)}>{cardContent}</div>;
};

export default DatasetCard;

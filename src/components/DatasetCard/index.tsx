import * as React from "react";
import { Card, Descriptions, Tag, Divider} from "antd";
import { DatasetMetaData } from "../../constants/datasets";
const { Meta } = Card;

import styles from "./style.css";

interface DatasetCardProps extends DatasetMetaData {
    handleSelectDataset: (id: string) => void;
}

const DatasetCard: React.FunctionComponent<DatasetCardProps> = ({
    title,
    name,
    version,
    description,
    handleSelectDataset,
    link,
    id,
    userData,
    image,
}: DatasetCardProps) => {
    // Prefix version number with a "v" if necessary
    const versionPrefixed = version.startsWith("v") ? version : `v${version}`;

    const displayTitle = (
        <>
            <div>
                {userData.isNew && <Tag color="purple">beta</Tag>}
                {title ? title : name}
            </div>
            <span className={styles.version}>{versionPrefixed}</span>
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
                    alt={`Snapshot of simulation for ${title}`}
                    src={image}
                />
            }
        >
            <Meta
                title={displayTitle}
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

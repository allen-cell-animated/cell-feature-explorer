import * as React from "react";
import { Card, Descriptions, Tag, Divider} from "antd";
import { DatasetMetaData } from "../../constants/datasets";
const { Meta } = Card;

const styles = require("./style.css");

interface DatasetCardProps extends DatasetMetaData {
    handleSelectDataset: (link: string) => void;
}

const DatasetCard: React.FunctionComponent<DatasetCardProps> = ({
    name,
    version,
    image,
    description,
    totalCells,
    totalFOVs,
    totalTaggedStructures,
    isNew,
    inReview,
    handleSelectDataset,
    link
}: DatasetCardProps) => {
    const title = (
        <>
            <div>
                {isNew && <Tag color="purple">new</Tag>}
                {name}
            </div>
            <span className={styles.version}>{version}</span>
            {inReview && (
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
                    {totalCells.toLocaleString("en")}
                </Descriptions.Item>
                <Descriptions.Item label="Number of FOVs">
                    {totalFOVs.toLocaleString("en")}
                </Descriptions.Item>
                <Descriptions.Item label="Number of tagged structures">
                    {totalTaggedStructures}
                </Descriptions.Item>
            </Descriptions>
        </Card>
    );
    if (link) {
        
        return (
            <a href={link}>
                {cardContent}
            </a>
        );
    } 
    return (
        <div onClick={() => handleSelectDataset(version)}>
            {cardContent}
        </div>
    );
};

export default DatasetCard;

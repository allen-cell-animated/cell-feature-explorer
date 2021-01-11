import * as React from "react";
import { Card, Descriptions, Tag, Divider} from "antd";
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
    isNew,
    inReview,
}: DatasetMetaData) => {
    const title = (
    <>
            <div>{name}</div>
            {isNew && (<Tag color="purple">New</Tag>)}
            <span className={styles.version}>{version}</span>
            {inReview && <><Divider type="vertical"/> (in review)</>}

    </>
    )
    return (
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
            <Meta title={title} description={ <div className="content" dangerouslySetInnerHTML={{__html: description}}></div>} />
            <Descriptions column={1} size="small">
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

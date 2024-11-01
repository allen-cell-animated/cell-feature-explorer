import { PlusOutlined } from "@ant-design/icons";
import { Flex } from "antd";
import { RcFile } from "antd/es/upload";
import Dragger from "antd/es/upload/Dragger";
import { connect } from "react-redux";
import React, { ReactElement } from "react";

import CsvRequest, { DEFAULT_CSV_DATASET_KEY } from "../../state/image-dataset/csv-dataset";
import { ImageDataset, Megaset } from "../../state/image-dataset/types";
import metadataStateBranch from "../../state/metadata";
import {
    ReceiveAvailableDatasetsAction,
    ReceiveImageDatasetAction,
} from "../../state/metadata/types";
import selectionStateBranch from "../../state/selection";
import { ChangeSelectionAction } from "../../state/selection/types";

type CsvUploadProps = {
    replaceImageDataset: (dataset: ImageDataset) => ReceiveImageDatasetAction;
    receiveAvailableDatasets: (megasets: Megaset[]) => ReceiveAvailableDatasetsAction;
    changeDataset: (id: string) => ChangeSelectionAction;
};

function CsvUpload(props: CsvUploadProps): ReactElement {
    const action = async (file: RcFile): Promise<string> => {
        // TODO: handle other file types here and async/loading?
        const fileContents = await file.text();
        const dataset = new CsvRequest(fileContents);
        props.replaceImageDataset(dataset);

        // Should be synchronous because there's only one mock dataset
        const megasets = await dataset.getAvailableDatasets();
        props.receiveAvailableDatasets(megasets);
        props.changeDataset(DEFAULT_CSV_DATASET_KEY);

        return Promise.resolve("");
    };

    return (
        <Dragger
            // showUploadList={false}
            action={action}
            accept=".csv"
            multiple={false}
            style={{ width: "50vw" }}
        >
            <Flex vertical={true} align={"center"}>
                <p style={{ fontSize: "30px" }}>
                    <PlusOutlined />
                </p>
                <p className="ant-upload-text">Click or drag a CSV file here to load.</p>
            </Flex>
        </Dragger>
    );
}
const dispatchToPropsMap = {
    receiveAvailableDatasets: metadataStateBranch.actions.receiveAvailableDatasets,
    changeDataset: selectionStateBranch.actions.changeDataset,
    replaceImageDataset: metadataStateBranch.actions.replaceImageDataset,
};

export default connect(undefined, dispatchToPropsMap)(CsvUpload);

import { PlusOutlined } from "@ant-design/icons";
import { Flex } from "antd";
import { RcFile } from "antd/es/upload";
import Dragger from "antd/es/upload/Dragger";
import React, { ReactElement } from "react";
import metadataStateBranch from "../../state/metadata";
import selectionStateBranch from "../../state/selection";
import { ImageDataset, Megaset } from "../../state/image-dataset/types";
import CsvRequest from "../../state/image-dataset/csv-dataset";
import { connect } from "react-redux";
import {
    ReceiveAvailableDatasetsAction,
    ReceiveImageDatasetAction,
} from "../../state/metadata/types";
import { ChangeSelectionAction } from "../../state/selection/types";

type CsvUploadButtonProps = {
    replaceImageDataset: (dataset: ImageDataset) => ReceiveImageDatasetAction;
    receiveAvailableDatasets: (megasets: Megaset[]) => ReceiveAvailableDatasetsAction;
    changeDataset: (id: string) => ChangeSelectionAction;
};

function CsvUploadButton(props: CsvUploadButtonProps): ReactElement {
    const action = async (file: RcFile): Promise<string> => {
        // TODO: handle other file types here and async/loading?
        const fileContents = await file.text();
        const dataset = new CsvRequest(fileContents);
        // dispatch these?
        props.replaceImageDataset(dataset);
        const megasets = await dataset.getAvailableDatasets();
        props.receiveAvailableDatasets(megasets);
        props.changeDataset("csv");

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

export default connect(undefined, dispatchToPropsMap)(CsvUploadButton);

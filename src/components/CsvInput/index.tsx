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
import { receiveImageDataset } from "../../state/metadata/actions";

type CsvInputProps = {
    receiveImageDataset: (dataset: ImageDataset) => ReceiveImageDatasetAction;
    receiveAvailableDatasets: (megasets: Megaset[]) => ReceiveAvailableDatasetsAction;
    changeDataset: (id: string) => ChangeSelectionAction;
};

/**
 * An input area for CSV files. When CSV data is provided, replaces the current image dataset
 * with a new `CsvRequest` image dataset and triggers the loading of the CSV data.
 */
function CsvInput(props: CsvInputProps): ReactElement {
    const action = async (file: RcFile): Promise<string> => {
        // TODO: handle loading via URL
        const fileContents = await file.text();
        const dataset = new CsvRequest(fileContents);
        props.receiveImageDataset(dataset);

        // CSV Request mocks up a single dataset
        const megasets = await dataset.getAvailableDatasets();
        props.receiveAvailableDatasets(megasets);
        props.changeDataset(DEFAULT_CSV_DATASET_KEY);

        return Promise.resolve("");
    };

    return (
        <Dragger action={action} accept=".csv" multiple={false} style={{ width: "50vw" }}>
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
    receiveImageDataset: metadataStateBranch.actions.receiveImageDataset,
};

export default connect(undefined, dispatchToPropsMap)(CsvInput);

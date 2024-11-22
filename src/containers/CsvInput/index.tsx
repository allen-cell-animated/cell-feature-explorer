import { PlusOutlined } from "@ant-design/icons";
import { Flex } from "antd";
import { RcFile } from "antd/es/upload";
import Dragger from "antd/es/upload/Dragger";
import React, { ReactElement } from "react";
import { ActionCreator, connect } from "react-redux";

import { State } from "../../state";
import imageDatasetStateBranch from "../../state/image-dataset";
import { LoadCsvDatasetAction } from "../../state/image-dataset/types";

type DispatchProps = {
    loadCsvDataset: ActionCreator<LoadCsvDatasetAction>;
};

type CsvInputProps = DispatchProps;

/**
 * An input area for CSV files. When CSV data is provided, replaces the current image dataset
 * with a new `CsvRequest` image dataset and triggers the loading of the CSV data.
 */
function CsvInput(props: CsvInputProps): ReactElement {
    const action = async (file: RcFile): Promise<string> => {
        const fileText = await file.text();
        props.loadCsvDataset(fileText);
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

const dispatchToPropsMap: DispatchProps = {
    loadCsvDataset: imageDatasetStateBranch.actions.loadCsvDataset,
};

export default connect<any, DispatchProps, any, State>(null, dispatchToPropsMap)(CsvInput);

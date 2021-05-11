import AllenCellHeader from "@aics/allencell-nav-bar";
import "@aics/allencell-nav-bar/style/style.css";
import { Layout } from "antd";
import * as React from "react";
import { connect } from "react-redux";
import classNames from "classnames";

import BackToPlot from "../../components/BackToPlot/index";
import metadataStateBranch from "../../state/metadata";
import selectionStateBranch from "../../state/selection";
import LandingPage from "../../components/LandingPage";
import Cfe from "../Cfe";
import LoadingOverlay from "../../components/LoadingOverlay";
import { State } from "../../state/types";
import { ChangeSelectionAction } from "../../state/selection/types";
import { DatasetMetaData } from "../../constants/datasets";
import { RequestAction } from "../../state/metadata/types";

const styles = require("./style.css");

interface AppProps {
    isLoading: boolean;
    loadingText: string;
    changeDataset: (id: string) => ChangeSelectionAction;
    selectedDataset: string;
    requestAvailableDatasets: () => RequestAction;
    datasets: DatasetMetaData[];
}

class App extends React.Component<AppProps, {}> {
    public componentDidMount = () => {
        this.props.requestAvailableDatasets();
    }

    public handleSelectDataset = (id: string) => {
        this.props.changeDataset(id)
    }

    public render() {
        const { isLoading, loadingText, selectedDataset, datasets } = this.props;
        const showLoadingOverlay = isLoading && !!selectedDataset;
        const layoutClassnames = classNames([
            styles.container,
            { [styles.isLoading]: showLoadingOverlay },
        ]);
        return (
            <div
                className={classNames([styles.wrapper, { [styles.isLoading]: showLoadingOverlay }])}
            >
                <Layout className={layoutClassnames}>
                    <LoadingOverlay isLoading={showLoadingOverlay} loadingText={loadingText} />

                    {!!selectedDataset && <BackToPlot />}

                    <AllenCellHeader show={true} />
                    <Layout>
                        {!!selectedDataset ? (
                            <Cfe />
                        ) : (
                            <LandingPage
                                datasets={datasets}
                                handleSelectDataset={this.handleSelectDataset}
                            />
                        )}
                    </Layout>
                </Layout>
            </div>
        );
    }

}

function mapStateToProps(state: State) {
    return {
        isLoading: metadataStateBranch.selectors.getIsLoading(state),
        loadingText: metadataStateBranch.selectors.getLoadingText(state),
        selectedDataset: selectionStateBranch.selectors.getSelectedDataset(state),
        datasets: metadataStateBranch.selectors.getDatasets(state)
    };
}

const dispatchToPropsMap = {
    changeDataset: selectionStateBranch.actions.changeDataset,
    requestAvailableDatasets: metadataStateBranch.actions.requestAvailableDatasets
};

export default connect(mapStateToProps, dispatchToPropsMap)(App);

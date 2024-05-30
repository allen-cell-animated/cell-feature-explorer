import { ConfigProvider, Layout, theme } from "antd";
import * as React from "react";
import { connect } from "react-redux";
import classNames from "classnames";

import AllenCellHeader from "../../components/AppHeader";
import metadataStateBranch from "../../state/metadata";
import selectionStateBranch from "../../state/selection";
import LandingPage from "../../components/LandingPage";
import Cfe from "../Cfe";
import LoadingOverlay from "../../components/LoadingOverlay";
import { State } from "../../state/types";
import { ChangeSelectionAction } from "../../state/selection/types";
import { Megaset } from "../../state/image-dataset/types";
import { RequestAction } from "../../state/metadata/types";

const { Header } = Layout;
import styles from "./style.css";

interface AppProps {
    isLoading: boolean;
    loadingText: string;
    changeDataset: (id: string) => ChangeSelectionAction;
    selectedDataset: string;
    requestAvailableDatasets: () => RequestAction;
    megasets: Megaset[];
}

const PALETTE = {
    purple: "#8950d9",
    darkGray: "#313131",
    mediumGray: "#6e6e6e",
    lightGray: "#a0a0a0",
    headerGray: "#4b4b4b",
    brightGreen: "#b2d030",
    brightBlue: "#00a0ff",
    linkHover: "#69b1ff",
    white: "#ffffff",
};

class App extends React.Component<AppProps> {
    public componentDidMount = () => {
        this.props.requestAvailableDatasets();
    };

    public handleSelectDataset = (id: string) => {
        this.props.changeDataset(id);
    };

    public render() {
        const { isLoading, loadingText, selectedDataset, megasets } = this.props;
        const showLoadingOverlay = isLoading && !!selectedDataset;
        const layoutClassnames = classNames([
            styles.container,
            { [styles.isLoading]: showLoadingOverlay },
        ]);

        const { darkAlgorithm } = theme;

        return (
            <ConfigProvider
                theme={{
                    algorithm: darkAlgorithm,
                    token: {
                        colorPrimary: PALETTE.purple,
                        colorBgBase: PALETTE.darkGray,
                        colorTextHeading: PALETTE.white,
                        fontWeightStrong: 600,
                        borderRadius: 4,
                        borderRadiusLG: 2,
                        colorLink: PALETTE.brightBlue,
                        colorLinkHover: PALETTE.linkHover,
                    },
                    components: {
                        Layout: {
                            headerBg: PALETTE.headerGray,
                            headerColor: PALETTE.white,
                        },
                    },
                }}
            >
                <div
                    className={classNames([
                        styles.wrapper,
                        { [styles.isLoading]: showLoadingOverlay },
                    ])}
                >
                    <Layout className={layoutClassnames}>
                        <LoadingOverlay isLoading={showLoadingOverlay} loadingText={loadingText} />
                        <Header className={styles.navBar}>
                            <AllenCellHeader selectedDataset={selectedDataset} />
                        </Header>
                        <Layout>
                            {!!selectedDataset ? (
                                <Cfe />
                            ) : (
                                <LandingPage
                                    megasets={megasets}
                                    handleSelectDataset={this.handleSelectDataset}
                                />
                            )}
                        </Layout>
                    </Layout>
                </div>
            </ConfigProvider>
        );
    }
}

function mapStateToProps(state: State) {
    return {
        isLoading: metadataStateBranch.selectors.getIsLoading(state),
        loadingText: metadataStateBranch.selectors.getLoadingText(state),
        selectedDataset: selectionStateBranch.selectors.getSelectedDataset(state),
        megasets: metadataStateBranch.selectors.getMegasetsByNewest(state),
    };
}

const dispatchToPropsMap = {
    changeDataset: selectionStateBranch.actions.changeDataset,
    requestAvailableDatasets: metadataStateBranch.actions.requestAvailableDatasets,
};

export default connect(mapStateToProps, dispatchToPropsMap)(App);

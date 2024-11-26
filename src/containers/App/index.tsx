import { ConfigProvider, Layout, theme } from "antd";
import classNames from "classnames";
import * as React from "react";
import { connect } from "react-redux";

import AllenCellHeader from "../../components/AppHeader";
import LandingPage from "../../components/LandingPage";
import LoadingOverlay from "../../components/LoadingOverlay";
import { PALETTE } from "../../constants";
import { imageDataset } from "../../state";
import CsvRequest from "../../state/image-dataset/csv-dataset";
import { Megaset } from "../../state/image-dataset/types";
import metadataStateBranch from "../../state/metadata";
import { RequestAction } from "../../state/metadata/types";
import selectionStateBranch from "../../state/selection";
import { ChangeSelectionAction } from "../../state/selection/types";
import { State } from "../../state/types";
import Cfe from "../Cfe";

import styles from "./style.css";

const { Header } = Layout;

interface AppProps {
    isLoading: boolean;
    loadingText: string;
    changeDataset: (id: string) => ChangeSelectionAction;
    selectedDataset: string;
    requestAvailableDatasets: () => RequestAction;
    megasets: Megaset[];
}

const { darkAlgorithm } = theme;

const configProviderTheme = {
    algorithm: darkAlgorithm,
    token: {
        colorPrimary: PALETTE.purple,
        colorBgBase: PALETTE.darkGray,
        colorTextHeading: PALETTE.white,
        fontWeightStrong: 600,
        borderRadius: 4,
        borderRadiusSM: 4,
        borderRadiusLG: 4,
        colorLink: PALETTE.brightBlue,
        colorLinkHover: PALETTE.linkHover,
        colorIcon: PALETTE.white,
        colorBgElevated: PALETTE.darkGray,
    },
    components: {
        Button: {
            colorPrimary: PALETTE.purple,
            primaryShadow: "0 0px 0 transparent",
            defaultShadow: "0 0px 0 transparent",
        },
        Checkbox: {
            borderRadiusSM: 2,
        },
        Collapse: {
            contentBg: PALETTE.collapseContentGray,
            headerBg: PALETTE.collapseHeaderGray,
        },
        Layout: {
            headerBg: PALETTE.headerGray,
            headerColor: PALETTE.white,
            siderBg: PALETTE.collapseContentGray,
        },
        Modal: {
            contentBg: PALETTE.extraLightGray,
            headerBg: PALETTE.extraLightGray,
            colorIcon: PALETTE.mediumGray,
        },
        Menu: {
            colorBgElevated: PALETTE.darkGray,
        },
        Select: {
            // Dropdown arrow color
            colorTextQuaternary: PALETTE.white,
        },
        Tooltip: {
            colorBgSpotlight: "rgba(0, 0, 0, 0.85)",
        },
    },
};

const App: React.FC<AppProps> = (props) => {
    const { isLoading, loadingText, selectedDataset, megasets } = props;
    const showLoadingOverlay = isLoading && !!selectedDataset;
    const layoutClassnames = classNames([
        styles.container,
        { [styles.isLoading]: showLoadingOverlay },
    ]);

    React.useEffect(() => {
        props.requestAvailableDatasets();
    }, []);

    const handleSelectDataset = React.useCallback(
        (id: string) => {
            props.changeDataset(id);
        },
        [props.changeDataset]
    );

    if (imageDataset instanceof CsvRequest) {
        // TODO: detect when the `dataset` URL param is empty and show the default
        // landing page again.
    }

    return (
        <ConfigProvider theme={configProviderTheme}>
            <div
                className={classNames([styles.wrapper, { [styles.isLoading]: showLoadingOverlay }])}
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
                                handleSelectDataset={handleSelectDataset}
                            />
                        )}
                    </Layout>
                </Layout>
            </div>
        </ConfigProvider>
    );
};

function mapStateToProps(state: State) {
    return {
        imageDataset: imageDataset.selectors.getImageDataset(state),
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

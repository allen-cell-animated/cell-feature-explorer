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
import SmallScreenWarning from "../../components/SmallScreenWarning";
import Cfe from "../Cfe";
import LoadingOverlay from "../../components/LoadingOverlay";
import { State } from "../../state/types";
import { ChangeSelectionAction } from "../../state/selection/types";

const styles = require("./style.css");
const SMALL_SCREEN_WARNING_BREAKPOINT = 768;

interface AppProps {
    isLoading: boolean;
    loadingText: string;
    changeDataset: (id: string) => ChangeSelectionAction;
    selectedDataset: string;
}

class App extends React.Component<AppProps, {}> {
    public state = {
        dontShowSmallScreenWarningAgain: false,
        showSmallScreenWarning: window.innerWidth <= SMALL_SCREEN_WARNING_BREAKPOINT,
        width: window.innerWidth,
        renderExplorerApp: false,
    };

    public componentDidMount = () => {
        window.addEventListener("resize", this.updateDimensions);
        if (location.hash) {
            this.setState({ renderExplorerApp: true })
        }
    }

    public updateDimensions = () => {
        if (window.innerWidth === this.state.width) {
            // listener is triggered on scroll in some mobile devices
            return;
        }
        const shouldShow = window.innerWidth <= SMALL_SCREEN_WARNING_BREAKPOINT &&
        !this.state.dontShowSmallScreenWarningAgain;
        this.setState({
            showSmallScreenWarning: shouldShow,
            width: window.innerWidth,
        });
    }


    public handleClose = () => {
        this.setState({
            showSmallScreenWarning: false,
        });
    }

    public onDismissCheckboxChecked = (value: boolean) => {
        this.setState({ dontShowSmallScreenWarningAgain: value });
    }

    public handleSelectDataset = (id: string) => {

        this.props.changeDataset(id)
    }

    public render() {
        const { isLoading, loadingText, selectedDataset } = this.props;
        const { showSmallScreenWarning } = this.state;
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

                    <SmallScreenWarning
                        handleClose={this.handleClose}
                        onDismissCheckboxChecked={this.onDismissCheckboxChecked}
                        visible={showSmallScreenWarning}
                    />
                    {!!selectedDataset && <BackToPlot />}

                    <AllenCellHeader show={true} />
                    <Layout>
                        {!!selectedDataset ? (
                            <Cfe />
                        ) : (
                            <LandingPage handleSelectDataset={this.handleSelectDataset} />
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
    };
}

const dispatchToPropsMap = {
    changeDataset: selectionStateBranch.actions.changeDataset,
};

export default connect(mapStateToProps, dispatchToPropsMap)(App);

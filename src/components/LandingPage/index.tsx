import React from "react";
import { Row, Col, Layout } from "antd";

import datasetsMetaData from "../../containers/App/datasets";
import DatasetCard from "../../components/DatasetCard";
const { Content, Header } = Layout;

const styles = require("./style.css");

interface LandingPageProps {
    handleSelectDataset: (link: string) =>  void;
}
const LandingPage = ({ handleSelectDataset }: LandingPageProps) => (
    <Layout>
        <Header className={styles.headerMain}>
            <h1>Cell Feature Explorer</h1>

            <div>
                View any of over 200,000 3D cell images and plot cells by intracellular features
                such as organelle volume.
            </div>
        </Header>
        <Layout>
            <Content className={styles.content}>
                <h2 className={styles.subtitle}>Load a dataset</h2>
                <Row type="flex" justify="space-around" className={styles.section}>
                    {datasetsMetaData.map((dataset) => (
                        <Col key={`${dataset.name}-${dataset.version}`}>
                            <DatasetCard {...dataset} handleSelectDataset={handleSelectDataset} />
                        </Col>
                    ))}
                </Row>
                <Row>
                    <Col className={styles.section}>
                        The Cell Feature Explorer is an online tool to access our complete database
                        of segmented and processed cells as curated datasets. We have annotated each
                        of our cells with measured features, such as cellular volume and what stage
                        of mitosis it is in. The tool is composed of a plot and a 3D viewer. In the
                        plot each cell is graphed by its measured features or select principal
                        components described in our journal publications. To access older data sets,
                        see our{" "}
                        <a
                            target="_blank"
                            rel="noreferrer"
                            href="https://www.allencell.org/data-downloading.html"
                        >
                            Data Downloading page
                        </a>
                        .
                    </Col>
                </Row>
                <Row>
                    <Col className={styles.section}>
                        <h2 className={styles.subtitle}>Cell features in our data </h2>
                        <p>
                            hiPS cells from the{" "}
                            <a
                                target="_blank"
                                rel="noreferrer"
                                href="https://www.allencell.org/cell-catalog.html"
                            >
                                Allen Cell Collection
                            </a>{" "}
                            grow in epithelial-like monolayer colonies when cultured on glass using
                            our methods. We image rectangular fields of view (FOV) from these
                            colonies in 3D using spinning disk confocal microscopy to collect 4
                            channels of data for each FOV, including one brightfield channel and
                            three fluorescent channels for: dyed DNA, dyed cell membrane, and one
                            fluorescently labeled protein– designed to visualize a particular
                            organelle or structure via endogenous tagging. The fluorescent channels
                            are segmented to demarcate the structures from the background noise and
                            to define the boundaries of individual cells. The segmented structures
                            are then measured, and the data for these measurements, as well as shape
                            modes (from principal component analysis) are made available for
                            plotting at the top of the CFE tool page. The beautiful cells and the
                            FOVs from which they were segmented can be explored in a 3D viewer at
                            the bottom of the CFE tool page.
                        </p>
                    </Col>
                </Row>
            </Content>
        </Layout>
    </Layout>
);

export default LandingPage;

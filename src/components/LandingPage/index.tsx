import React from "react";
import { Row, Col, Layout } from "antd";
import { map } from "lodash";

import DatasetCard from "../../components/DatasetCard";
import { Megaset } from "../../types";
const { Content, Header } = Layout;

import styles from "./style.css";

interface LandingPageProps {
    handleSelectDataset: (id: string) => void;
    megasets: Megaset[];
}

const renderCards = (megasets: Megaset[], handleSelectDataset: (id: string) => void) => {
    console.log(megasets)
    return megasets.map((megaset) => (
        map(megaset.datasets, (dataset) => (
            <Col key={`${dataset.name}-${dataset.version}`}>
                <DatasetCard {...dataset} handleSelectDataset={handleSelectDataset} />
            </Col>
        ))
    ))
}

const LandingPage = ({ handleSelectDataset, megasets }: LandingPageProps) => (
    <Layout>
        <Header className={styles.headerMain}>
            <div>
                View any of over 200,000 3D cell images and plot cells by features such as organelle
                volume
            </div>
        </Header>
        <Layout>
            <Content className={styles.content}>
                <h2 className={styles.subtitle}>Load a dataset</h2>
                <Row type="flex" justify="space-around" className={styles.section}>
                    {renderCards(megasets, handleSelectDataset)}
                    <Col className={styles.caption}>
                        The Cell Feature Explorer is an online tool to access our complete database
                        of segmented and processed cells as curated datasets. We have annotated each
                        of our cells with measured features, such as cellular volume and what stage
                        of mitosis it is in. The tool is composed of a plot and a 3D viewer. In the
                        plot each cell is graphed by its measured features described in our journal
                        publications. To access older data sets, see our{" "}
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
                <Row className={styles.lightSection}>
                    <Col className={styles.section}>
                        <h2 className={styles.subtitle}>Cell features in our data </h2>
                        <div className={styles.paragraph}>
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
                            colonies in 3D, using spinning disk confocal microscopy. We collect four
                            channels of data for each FOV, including one brightfield channel and
                            three fluorescent channels:
                            <ul>
                                <li>dyed DNA </li>
                                <li>dyed cell membrane </li>
                                <li>
                                    one fluorescently labeled protein designed to visualize a
                                    particular organelle or cellular structure via endogenous
                                    tagging
                                </li>
                            </ul>
                        </div>
                        <div className={styles.paragraph}>
                            The fluorescent channels are segmented to demarcate structures and to
                            define the boundaries of individual cells. The segmented structures are
                            then measured, and the data for these measurements, as well as cell and
                            nuclear shape modes (derived from a principal component analysis; please
                            see our recent article in{" "}
                            <a
                                target="_blank"
                                rel="noreferrer"
                                href="https://www.biorxiv.org/content/10.1101/2020.12.08.415562v1"
                            >
                                bioRxiv
                            </a>
                            ) are made available for plotting at the top of the CFE tool page. The
                            beautiful cells and the FOVs from which they were segmented can be
                            explored in a 3D viewer at the bottom of the CFE tool page.
                        </div>
                    </Col>
                </Row>
            </Content>
        </Layout>
    </Layout>
);

export default LandingPage;

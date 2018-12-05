import {
    Button,
    Icon,
    List,
} from "antd";
import * as React from "react";
import { connect } from "react-redux";

import GalleryCard from "../../components/GalleryCard";
import {
    clearAllSelectedPoints,
    deselectPoint,
    downloadImage,
    selectCellFor3DViewer,
} from "../../state/selection/actions";
import { getThumbnails } from "../../state/selection/selectors";
import {
    ChangeSelectionAction,
    DeselectPointAction,
    DownloadImageAction,
    ResetSelectionAction,
} from "../../state/selection/types";
import {
    State,
    Thumbnail,
} from "../../state/types";

const styles = require("./style.css");

interface ThumbnailGalleryProps {
    data: Thumbnail[];
    handleClearAllSelectedPoints: () => ResetSelectionAction;
    handleDeselectPoint: (payload: number) => DeselectPointAction;
    handleDownloadImage: (payload: number) => DownloadImageAction;
    handleOpenIn3D: (payload: string) => ChangeSelectionAction;
}

class ThumbnailGallery extends React.Component<ThumbnailGalleryProps, {}> {

    constructor(props: ThumbnailGalleryProps) {
        super(props);
        this.renderGalleryCard = this.renderGalleryCard.bind(this);
    }

    public render() {
        const {
            data,
            handleClearAllSelectedPoints,
        } = this.props;
        return (
            <div id="gallery">
                <section className={styles.galleryHeader}>
                    <h3><Icon type="picture"/> Thumbnail gallery</h3>
                    {data.length > 0 ?
                        <Button
                            type="primary"
                            icon="close"
                            onClick={handleClearAllSelectedPoints}
                        >Clear All
                        </Button> : <h4>Clicked points on the plot will appear in this section</h4>}
                </section>
                <List
                    grid={{ gutter: 8, xs: 1, sm: 2, md: 4, lg: 6, xl: 12 }}
                    dataSource={data.length > 0 ? data : [{empty: true}]}
                    renderItem={this.renderGalleryCard}
                />
            </div>
        );
    }

    private renderGalleryCard(item: Thumbnail) {
        const {
            handleDeselectPoint,
            handleDownloadImage,
            handleOpenIn3D,
        } = this.props;
        return (
            <List.Item>
                <GalleryCard
                    empty={item.empty}
                    title={item.cellID}
                    src={item.src}
                    pointIndex={item.pointIndex}
                    handleDeselectPoint={handleDeselectPoint}
                    handleOpenIn3D={handleOpenIn3D}
                    handleDownloadImage={handleDownloadImage}
                />
            </List.Item>
        );
    }
}

function mapStateToProps(state: State) {
    return {
        data: getThumbnails(state),
    };
}

const dispatchToPropsMap = {
    handleClearAllSelectedPoints: clearAllSelectedPoints,
    handleDeselectPoint: deselectPoint,
    handleDownloadImage : downloadImage,
    handleOpenIn3D: selectCellFor3DViewer,
};

export default connect(mapStateToProps, dispatchToPropsMap)(ThumbnailGallery);

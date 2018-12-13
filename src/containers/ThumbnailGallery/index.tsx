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
    selectCellFor3DViewer,
} from "../../state/selection/actions";
import { getThumbnails } from "../../state/selection/selectors";
import {
    ChangeSelectionAction,
    DeselectPointAction,
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
            handleOpenIn3D,
        } = this.props;
        return (
            <List.Item>
                <GalleryCard
                    empty={item.empty}
                    cellID={item.cellID}
                    downloadHref={item.downloadHref}
                    src={item.src}
                    handleDeselectPoint={handleDeselectPoint}
                    handleOpenIn3D={handleOpenIn3D}
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
    handleOpenIn3D: selectCellFor3DViewer,
};

export default connect(mapStateToProps, dispatchToPropsMap)(ThumbnailGallery);

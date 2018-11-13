import {
    Button,
    List,
} from "antd";
import * as React from "react";
import { connect } from "react-redux";

import "antd/lib/list/style";

import GalleryCard from "../../components/GalleryCard";
import {
    clearAllSelectedPoints,
    deselectPoint, selectCellFor3DViewer,
} from "../../state/selection/actions";
import { getThumbnails } from "../../state/selection/selectors";
import {
    DeselectPointAction,
    ResetSelectionAction,
    SelectCellFor3DAction,
} from "../../state/selection/types";
import {
    State,
    Thumbnail,
} from "../../state/types";

interface ThumbnailGalleryProps {
    data: Thumbnail[];
    handleClearAllSelectedPoints: () => ResetSelectionAction;
    handleDeselectPoint: (payload: number) => DeselectPointAction;
    handleOpenIn3D: (payload: string) => SelectCellFor3DAction;
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
                {data.length > 0 ?
                    <Button
                        type="primary"
                        onClick={handleClearAllSelectedPoints}
                    >Clear All
                    </Button> : null}
                <List
                    grid={{ gutter: 8, xs: 1, sm: 2, md: 4, lg: 6, xl: 8 }}
                    dataSource={data.length > 0 ? data : [{loading: true}]}
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
        console.log(item)
        return (
            <List.Item>
                <GalleryCard
                    loading={item.loading}
                    title={item.cellID}
                    src={item.src}
                    pointIndex={item.pointIndex}
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

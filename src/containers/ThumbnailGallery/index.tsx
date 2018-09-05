import { List } from "antd";
import * as React from "react";
import { connect } from "react-redux";

import "antd/lib/list/style";

import GalleryCard from "../../components/GalleryCard";
import { deselectPoint } from "../../state/selection/actions";
import { getThumbnails } from "../../state/selection/selectors";
import { DeselectPointAction } from "../../state/selection/types";
import {
    State,
    Thumbnail,
} from "../../state/types";

interface ThumbnailGalleryProps {
    data: Thumbnail[];
    handleDeselectPoint: (payload: number) => DeselectPointAction;
}

class ThumbnailGallery extends React.Component<ThumbnailGalleryProps, {}> {

    constructor(props: ThumbnailGalleryProps) {
        super(props);
        this.renderGalleryCard = this.renderGalleryCard.bind(this);
    }

    public render() {
        const { data } = this.props;
        return (
            <List
                grid={{ gutter: 10, xs: 1, sm: 2, md: 4, lg: 4, xl: 6 }}
                dataSource={data}
                renderItem={this.renderGalleryCard}
            />
        );
    }

    private renderGalleryCard(item: Thumbnail) {
        const { handleDeselectPoint } = this.props;

        return (
            <List.Item>
                <GalleryCard
                    title={item.cellID}
                    src={item.src}
                    pointIndex={item.pointIndex}
                    handleDeselectPoint={handleDeselectPoint}
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
    handleDeselectPoint: deselectPoint,
};

export default connect(mapStateToProps, dispatchToPropsMap)(ThumbnailGallery);

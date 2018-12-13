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
import {
    getSelected3DCell,
    getThumbnails,
} from "../../state/selection/selectors";
import {
    DeselectPointAction,
    ResetSelectionAction,
    SelectCellIn3DAction,
} from "../../state/selection/types";
import {
    State,
    Thumbnail,
} from "../../state/types";

const styles = require("./style.css");

interface ThumbnailGalleryProps {
    data: Thumbnail[];
    selectedCell: number;
    handleClearAllSelectedPoints: () => ResetSelectionAction;
    handleDeselectPoint: (payload: number) => DeselectPointAction;
    handleOpenIn3D: (payload: number) => SelectCellIn3DAction;
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
            <div id="gallery" className={styles.container}>
                <section className={styles.galleryHeader}>
                    <h2><Icon type="picture"/>  Gallery</h2>
                    {data.length > 0 ?
                        <Button
                            icon="close"
                            onClick={handleClearAllSelectedPoints}
                        >Clear All
                        </Button> : <h4>Clicked points on the plot will appear in this section</h4>}
                </section>
                <List
                    grid={{ gutter: 12, xs: 1, sm: 2, md: 4, lg: 6, xl: 12 }}
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
            selectedCell,
        } = this.props;
        return (
            <List.Item>
                <GalleryCard
                    empty={item.empty}
                    cellID={item.cellID}
                    downloadHref={item.downloadHref}
                    src={item.src}
                    title={item.labeledStructure}
                    handleDeselectPoint={handleDeselectPoint}
                    handleOpenIn3D={handleOpenIn3D}
                    selected={Number(selectedCell) === Number(item.cellID)}
                />
            </List.Item>
        );
    }
}

function mapStateToProps(state: State) {
    return {
        data: getThumbnails(state),
        selectedCell: getSelected3DCell(state),
    };
}

const dispatchToPropsMap = {
    handleClearAllSelectedPoints: clearAllSelectedPoints,
    handleDeselectPoint: deselectPoint,
    handleOpenIn3D: selectCellFor3DViewer,
};

export default connect(mapStateToProps, dispatchToPropsMap)(ThumbnailGallery);

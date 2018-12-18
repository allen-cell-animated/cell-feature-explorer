import {
    Button,
    Form,
    Icon,
    Input,
    List,
} from "antd";
import { includes, map } from "lodash";
import * as React from "react";
import {
    ActionCreator,
    connect,
} from "react-redux";

import GalleryCard from "../../components/GalleryCard";
import {
    clearAllSelectedPoints,
    deselectPoint,
    selectCellFor3DViewer, selectPoint, setHoveredGalleryCard,
} from "../../state/selection/actions";
import {
    getClickedScatterPoints,
    getIds,
    getSelected3DCell,
} from "../../state/selection/selectors";
import {
    DeselectPointAction,
    ResetSelectionAction,
    SelectCellIn3DAction,
    SelectPointAction,
} from "../../state/selection/types";
import {
    State,
    Thumbnail,
} from "../../state/types";

import { getThumbnails } from "./selectors";

const Search = Input.Search;
const FormItem = Form.Item;

const styles = require("./style.css");

interface ThumbnailGalleryProps {
    clickedPoints: number[];
    data: Thumbnail[];
    ids: string[];
    selectedCell: number;
    addSearchedCell: ActionCreator<SelectPointAction>;
    handleClearAllSelectedPoints: ActionCreator<ResetSelectionAction>;
    handleDeselectPoint: ActionCreator<DeselectPointAction>;
    handleOpenIn3D: ActionCreator<SelectCellIn3DAction>;
    setHovered: ActionCreator<SelectPointAction>;
}

interface ThumbnailGalleryState {
    inputStatus: "success" | "error" | "warning" | "validating" | undefined;
    message: string;
}

const initialState = {
    inputStatus: undefined,
    message: "",
};

class ThumbnailGallery extends React.Component<ThumbnailGalleryProps, ThumbnailGalleryState> {

    constructor(props: ThumbnailGalleryProps) {
        super(props);
        this.renderGalleryCard = this.renderGalleryCard.bind(this);
        this.searchValidate = this.searchValidate.bind(this);
        this.resetSearch = this.resetSearch.bind(this);
        this.hoverCard = this.hoverCard.bind(this);
        this.unHover = this.unHover.bind(this);
        this.state = {
            ...initialState,
        };
    }

    public searchValidate(value: string) {
        const { clickedPoints, ids, addSearchedCell } = this.props;
        if (includes(map(clickedPoints, (ele) => ele.toString()), value)) {
            return this.setState({
                inputStatus: "warning",
                message: "that cell is already in the gallery",
            });
        }
        if (includes(ids, value)) {
            addSearchedCell(value);
            return this.setState({inputStatus: "success"});
        }
        this.setState({
            inputStatus: "error",
            message: "that id is not in our dataset",
        });
    }

    public resetSearch() {
        this.setState({
            inputStatus: initialState.inputStatus,
            message: initialState.message,
        });
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
                    <div>
                        <FormItem
                            hasFeedback={true}
                            validateStatus={this.state.inputStatus}
                            help={this.state.message}
                        >
                        <Search
                            placeholder="add image by cell id"
                            onSearch={this.searchValidate}
                            onChange={this.resetSearch}
                        />
                        </FormItem>
                    </div>
                    {data.length > 0 ?
                        <Button
                            icon="close"
                            onClick={handleClearAllSelectedPoints}
                        >Clear All
                        </Button> : <h4>Clicked points on the plot will appear in this section</h4>}

                </section>
                <List
                    grid={{ gutter: 12, xs: 1, sm: 2, md: 4, lg: 4, xl: 6 }}
                    dataSource={data.length > 0 ? data : [{empty: true}]}
                    renderItem={this.renderGalleryCard}
                />
            </div>
        );
    }

    private hoverCard({currentTarget}: React.MouseEvent<HTMLElement>) {
        const {setHovered} = this.props;
        if (currentTarget.id) {
            return setHovered(Number(currentTarget.id));
        }
        setHovered(Number(-1));
    }

    private unHover() {
        const {setHovered} = this.props;
        setHovered(Number(-1));

    }

    private renderGalleryCard(item: Thumbnail) {
        const {
            handleDeselectPoint,
            handleOpenIn3D,
            selectedCell,
        } = this.props;
        return (
            <List.Item
            >
                <div
                    onMouseEnter={this.hoverCard}
                    onMouseLeave={this.unHover}
                    id={item.cellID ? item.cellID.toString() : ""}
                >

                <GalleryCard
                    empty={item.empty}
                    cellID={item.cellID}
                    downloadHref={item.downloadHref}
                    src={item.src}
                    title={item.labeledStructure}
                    handleDeselectPoint={handleDeselectPoint}
                    handleOpenIn3D={handleOpenIn3D}
                    selected={Number(selectedCell) === item.cellID}
                />
                </div>

            </List.Item>
        );
    }
}

function mapStateToProps(state: State) {
    return {
        clickedPoints: getClickedScatterPoints(state),
        data: getThumbnails(state),
        ids: getIds(state),
        selectedCell: getSelected3DCell(state),
    };
}

const dispatchToPropsMap = {
    addSearchedCell: selectPoint,
    handleClearAllSelectedPoints: clearAllSelectedPoints,
    handleDeselectPoint: deselectPoint,
    handleOpenIn3D: selectCellFor3DViewer,
    setHovered: setHoveredGalleryCard,
};

export default connect(mapStateToProps, dispatchToPropsMap)(ThumbnailGallery);

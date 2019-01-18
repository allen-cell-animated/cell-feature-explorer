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

const messages = {
    error: "That id is not in our dataset.",
    success: initialState.message,
    warning: "That cell is already in the gallery.",
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
                message: messages.warning,
            });
        }
        if (includes(ids, value)) {
            addSearchedCell(value);
            return this.setState({
                inputStatus: "success",
                message: messages.success,
            });
        }
        this.setState({
            inputStatus: "error",
            message: messages.error,
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
                <h2><Icon type="picture"/>  Gallery</h2>

                <section className={styles.galleryHeader}>
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
                    {data.length > 0 &&
                        <Button
                            icon="close"
                            onClick={handleClearAllSelectedPoints}
                        >Clear All
                        </Button>}

                </section>
                <List
                    itemLayout="horizontal"
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
                <GalleryCard
                    onMouseEnter={this.hoverCard}
                    onMouseLeave={this.unHover}
                    labeledStructure={item.labeledStructure}
                    src={item.src}
                    selected={selectedCell === item.cellID}
                    downloadHref={item.downloadHref}
                    cellID={item.cellID}
                    handleDeselectPoint={handleDeselectPoint}
                    handleOpenIn3D={handleOpenIn3D}
                    empty={item.empty}
                />
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

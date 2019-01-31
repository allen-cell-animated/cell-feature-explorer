import {
    Button,
    Form,
    Icon,
    Input,
    List,
} from "antd";
import {
    find,
    includes,
    map,
} from "lodash";
import * as React from "react";
import {
    ActionCreator,
    connect,
} from "react-redux";

import GalleryCard from "../../components/GalleryCard";
import { requestAlbumData } from "../../state/metadata/actions";
import { getAllAlbumData } from "../../state/metadata/selectors";
import { RequestAction } from "../../state/metadata/types";
import {
    addAlbumToGallery,
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
    ResetSelectionAction, SelectAlbumAction,
    SelectCellIn3DAction,
    SelectPointAction,
} from "../../state/selection/types";
import {
    Album,
    State,
    Thumbnail,
} from "../../state/types";

import { getThumbnails } from "./selectors";

const Search = Input.Search;
const FormItem = Form.Item;

const styles = require("./style.css");

interface ThumbnailGalleryProps {
    albumData: Album[];
    clickedPoints: number[];
    data: Thumbnail[];
    ids: string[];
    getAlbumData: ActionCreator<RequestAction>;
    selectedCell: number;
    addSearchedCell: ActionCreator<SelectPointAction>;
    handleClearAllSelectedPoints: ActionCreator<ResetSelectionAction>;
    handleSelectAlbum: ActionCreator<SelectAlbumAction>;
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

    public componentDidMount() {
        const { getAlbumData } = this.props;
        getAlbumData();
    }

    public componentDidUpdate() {
        const endOfGallery = document.querySelector("#end-of-gallery");
        if (endOfGallery) {
            endOfGallery.scrollIntoView({
                behavior: "smooth",
            });
        }
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

    public getAlbum(id: number) {
        const {
            albumData,
            handleSelectAlbum,
        } = this.props;
        const album = find(albumData, {album_id: id});
        if (album) {
            handleSelectAlbum(album.cell_ids);
        }
    }

    // This is a placeholder to get the functionally in, but not what the final UI will be
    // TODO: create UI based on design
    public renderAlbumButtons() {
        const {
            albumData,
        } = this.props;
        return map(albumData, (album) => {
            const handleClick = () => {
                this.getAlbum(album.album_id);
            };
            return (album.cell_ids.length > 0 &&
                (
                    <Button
                        key={album.album_id}
                        onClick={handleClick}
                    >
                        {album.title}
                    </Button>
                )
            );

        });
    }

    public render() {
        const {
            data,
            handleClearAllSelectedPoints,
        } = this.props;
        return (
            <div id="gallery" className={styles.container}>
                <h2 className={styles.galleryTitle}><Icon type="picture"/>  Gallery</h2>

                <section className={styles.galleryHeader}>
                        <FormItem
                            hasFeedback={true}
                            className={styles.searchForCell}
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
                    footer={<div id="end-of-gallery" />}
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
        albumData: getAllAlbumData(state),
        clickedPoints: getClickedScatterPoints(state),
        data: getThumbnails(state),
        ids: getIds(state),
        selectedCell: getSelected3DCell(state),
    };
}

const dispatchToPropsMap = {
    addSearchedCell: selectPoint,
    getAlbumData: requestAlbumData,
    handleClearAllSelectedPoints: clearAllSelectedPoints,
    handleDeselectPoint: deselectPoint,
    handleOpenIn3D: selectCellFor3DViewer,
    handleSelectAlbum: addAlbumToGallery,
    setHovered: setHoveredGalleryCard,
};

export default connect(mapStateToProps, dispatchToPropsMap)(ThumbnailGallery);

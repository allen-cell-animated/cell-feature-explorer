# Cell Feature Explorer — Data Flow

This document describes how data moves through the Cell Feature Explorer application, from external sources to the rendered UI. It is intended to help new developers orient themselves in the codebase and to serve as a reference after a period of inactivity on the project.

---

## High-Level Overview

```
┌────────────────────────────────────────────────────────────────────┐
│                        DATA SOURCES                                │
│                                                                    │
│   Firebase (production)   JSON files (internal)   CSV (upload)    │
└───────────────────┬────────────────┬──────────────────┬───────────┘
                    │                │                  │
                    └────────────────┴──────────────────┘
                                     │
                          ┌──────────▼──────────┐
                          │   ImageDataset API  │  (pluggable abstraction)
                          │  FirebaseRequest /  │
                          │  JsonRequest /      │
                          │  CsvRequest         │
                          └──────────┬──────────┘
                                     │
                          ┌──────────▼──────────┐
                          │   Redux-Logic        │  (async middleware)
                          │   (side effects,     │
                          │    AJAX calls)       │
                          └──────────┬──────────┘
                                     │
                    ┌────────────────▼────────────────┐
                    │           Redux Store            │
                    │  ┌──────────┐  ┌─────────────┐  │
                    │  │ metadata │  │  selection  │  │
                    │  └──────────┘  └─────────────┘  │
                    │  ┌──────────────────────────┐   │
                    │  │      imageDataset        │   │
                    │  └──────────────────────────┘   │
                    └────────────────┬────────────────┘
                                     │  (selectors)
                    ┌────────────────▼────────────────┐
                    │   Containers (smart components)  │
                    │    App / Cfe / MainPlot /        │
                    │    ThumbnailGallery              │
                    └────────────────┬────────────────┘
                                     │  (props)
                    ┌────────────────▼────────────────┐
                    │   Components (presentational)    │
                    │    MainPlot / CellViewer /       │
                    │    ThumbnailGallery /            │
                    │    FeatureSelectDropdown / …     │
                    └─────────────────────────────────┘
```

---

## Data Sources

The app supports three interchangeable backends, all behind the `ImageDataset` interface (`src/state/image-dataset/`):

| Implementation | Class | When used |
|---|---|---|
| **Firebase** | `FirebaseRequest` | Production — reads from Firestore collections `dataset-descriptions` and `cfe-datasets` |
| **JSON** | `JsonRequest` | Internal/local — reads from a `datasets.json` index, then per-dataset JSON files over HTTP |
| **CSV upload** | `CsvRequest` | User-supplied — parses an uploaded CSV where rows are cells and columns are features |

The active implementation is stored in the `imageDataset` Redux branch and is swapped out transparently when the user changes data source.

---

## Redux Store Layout

The store (`src/state/configure-store.ts`) has three branches:

### `metadata` branch

Holds all data returned from the backend after a dataset is loaded.

| Key | Type | Description |
|---|---|---|
| `measuredFeaturesDefs` | `MeasuredFeatureDef[]` | Definitions (name, unit, discrete options) for every plottable feature |
| `featureData` | `DataForPlot` | Actual feature values and cell IDs for the loaded dataset |
| `cellFileInfo` | `FileInfo[]` | File paths (thumbnail, volume viewer) for currently-selected cells |
| `albums` | `Album[]` | Curated collections of cells |
| `availableDatasets` | `Megaset[]` | List of dataset collections available for selection |
| `isLoading` | `boolean` | Whether a data fetch is in progress |
| `loadingText` | `string` | Loading message shown in the UI |

### `selection` branch

Tracks everything the user has actively chosen.

| Key | Type | Description |
|---|---|---|
| `plotByOnX` / `plotByOnY` | `string` | Feature keys chosen for the X and Y plot axes |
| `colorBy` | `string` | Feature key used to color plot points |
| `groupBy` | `string` | Feature key used to group/facet points |
| `selectedPoints` | `number[]` | Cell IDs of cells selected in the plot |
| `hoveredPointData` | `object` | Data for the cell the user is currently hovering over |
| `cellSelectedFor3DViewer` | `number` | Cell ID loaded in the 3D viewer |
| `dataset` | `string` | ID of the currently loaded dataset |
| `selectedAlbum` | `string` | ID of the currently active album |

### `imageDataset` branch

Holds the active `ImageDataset` instance so that logics can call backend methods without knowing which implementation is in use.

---

## Redux-Logic Middleware (Async Layer)

All network calls and complex side effects live in *logics* (`src/state/*/logics.ts`), never in reducers or components.

### Startup sequence

```
App mounts
    │
    ▼
SYNC_STATE_WITH_URL  ──► Parses URL query params
    │                     Maps them to Redux actions
    │                     (dataset, axes, selected cells, color-by, etc.)
    ▼
REQUEST_AVAILABLE_DATASETS
    │   imageDataset.getAvailableDatasets()
    ▼
receiveAvailableDatasets  ──► metadata reducer stores Megaset[]
    │
    ▼
CHANGE_DATASET  (triggered by URL sync or user click)
    │   imageDataset.selectDataset(manifest)
    │   Fetches feature keys, resets axes if needed
    ▼
REQUEST_FEATURE_DATA
    │   imageDataset.getMeasuredFeatureDefs()  ──► MeasuredFeatureDef[]
    │   imageDataset.getFeatureData()          ──► DataForPlot
    ▼
receiveMeasuredFeatureDefs + receiveDataForPlot
    │   Stored in metadata branch
    ▼
Plot renders
```

### User interactions

| User action | Action dispatched | Logic triggered | State updated |
|---|---|---|---|
| Changes X or Y axis | `changeAxis` | — | `selection.plotByOnX/Y` |
| Changes color-by | `changeColorBy` | — | `selection.colorBy` |
| Clicks a cell in the plot | `selectPoint` | `SELECT_POINT` → `getFileInfoByCellId()` | `metadata.cellFileInfo`, `selection.selectedPoints` |
| Lasso-selects cells | `lassoOrBoxSelectGroup` | `SELECT_ARRAY_OF_POINTS` → `getFileInfoByArrayOfCellIds()` | `metadata.cellFileInfo`, `selection.selectedPoints` |
| Opens an album | `changeSelectedAlbum` | `CHANGE_SELECTED_ALBUM` → `getFileInfoByArrayOfCellIds()` | `metadata.cellFileInfo` |
| Selects a cell for 3D | `selectCellFor3DViewer` | — | `selection.cellSelectedFor3DViewer` |
| Switches dataset | `changeDataset` | `CHANGE_DATASET` → full reload | all metadata keys |
| Uploads a CSV | `setCsvUrl` | `LOAD_CSV_DATASET` → parse CSV | `imageDataset`, triggers full reload |

---

## Key Data Types

```
DataForPlot {
    indices: number[]               // ordered list of all cell indices
    values: { [featureKey]: any[] } // feature value per cell, keyed by feature
    labels: {
        cellIds: string[]
        thumbnailPaths: string[]
    }
}

MeasuredFeatureDef (union):
    ContinuousMeasuredFeatureDef {
        key: string
        displayName: string
        unit?: string
        description: string
        tooltip: string
    }
    DiscreteMeasuredFeatureDef {
        key: string
        displayName: string
        options: { [index]: { name: string, color: string, count: number } }
    }

FileInfo {
    CellId: number
    FOVId: number
    thumbnailPath: string
    volumeViewerPath: string
    fovThumbnailPath?: string
    fovVolumeViewerPath?: string
    transform?: { translation, rotation }
    // ...additional feature values
}

Megaset {
    name: string
    description: string
    datasets: DatasetMetaData[]
    production: boolean
    dateCreated: string
}
```

---

## URL State Synchronisation

`src/util/UrlState.ts` keeps the browser URL in sync with the Redux store so that application state is fully shareable via link.

- **URL → Redux**: On load, `SYNC_STATE_WITH_URL` reads query parameters and dispatches the corresponding actions (e.g., `?dataset=hipsc_4i` dispatches `changeDataset("hipsc_4i")`).
- **Redux → URL**: After each state change, relevant selection values are serialised back to query parameters.

Tracked parameters: `dataset`, `plotByX`, `plotByY`, `colorBy`, `groupBy`, `selectedPoint`, `cellSelectedFor3D`, `selectedAlbum`, `galleryCollapsed`, `csvUrl`.

---

## Component Hierarchy

```
index.tsx  (Redux Provider)
└── App  (routing, URL sync on mount)
    └── Cfe  (main layout container)
        ├── [Tab: Plot]
        │   ├── MainPlotContainer  ──► MainPlot (Plotly scatter plot)
        │   ├── FeatureSelectDropdown  (X axis, Y axis, color-by)
        │   ├── ColorLegend / InteractiveLegend
        │   └── DatasetSelector / MegasetCard / DatasetCard
        ├── [Tab: 3D Viewer]
        │   └── CellViewer  (@aics/vole-app volume renderer)
        └── [Sidebar]
            └── ThumbnailGallery  (selected cell thumbnails)
```

**Containers** (`src/containers/`) connect to the Redux store via `mapStateToProps` and `mapDispatchToProps`. They pass data and callbacks down to **components** (`src/components/`) which are purely presentational and have no direct store access.

---

## Source File Map

| Concern | Location |
|---|---|
| Store creation | `src/state/configure-store.ts` |
| Redux branches | `src/state/metadata/`, `src/state/selection/`, `src/state/image-dataset/` |
| Firebase backend | `src/state/image-dataset/firebase/` |
| JSON backend | `src/state/image-dataset/json-dataset/` |
| CSV backend | `src/state/image-dataset/csv-dataset/` |
| URL sync utility | `src/util/UrlState.ts` |
| Main layout container | `src/containers/Cfe/` |
| Plot container | `src/containers/MainPlotContainer/` |
| Gallery container | `src/containers/ThumbnailGallery/` |
| Plotly wrapper component | `src/components/MainPlot/` |
| 3D viewer component | `src/components/CellViewer/` |
| Feature axis dropdowns | `src/components/FeatureSelectDropdown/` |
| State README | `src/state/README.md` |
| Component README | `src/components/README.md` |
| Container README | `src/containers/README.md` |

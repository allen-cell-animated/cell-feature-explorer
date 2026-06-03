# Spike Lines Styling Design

**Date:** 2026-05-28 (revised after visual verification)
**Branch:** copilot/display-x-and-y-values

## Problem

When hovering over a data point on the scatter plot, it is hard to read the precise x and y values. Plotly spike lines were added to address this, but two issues were discovered during visual verification:

1. **White background on spike lines**: Plotly renders a white mask/halo behind spike lines when `plot_bgcolor` is transparent (`rgba(0,0,0,0)`). This makes the dotted lines look like a solid white band on the dark background.
2. **No axis value labels**: Plotly only shows value labels at the spike/axis intersection in `hovermode: "x"`, `"y"`, `"x unified"`, or `"y unified"`. This app uses `hovermode: "closest"`, so those labels never appear.

## Scope

- Only activates when hovering over a data point (not on free cursor movement)
- Affects the main scatter plot axes only (`xaxis`, `yaxis` in `makeAxis()`)
- The histogram sub-axes (`histogramAxis`) are unaffected

## Design

### 1. Fix spike line white background (`MainPlot/index.tsx`)

Change `plot_bgcolor` to black.

### 2. Show x/y values in the hover popup

Since Plotly's axis spike labels don't appear in `hovermode: "closest"`, add the x/y values to the existing `PopoverCard` hover popup instead.

#### `src/state/selection/types.ts`

Add optional fields to `SelectedPointData`:

```ts
export interface SelectedPointData {
    [CELL_ID_KEY]: string;
    index: number;
    thumbnailPath: string;
    srcPath: string;
    groupBy?: string;
    xValue?: number;
    yValue?: number;
}
```

#### `src/containers/MainPlotContainer/index.tsx`

In `onPointHovered`, extract `point.x` and `point.y` from the Plotly event and include them in the `changeHoveredPoint` dispatch:

```ts
changeHoveredPoint({
    [CELL_ID_KEY]: point.id,
    index: point.customdata.index,
    thumbnailPath: point.customdata.thumbnailPath,
    srcPath: point.customdata.srcPath,
    xValue: point.x as number,
    yValue: point.y as number,
});
```

In `renderPopover`, format the values and pass them to `PopoverCard` with axis feature name labels:

- For numerical axes: format to 4 significant figures using `Number(value).toPrecision(4)`
- For categorical axes: look up the display label from `xTickConversion`/`yTickConversion`
- Labels come from `xDropDownValue` / `yDropDownValue` (already in props)

#### `src/components/PopoverCard/index.tsx`

Add optional x/y props and display them below the existing cell info:

```ts
export interface PopoverCardProps {
    description: string;
    title: string;
    src?: string;
    xLabel?: string;
    xValue?: string;
    yLabel?: string;
    yValue?: string;
}
```

Display as a small table or label/value pairs beneath the `Meta` section when values are present.

### 3. Spike line color (already done)

`GENERAL_PLOT_SETTINGS.spikeColor` is set to `PALETTE.translucentWhite` (`#ffffffab`) to match the dark theme.

### 4. Hover label styling (already done)

`hoverlabel` was added to the layout in Task 2 using `PALETTE.darkGray`, `PALETTE.headerGray`, and `GENERAL_PLOT_SETTINGS.textColor`. This styles the Plotly point tooltip and remains correct.

## Files Changed

| File                                         | Change                                                        |
| -------------------------------------------- | ------------------------------------------------------------- |
| `src/constants/index.ts`                     | `spikeColor` updated (done)                                   |
| `src/components/MainPlot/index.tsx`          | Fix `plot_bgcolor`; spike/hoverlabel styling (partially done) |
| `src/state/selection/types.ts`               | Add `xValue`, `yValue` to `SelectedPointData`                 |
| `src/containers/MainPlotContainer/index.tsx` | Extract x/y in hover handler; format and pass to PopoverCard  |
| `src/components/PopoverCard/index.tsx`       | Add x/y display                                               |

## Non-goals

- Showing spike lines when hovering empty plot space (only on data points)
- Axis value labels drawn on the axis line (not achievable with `hovermode: "closest"`)
- Custom `hovertemplate` text on Plotly's trace tooltip

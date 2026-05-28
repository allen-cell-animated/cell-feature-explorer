# Spike Lines Styling Design

**Date:** 2026-05-28
**Branch:** copilot/display-x-and-y-values

## Problem

When hovering over a data point on the scatter plot, it is hard to read the precise x and y values. Plotly spike lines were added to address this, but the current `spikeColor` (`OFF_COLOR = "#000"`) is invisible against the dark plot background, making the feature non-functional in practice. Once the color is fixed, Plotly's hover label box at the axis will also become visible — and it needs to be styled to match the app's dark theme.

## Scope

- Only activates when hovering over a data point (not on free cursor movement)
- Affects the main scatter plot axes only (`xaxis`, `yaxis` in `makeAxis()`)
- The histogram sub-axes (`histogramAxis`) are unaffected — they do not use `makeAxis()`

## Design

### 1. Spike line color (`constants/index.ts`)

Update `GENERAL_PLOT_SETTINGS.spikeColor` from `OFF_COLOR` (`"#000"`) to `"rgba(255,255,255,0.25)"` — a semi-transparent white that is visible but subtle against the dark background.

```ts
spikeColor: "rgba(255,255,255,0.25)",
```

No other spike properties need to change (`spikethickness: 2`, `spikedash: "dot"`, `spikemode: "toaxis+marker"` are already reasonable).

### 2. Hover label styling (`MainPlot/index.tsx`)

Add a `hoverlabel` property to the layout object in the constructor's initial state using existing palette constants. The `componentDidUpdate` setState spreads `...this.state.layout`, so `hoverlabel` is preserved automatically on re-renders:

```ts
hoverlabel: {
    bgcolor: PALETTE.darkGray,
    bordercolor: PALETTE.headerGray,
    font: { color: GENERAL_PLOT_SETTINGS.textColor },
},
```

`PALETTE` must be imported from `../../constants` alongside the existing `GENERAL_PLOT_SETTINGS` import.

## Files Changed

| File | Change |
|------|--------|
| `src/constants/index.ts` | Update `spikeColor` value |
| `src/components/MainPlot/index.tsx` | Add `hoverlabel` to layout; import `PALETTE` |

## Non-goals

- Styling the Plotly point hover tooltip (the floating box near the cursor) — that is a separate concern handled by the existing `PopoverCard`/`MouseFollower` system
- Free-cursor crosshair (values only on data point hover)
- Custom `hovertemplate` text formatting

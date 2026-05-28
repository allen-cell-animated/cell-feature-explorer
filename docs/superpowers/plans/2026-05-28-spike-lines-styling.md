# Spike Lines Styling Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make Plotly spike lines visible on hover and style them (along with the axis hover label) to match the app's dark theme.

**Architecture:** Two targeted constant/config changes — update `spikeColor` in `GENERAL_PLOT_SETTINGS` to a visible semi-transparent white, then wire up `hoverlabel` in the plot layout using existing palette constants. No new files, no structural changes.

**Tech Stack:** React, Plotly / react-plotly.js, TypeScript

---

## File Map

| File | Change |
|------|--------|
| `src/constants/index.ts` | Change `spikeColor` from `OFF_COLOR` to `"rgba(255,255,255,0.25)"` |
| `src/components/MainPlot/index.tsx` | Import `PALETTE`; use `GENERAL_PLOT_SETTINGS.spikeColor` for spike color; add `hoverlabel` to layout; remove `"toggleSpikelines"` from mode bar |

---

### Task 1: Fix spike line color constant

**Files:**
- Modify: `src/constants/index.ts:73`

The current value `OFF_COLOR` (`"#000"`) is black — invisible against the dark plot background. Replace it with a semi-transparent white.

- [ ] **Step 1: Update `spikeColor` in `GENERAL_PLOT_SETTINGS`**

In `src/constants/index.ts`, change line 73:

```ts
// before
spikeColor: OFF_COLOR,

// after
spikeColor: "rgba(255,255,255,0.25)",
```

- [ ] **Step 2: Run TypeScript check**

```bash
npx tsc --noEmit
```

Expected: same errors as baseline (two pre-existing errors in `csv-dataset/index.ts` and its test file — these are not from our change). No new errors.

- [ ] **Step 3: Commit**

```bash
git add src/constants/index.ts
git commit -m "fix: make spike line color visible on dark background"
```

---

### Task 2: Wire up spike color constant and add hover label styling in MainPlot

**Files:**
- Modify: `src/components/MainPlot/index.tsx:12,54-66,104-121,123-136`

Four changes in one file:
1. Import `PALETTE` so we can use its dark-theme colors for `hoverlabel`
2. Use `GENERAL_PLOT_SETTINGS.spikeColor` instead of the hardcoded `"#4b4b4b2c"` so the constant from Task 1 is actually applied
3. Remove `"toggleSpikelines"` from the mode bar — since spikes are always on, the toggle button is misleading
4. Add `hoverlabel` to the layout so the axis value label box uses the app's dark theme colors

- [ ] **Step 1: Update the import on line 12**

```ts
// before
import { GENERAL_PLOT_SETTINGS } from "../../constants";

// after
import { GENERAL_PLOT_SETTINGS, PALETTE } from "../../constants";
```

- [ ] **Step 2: Remove `"toggleSpikelines"` from `PLOT_CONFIG` (lines 54–66)**

```ts
const PLOT_CONFIG: Partial<Config> = {
    responsive: true,
    displayModeBar: true,
    displaylogo: false,
    modeBarButtonsToRemove: [
        "sendDataToCloud",
        "toImage",
        "resetScale2d",
        "hoverClosestCartesian",
        "hoverCompareCartesian",
    ],
};
```

- [ ] **Step 3: Use the constant for `spikecolor` in `makeAxis` (line 111)**

Inside the `useMemo`, in the `makeAxis` arrow function:

```ts
const makeAxis = (type: AxisType, tickConversion: any, range?: [number, number]) => ({
    color: GENERAL_PLOT_SETTINGS.textColor,
    domain: [0, 0.85],
    hoverformat: ".1f",
    linecolor: GENERAL_PLOT_SETTINGS.textColor,
    showgrid: false,
    showspikes: true,
    spikecolor: GENERAL_PLOT_SETTINGS.spikeColor,
    spikethickness: 2,
    spikedash: "dot",
    spikemode: "toaxis+marker" as const,
    tickcolor: GENERAL_PLOT_SETTINGS.textColor,
    tickmode: type,
    ticktext: tickConversion.tickText,
    tickvals: tickConversion.tickValues,
    zeroline: false,
    range,
});
```

- [ ] **Step 4: Add `hoverlabel` to the layout return object (after line 135)**

In the `useMemo` return, add `hoverlabel` alongside the other layout properties:

```ts
return {
    annotations: updatedAnnotations,
    autosize: true,
    height: height - GENERAL_PLOT_SETTINGS.heightMargin,
    hovermode: "closest",
    hoverlabel: {
        bgcolor: PALETTE.darkGray,
        bordercolor: PALETTE.headerGray,
        font: { color: GENERAL_PLOT_SETTINGS.textColor },
    },
    legend: GENERAL_PLOT_SETTINGS.legend,
    margin: GENERAL_PLOT_SETTINGS.margin,
    paper_bgcolor: GENERAL_PLOT_SETTINGS.backgroundColor,
    plot_bgcolor: GENERAL_PLOT_SETTINGS.backgroundColor,
    xaxis: makeAxis(xAxisType, xTickConversion, xAxisRange && padAxisRange(xAxisRange)),
    xaxis2: histogramAxis,
    yaxis: makeAxis(yAxisType, yTickConversion, yAxisRange && padAxisRange(yAxisRange)),
    yaxis2: histogramAxis,
};
```

- [ ] **Step 5: Run TypeScript check**

```bash
npx tsc --noEmit
```

Expected: same two pre-existing errors only — no new errors.

- [ ] **Step 6: Commit**

```bash
git add src/components/MainPlot/index.tsx
git commit -m "feat: style spike lines and hover label to match dark theme"
```

---

### Task 3: Visual verification

- [ ] **Step 1: Start the dev server**

```bash
npm run dev
```

Open the app in a browser (typically `http://localhost:3000`).

- [ ] **Step 2: Verify spike lines appear on hover**

Load any dataset, hover over a data point on the scatter plot. You should see:
- Two faint dotted white lines extending from the point to the x-axis and y-axis
- A small dark label box on each axis showing the numeric x and y values (background `#313131`, white text, `#4b4b4b` border)
- No spike lines when hovering over empty plot space

- [ ] **Step 3: Verify "toggle spike lines" button is gone from mode bar**

The Plotly toolbar at the top-right of the plot should not contain a spike lines toggle button.

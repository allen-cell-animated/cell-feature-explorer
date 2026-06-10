# Spike Lines Styling Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make Plotly spike lines visible on hover and show precise x/y values in the existing hover popup, all styled to match the app's dark theme.

**Architecture:** Fix `plot_bgcolor` so Plotly renders spike lines against a dark surface; add x/y values to `SelectedPointData` and surface them in `PopoverCard`. No new components.

**Tech Stack:** React, Plotly / react-plotly.js, TypeScript, Redux

---

## File Map

| File                                         | Change                                                                  |
| -------------------------------------------- | ----------------------------------------------------------------------- |
| `src/constants/index.ts`                     | `spikeColor` updated (DONE)                                             |
| `src/components/MainPlot/index.tsx`          | Fix `plot_bgcolor`; spike/hoverlabel styling (DONE except plot_bgcolor) |
| `src/state/selection/types.ts`               | Add `xValue`, `yValue` to `SelectedPointData`                           |
| `src/containers/MainPlotContainer/index.tsx` | Extract x/y in hover handler; format and pass to PopoverCard            |
| `src/components/PopoverCard/index.tsx`       | Add x/y display                                                         |

---

### Task 1: Fix spike line color constant ✅ DONE

---

### Task 2: Wire up spike color constant and add hover label styling in MainPlot ✅ DONE

---

### Task 3: Fix `plot_bgcolor` to eliminate white spike background

**Files:**
- Modify: `src/components/MainPlot/index.tsx`

Plotly renders a white mask behind spike lines when `plot_bgcolor` is transparent. Fix by setting it to `PALETTE.backgroundColor` (`#000`). The page background behind the plot is already this color, so visually nothing changes — Plotly just gets a dark surface to render against.

`PALETTE` is already imported in this file (from Task 2).

- [ ] **Step 1: Change `plot_bgcolor` in the layout `useMemo`**

Find the layout return object inside the `useMemo` and change:

- [ ] **Step 2: Run TypeScript check**

```bash
npx tsc --noEmit
```

Expected: same two pre-existing errors only.

- [ ] **Step 3: Commit**

```bash
git add src/components/MainPlot/index.tsx
git commit -m "fix: use dark plot background to prevent white spike line halo"
```

---

### Task 4: Add x/y values to hover popup

**Files:**
- Modify: `src/state/selection/types.ts`
- Modify: `src/containers/MainPlotContainer/index.tsx`
- Modify: `src/components/PopoverCard/index.tsx`

Three changes to show the hovered point's x and y values in the existing `PopoverCard`.

- [ ] **Step 1: Add `xValue` and `yValue` to `SelectedPointData` in `src/state/selection/types.ts`**

```ts
export interface SelectedPointData {
    [CELL_ID_KEY]: string;
    index: number;
    thumbnailPath: string;
    srcPath: string;
    groupBy?: string;
    xValue?: number | string;
    yValue?: number | string;
}
```

- [ ] **Step 2: Extract x/y in `onPointHovered` in `src/containers/MainPlotContainer/index.tsx`**

In the `onPointHovered` method, add `xValue` and `yValue` to the `changeHoveredPoint` call:

```ts
changeHoveredPoint({
    [CELL_ID_KEY]: point.id,
    index: point.customdata.index,
    thumbnailPath: point.customdata.thumbnailPath,
    srcPath: point.customdata.srcPath,
    xValue: point.x,
    yValue: point.y,
});
```

- [ ] **Step 3: Format and pass x/y values in `renderPopover` in `src/containers/MainPlotContainer/index.tsx`**

Add a helper at the top of `renderPopover` to format a value:

```ts
const formatAxisValue = (value: number | string | undefined): string => {
    if (value === undefined) return "";
    if (typeof value === "string") return value;
    return Number(value).toPrecision(4);
};
```

Then pass x/y to `PopoverCard`:

```ts
return (
    hoveredPointData &&
    galleryCollapsed && (
        <PopoverCard
            title={hoveredPointData[GROUP_BY_KEY] || ""}
            description={hoveredPointData[CELL_ID_KEY].toString()}
            src={thumbnailSrc}
            xLabel={xDropDownValue}
            xValue={formatAxisValue(hoveredPointData.xValue)}
            yLabel={yDropDownValue}
            yValue={formatAxisValue(hoveredPointData.yValue)}
        />
    )
);
```

Note: `xDropDownValue` and `yDropDownValue` are already in the component's props (destructured from `this.props` in the `render` method). Destructure them in `renderPopover` as well:

```ts
public renderPopover() {
    const { hoveredPointData, galleryCollapsed, thumbnailRoot, xDropDownValue, yDropDownValue } = this.props;
    // ... rest of method
```

- [ ] **Step 4: Add x/y props and display to `PopoverCard` in `src/components/PopoverCard/index.tsx`**

Update the interface:

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

Add the x/y display below `<Meta>` when values are present:

```tsx
return (
    <Card className={styles.container} cover={cover} variant="borderless">
        <Meta description={props.description} title={props.title} />
        {(props.xValue || props.yValue) && (
            <div className={styles.axisValues}>
                {props.xValue && (
                    <div className={styles.axisRow}>
                        <span className={styles.axisLabel}>{props.xLabel}</span>
                        <span className={styles.axisValue}>{props.xValue}</span>
                    </div>
                )}
                {props.yValue && (
                    <div className={styles.axisRow}>
                        <span className={styles.axisLabel}>{props.yLabel}</span>
                        <span className={styles.axisValue}>{props.yValue}</span>
                    </div>
                )}
            </div>
        )}
    </Card>
);
```

- [ ] **Step 5: Add CSS for x/y display in `src/components/PopoverCard/style.css`**

Inside the `#thumbnail-popover` block, add:

```css
.axisValues {
    padding: 4px 2px 2px;
    display: flex;
    flex-direction: column;
    gap: 2px;
}

.axisRow {
    display: flex;
    justify-content: space-between;
    gap: 6px;
    font-size: 9px;
    line-height: 1.3;
    color: var(--text-gray);
    overflow: hidden;
}

.axisLabel {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 54px;
}

.axisValue {
    white-space: nowrap;
    color: var(--off-white);
    flex-shrink: 0;
}
```

- [ ] **Step 6: Run TypeScript check**

```bash
npx tsc --noEmit
```

Expected: same two pre-existing errors only.

- [ ] **Step 7: Commit**

```bash
git add src/state/selection/types.ts src/containers/MainPlotContainer/index.tsx src/components/PopoverCard/index.tsx src/components/PopoverCard/style.css
git commit -m "feat: show x/y axis values in hover popup"
```

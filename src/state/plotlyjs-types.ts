import {
    Color,
    ColorBar,
    Dash,
    Datum,
    ErrorBar,
    Label,
    LayoutAxis,
    ScatterLine,
    ScatterMarkerLine,
    TypedArray
} from "plotly.js";

/**
 * These interfaces are based on attribute descriptions in
 * https://github.com/plotly/plotly.js/tree/9d6144304308fc3007f0facf2535d38ea3e9b26c/src/transforms
 */

export interface TransformStyle {
    target: number | string | number[] | string[];
    value: Partial<PlotData>;
}

export interface TransformAggregation {
    target: string;
    func?: "count" | "sum" | "avg" | "median" | "mode" | "rms" | "stddev" | "min" | "max" | "first" | "last";
    funcmode?: "sample" | "population";
    enabled?: boolean;
}

export interface Transform {
    type: "aggregate" | "filter" | "groupby" | "sort";
    enabled: boolean;
    target: number | string | number[] | string[];
    operation: string;
    aggregations: TransformAggregation[];
    preservegaps: boolean;
    groups: string | number[] | string[];
    nameformat: string;
    styles: TransformStyle[];
    value: any;
    order: "ascending" | "descending";
}

export interface PlotMarker {
    color: Color | Color[] | number | number[];
    colorscale: string | string[] | Array<Array<(string | number)>>;
    cauto: boolean;
    cmax: number;
    cmin: number;
    autocolorscale: boolean;
    reversescale: boolean;
    opacity: number | number[];
    size: number | number[];
    symbol: string | string[]; // Drawing.symbolList
    maxdisplayed: number;
    sizeref: number;
    sizemax: number;
    sizemin: number;
    sizemode: "diameter" | "area";
    showscale: boolean;
    line: Partial<ScatterMarkerLine>;
    width: number;
    colorbar: Partial<ColorBar>;
    gradient: {
        type: "radial" | "horizontal" | "vertical" | "none",
        color: Color,
        typesrc: any,
        colorsrc: any,
    };
}

export type DataTransform = Partial<Transform>;

export interface PlotData {
    type: "bar" | "histogram" | "pointcloud" | "scatter" | "scattergl" | "scatter3d" | "surface";
    x: Datum[] | Datum[][] | TypedArray;
    y: Datum[] | Datum[][] | TypedArray;
    z: Datum[] | Datum[][] | Datum[][][] | TypedArray;
    xy: Float32Array;
    error_x: ErrorBar;
    error_y: ErrorBar;
    xaxis: string;
    yaxis: string;
    text: string | string[];
    line: Partial<ScatterLine>;
    "line.color": Color;
    "line.width": number;
    "line.dash": Dash;
    "line.shape": "linear" | "spline" | "hv" | "vh" | "hvh" | "vhv";
    "line.smoothing": number;
    "line.simplify": boolean;
    marker: Partial<PlotMarker>;
    "marker.symbol": string | string[]; // Drawing.symbolList
    "marker.color": Color | Color[] | number | number[];
    "marker.opacity": number | number[];
    "marker.size": number | number[];
    "marker.maxdisplayed": number;
    "marker.sizeref": number;
    "marker.sizemax": number;
    "marker.sizemin": number;
    "marker.sizemode": "diameter" | "area";
    "marker.showscale": boolean;
    "marker.line": Partial<ScatterMarkerLine>;
    "marker.colorbar": {}; // TODO
    mode: "lines" | "markers" | "text" | "lines+markers" | "text+markers" | "text+lines" | "text+lines+markers" |
"none";
    hoveron: "points" | "fills";
    hoverinfo: "all" | "name" | "none" | "skip" | "text" |
        "x" | "x+text" | "x+name" |
        "x+y" | "x+y+text" | "x+y+name" |
        "x+y+z" | "x+y+z+text" | "x+y+z+name" |
        "y+x" | "y+x+text" | "y+x+name" |
        "y+z" | "y+z+text" | "y+z+name" |
        "y+x+z" | "y+x+z+text" | "y+x+z+name" |
        "z+x" | "z+x+text" | "z+x+name" |
        "z+y+x" | "z+y+x+text" | "z+y+x+name" |
        "z+x+y" | "z+x+y+text" | "z+x+y+name";
    hoverlabel: Partial<Label>;
    fill: "none" | "tozeroy" | "tozerox" | "tonexty" | "tonextx" | "toself" | "tonext";
    fillcolor: string;
    legendgroup: string;
    name: string;
    connectgaps: boolean;
    visible: boolean | "legendonly";
    transforms: DataTransform[];
    orientation: "v" | "h";
}

export interface PlotDatum {
    curveNumber: number;
    data: PlotData;
    id?: string;
    fullData: any;
    pointIndex: number;
    pointNumber: number;
    x: Datum;
    xaxis: LayoutAxis;
    y: Datum;
    yaxis: LayoutAxis;
}

export interface PlotMouseEvent {
    points: PlotDatum[];
    event: MouseEvent;
}

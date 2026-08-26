import {
  IgrCategoryChartModule,
  IgrPieChartModule,
} from "igniteui-react-charts";
import {
  IgrBulletGraphModule,
  IgrLinearGaugeModule,
  IgrRadialGaugeModule,
} from "igniteui-react-gauges";

/**
 * Charts, gauges and maps live in the older packages, which are not
 * auto-registering wrappers. A missing `register()` fails silently — the chart,
 * an axis or a series simply never appears — so all of them are registered here
 * once, at module scope, and every chart-bearing page imports from this file.
 */
IgrCategoryChartModule.register();
IgrPieChartModule.register();
IgrRadialGaugeModule.register();
IgrLinearGaugeModule.register();
IgrBulletGraphModule.register();

/**
 * The chart palette, as literal hex.
 *
 * `igniteui-react-charts` draws to canvas and cannot resolve CSS custom
 * properties, so these values duplicate the `--mt-*` tokens in `src/theme.css`.
 * Change one and change the other — including when the console changes variant,
 * since nothing here follows a CSS theme swap on its own.
 */

/**
 * Categorical slots, in fixed order. Assign 1..N in sequence, never cycle.
 *
 * Stepped for the white chart surface. Slots 3, 4 and 5 fall below 3:1 against
 * it, which is legal only because every chart in the console ships a legend and
 * a table view — keep both when adding one.
 */
export const SERIES = [
  "#2a78d6", // 1 blue
  "#eb6834", // 2 orange
  "#1baf7a", // 3 aqua
  "#eda100", // 4 yellow
  "#e87ba4", // 5 magenta
  "#008300", // 6 green
  "#4a3aa7", // 7 violet
  "#e34948", // 8 red
] as const;

/** Reserved status colours. Never used as a series. */
export const STATUS = {
  good: "#0ca30c",
  warning: "#fab219",
  serious: "#ec835a",
  critical: "#d03b3b",
} as const;

export const CHROME = {
  surface: "#ffffff",
  raised: "#f2f5fa",
  track: "#e3e8f0",
  inkPrimary: "#161b24",
  inkSecondary: "#444e5e",
  inkMuted: "#57616f",
  grid: "#e5e9f0",
  axis: "#aeb8c7",
  gold: "#7a5f17",
} as const;

/**
 * Recessive axes and hairline gridlines. A category axis gets no gridlines of
 * its own — the bars already mark the categories — so only the value axis
 * carries them.
 */
export const valueAxisTheme = {
  xAxisLabelTextColor: CHROME.inkMuted,
  yAxisLabelTextColor: CHROME.inkMuted,
  xAxisTitleTextColor: CHROME.inkSecondary,
  yAxisTitleTextColor: CHROME.inkSecondary,
  xAxisStroke: CHROME.axis,
  yAxisStroke: CHROME.axis,
  xAxisStrokeThickness: 1,
  yAxisStrokeThickness: 1,
  xAxisMajorStroke: "transparent",
  xAxisMajorStrokeThickness: 0,
  yAxisMajorStroke: CHROME.grid,
  yAxisMajorStrokeThickness: 1,
  xAxisTickStroke: CHROME.axis,
  xAxisTickStrokeThickness: 1,
  xAxisTickLength: 4,
  yAxisAbbreviateLargeNumbers: true,
} as const;

/** As above, mirrored for a bar chart, where the categories run down the y axis. */
export const categoryOnYAxisTheme = {
  ...valueAxisTheme,
  xAxisMajorStroke: CHROME.grid,
  xAxisMajorStrokeThickness: 1,
  yAxisMajorStroke: "transparent",
  yAxisMajorStrokeThickness: 0,
} as const;

/**
 * The hover layer. Shipped by default on every chart: a crosshair that snaps to
 * the data plus a tooltip. `Category` gathers every series into one tooltip,
 * which is what a reader comparing lines wants.
 */
export const crosshairHover = {
  toolTipType: "Category",
  crosshairsDisplayMode: "Vertical",
  crosshairsSnapToData: true,
  crosshairsLineVerticalStroke: CHROME.axis,
  crosshairsLineThickness: 1,
  crosshairsAnnotationEnabled: false,
  dataToolTipHeaderTextColor: CHROME.inkPrimary,
  dataToolTipLabelTextColor: CHROME.inkSecondary,
  dataToolTipValueTextColor: CHROME.inkPrimary,
  dataToolTipTitleTextColor: CHROME.inkPrimary,
  dataToolTipValueTextUseSeriesColors: false,
  dataToolTipGroupTextColor: CHROME.inkMuted,
} as const;

/** Per-mark hover, for bar and column charts where there is one mark to name. */
export const markHover = {
  toolTipType: "Item",
  crosshairsDisplayMode: "None",
  isItemHighlightingEnabled: true,
  dataToolTipHeaderTextColor: CHROME.inkPrimary,
  dataToolTipLabelTextColor: CHROME.inkSecondary,
  dataToolTipValueTextColor: CHROME.inkPrimary,
  dataToolTipValueTextUseSeriesColors: false,
} as const;

/**
 * Line marks: 2px stroke, markers at least 8px so they are hittable, and a
 * surface-coloured ring so overlapping points stay separable.
 */
/* Not `as const`: the chart props take mutable `string[]`, and a readonly tuple
 * from `as const` will not assign to it. */
export const lineMarks = {
  thickness: 2,
  markerTypes: "Circle",
  markerThickness: 2,
  markerOutlines: [CHROME.surface] as string[],
};

/**
 * Column marks: a 2px surface gap between adjacent fills, and a zero baseline.
 *
 * The zero baseline is not optional. Left to auto-range, the chart starts the
 * value axis near the smallest bar, and the bars then encode differences rather
 * than magnitudes — a column three times the height of its neighbour for a
 * fifteen per cent difference. Bar length only means something measured from
 * zero.
 */
export const barMarks = {
  outlines: [CHROME.surface] as string[],
  thickness: 2,
  yAxisMinimumValue: 0,
};

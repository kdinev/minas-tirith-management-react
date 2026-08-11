import { registerIconFromText } from "igniteui-react";

/**
 * The console's icon set, registered once into the `mt` collection.
 *
 * These are drawn here rather than pulled from a stock set so the whole console
 * shares one line weight and one metaphor family — a tower, a shield, an anvil,
 * a sheaf, a banner, an Eye.
 *
 * Two mechanical notes, both load-bearing:
 *
 * 1. `igc-icon` applies `svg { fill: currentcolor }` in its shadow root. That
 *    rule beats a `fill` presentation attribute on the `<svg>` element, so
 *    every child carries its own explicit `fill` / `stroke` instead of
 *    inheriting from the root. Stroked glyphs would otherwise fill solid.
 * 2. For the same reason nothing here relies on `fill-rule` to punch a hole;
 *    marks are drawn as strokes over an outlined frame.
 */
export const MT_ICONS = "mt";

const svg = (body: string): string =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">${body}</svg>`;

/** Outlined frame: no fill, hairline stroke. */
const frame = (d: string, width = 1.7): string =>
  `<path d="${d}" fill="none" stroke="currentColor" stroke-width="${width}" stroke-linejoin="round"/>`;

/** A drawn mark: rounded stroke, no fill. */
const mark = (d: string, width = 2): string =>
  `<path d="${d}" fill="none" stroke="currentColor" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round"/>`;

const ring = (cx: number, cy: number, r: number, width = 1.8): string =>
  `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="currentColor" stroke-width="${width}"/>`;

const dot = (cx: number, cy: number, r = 1.2): string =>
  `<circle cx="${cx}" cy="${cy}" r="${r}" fill="currentColor"/>`;

const icons: Record<string, string> = {
  /* ---- Sections ------------------------------------------------------- */

  // The White Tower: battlemented crown over a flaring shaft.
  tower: svg(
    frame(
      "M8 6.4H9.5V4h1.75v2.4h1.5V4h1.75v2.4H16v2.2l1 12.4H7l1-12.4z",
    ) + frame("M11 12.6h2v4.4h-2z", 1.4),
  ),

  // Garrisons.
  shield: svg(frame("M12 2.8 19.2 5.4v5.8c0 4.5-3 8.6-7.2 9.9-4.2-1.3-7.2-5.4-7.2-9.9V5.4L12 2.8Z")),

  // Chain of command: one box over three.
  command: svg(
    [
      [9.2, 2.6],
      [2.6, 17],
      [9.2, 17],
      [15.8, 17],
    ]
      .map(
        ([x, y]) =>
          `<rect x="${x}" y="${y}" width="5.6" height="4.4" rx="1" fill="none" stroke="currentColor" stroke-width="1.7"/>`,
      )
      .join("") + frame("M12 7v5.6M5.4 17v-4.4h13.2V17"),
  ),

  // Provisions: a sheaf of wheat.
  wheat: svg(
    mark("M12 21.4V9.8", 1.7) +
      frame("M12 2.6c1.4 1.3 2.1 2.7 2.1 4.3s-.7 3-2.1 4.3c-1.4-1.3-2.1-2.7-2.1-4.3s.7-3 2.1-4.3Z") +
      frame("M11.6 13.2c-1.7-.2-2.9-.9-3.7-2.1-.7-1.2-.8-2.6-.2-4.2 1.7.2 3 .9 3.7 2.1.7 1.2.8 2.6.2 4.2Z") +
      frame("M12.4 13.2c-.6-1.6-.5-3 .2-4.2.7-1.2 2-1.9 3.7-2.1.6 1.6.5 3-.2 4.2-.8 1.2-2 1.9-3.7 2.1Z") +
      frame("M11.6 18.6c-1.7-.2-2.9-.9-3.7-2.1-.7-1.2-.8-2.6-.2-4.2 1.7.2 3 .9 3.7 2.1.7 1.2.8 2.6.2 4.2Z") +
      frame("M12.4 18.6c-.6-1.6-.5-3 .2-4.2.7-1.2 2-1.9 3.7-2.1.6 1.6.5 3-.2 4.2-.8 1.2-2 1.9-3.7 2.1Z"),
  ),

  // Armoury: an anvil.
  anvil: svg(
    frame(
      "M2.8 7.4h9.6c3 0 5 1.6 6 4.8H21.2v2.2h-3.6l-1.8 2.8H8.4l-1.6-2.8H5.6c-1.2 0-2-.7-2.4-2l-.4-1.4V7.4Z",
      1.6,
    ) + frame("M8.6 17.2h6.8l1.8 4H6.8l1.8-4Z", 1.6),
  ),

  // Allies: a summoned banner.
  banner: svg(mark("M5.4 2.6v18.8", 1.7) + frame("M5.4 3.8h13.4l-2.9 4.3 2.9 4.3H5.4z")),

  // Mordor.
  eye: svg(
    frame(
      "M12 5.4c5 0 8.7 4 10 6.1a.9.9 0 0 1 0 1c-1.3 2.1-5 6.1-10 6.1S3.3 14.6 2 12.5a.9.9 0 0 1 0-1C3.3 9.4 7 5.4 12 5.4Z",
    ) + `<ellipse cx="12" cy="12" rx="2.3" ry="3.4" fill="currentColor"/>`,
  ),

  /* ---- Readiness ------------------------------------------------------
   * Four distinct silhouettes — ring+tick, triangle, ring+bar, octagon — so
   * the state survives being read in one colour, in print, or by a reader who
   * cannot separate the hues. */

  "status-ready": svg(ring(12, 12, 9) + mark("m7.9 12.3 2.9 2.9 5.3-6")),
  "status-strained": svg(
    frame("M12 3.4 21.8 20.6H2.2L12 3.4Z", 1.8) + mark("M12 9.6v4.6") + dot(12, 17.6),
  ),
  "status-depleted": svg(ring(12, 12, 9) + mark("M7.6 12h8.8")),
  "status-critical": svg(
    frame("M8.3 2.4h7.4l5.9 5.9v7.4l-5.9 5.9H8.3l-5.9-5.9V8.3l5.9-5.9Z", 1.8) +
      mark("M12 7.2v6.2") +
      dot(12, 16.8),
  ),

  /* ---- Trend ---------------------------------------------------------- */

  "trend-up": svg(mark("M12 19.4V4.6M6 10.8 12 4.6l6 6.2")),
  "trend-down": svg(mark("M12 4.6v14.8M6 13.2 12 19.4l6-6.2")),
  "trend-flat": svg(mark("M4.6 12h14.8M13.2 6 19.4 12l-6.2 6")),

  /* ---- Utility -------------------------------------------------------- */

  menu: svg(mark("M3.5 6.5h17M3.5 12h17M3.5 17.5h17")),
  close: svg(mark("M6 6l12 12M18 6 6 18")),
  clock: svg(ring(12, 12, 9) + mark("M12 6.8V12l4 2.4", 1.8)),
  people: svg(
    ring(9, 8, 3.4, 1.7) +
      mark("M2.6 20.4v-.9c0-2.8 2.9-5 6.4-5s6.4 2.2 6.4 5v.9", 1.7) +
      mark("M16.4 5.4a3 3 0 0 1 0 5.6M17.6 15c2.2.5 3.8 2.1 3.8 4.1v1.3", 1.7),
  ),
  "chevron-right": svg(mark("m9.6 5.4 6.6 6.6-6.6 6.6")),
  "chevron-down": svg(mark("m5.4 9.6 6.6 6.6 6.6-6.6")),
  search: svg(ring(10.6, 10.6, 6.6) + mark("m15.6 15.6 4.8 4.8")),
  scroll: svg(
    frame(
      "M5.4 2.8h11.2a1.8 1.8 0 0 1 1.8 1.8v14.8a1.8 1.8 0 0 1-1.8 1.8H5.4a1.8 1.8 0 0 1-1.8-1.8V4.6a1.8 1.8 0 0 1 1.8-1.8Z",
    ) + mark("M6.8 7.6h8.4M6.8 12h8.4M6.8 16.4h5", 1.6),
  ),
  flame: svg(
    frame(
      "M13 2.4c.4 3 2.1 4.3 3.7 5.9 1.6 1.6 2.5 3.5 2.5 5.7 0 4.1-3.2 7.6-7.2 7.6S4.8 18.1 4.8 14c0-2.8 1.4-4.7 3.1-6.4 1.6-1.6 2.9-3 2.9-5.2 1.1.7 1.9 1.8 2.2 3.3",
    ),
  ),
  "arrow-right": svg(mark("M4 12h15M13 6l6 6-6 6")),
  bow: svg(
    frame("M5.6 3.4c7.2 1.4 12.4 6.6 13.8 13.8", 1.8) +
      mark("M4.4 19.6 19.6 4.4M15.4 4.4h4.2v4.2", 1.8),
  ),
};

let registered = false;

/**
 * Registers the set. Safe to call repeatedly — module-scope guards would be
 * enough in the app, but tests mount components in isolation.
 */
export function registerCitadelIcons(): void {
  if (registered) return;
  for (const [name, text] of Object.entries(icons)) {
    registerIconFromText(name, text, MT_ICONS);
  }
  registered = true;
}

export type CitadelIconName = keyof typeof icons;

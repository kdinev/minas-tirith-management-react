import type { CSSProperties, ReactNode } from "react";
import { Link } from "react-router-dom";
import { IgrIcon } from "igniteui-react";
import {
  formatNumber,
  readinessMeta,
  severityMeta,
  trendMeta,
  type Readiness,
  type Severity,
  type StatusMeta,
  type Trend,
} from "../data";
import { MT_ICONS } from "./icons";
import styles from "./kit.module.css";

/* ------------------------------------------------------------------------- *
 * Icon
 * ------------------------------------------------------------------------- */

/** Every icon in the console comes from the one registered collection. */
export function Icon({
  name,
  className,
  slot,
}: {
  name: string;
  className?: string;
  /** Named slot of the parent Ignite UI component, when placed in one. */
  slot?: string;
}) {
  return (
    <IgrIcon
      name={name}
      collection={MT_ICONS}
      className={className}
      slot={slot}
      aria-hidden="true"
    />
  );
}

/* ------------------------------------------------------------------------- *
 * Page scaffolding
 * ------------------------------------------------------------------------- */

export function Page({ children }: { children: ReactNode }) {
  return <div className={styles.page}>{children}</div>;
}

export function PageHeader({
  eyebrow,
  icon,
  title,
  lede,
  actions,
}: {
  eyebrow: string;
  icon: string;
  title: string;
  lede: string;
  actions?: ReactNode;
}) {
  return (
    <header className={styles.pageHeader}>
      <div className={styles.pageHeading}>
        <p className={styles.eyebrow}>
          <Icon name={icon} />
          {eyebrow}
        </p>
        <h1 className={styles.pageTitle}>{title}</h1>
        <p className={styles.lede}>{lede}</p>
      </div>
      {actions ? <div className={styles.pageActions}>{actions}</div> : null}
    </header>
  );
}

/**
 * A titled surface. `flush` hands the whole body to a grid or chart that draws
 * its own padding; `note` prints a footnote strip under the body.
 */
export function Panel({
  title,
  subtitle,
  actions,
  note,
  flush,
  style,
  children,
}: {
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
  note?: ReactNode;
  flush?: boolean;
  style?: CSSProperties;
  children: ReactNode;
}) {
  return (
    <section className={styles.panel} style={style}>
      {title ? (
        <div className={styles.panelHead}>
          <div className={styles.panelTitles}>
            <h2 className={styles.panelTitle}>{title}</h2>
            {subtitle ? <p className={styles.panelSubtitle}>{subtitle}</p> : null}
          </div>
          {actions ? <div className={styles.panelActions}>{actions}</div> : null}
        </div>
      ) : null}
      <div className={flush ? `${styles.panelBody} ${styles.panelBodyFlush}` : styles.panelBody}>
        {children}
      </div>
      {note ? <p className={styles.panelNote}>{note}</p> : null}
    </section>
  );
}

/** A responsive row of panels. `cols` is a `grid-template-columns` value. */
export function Row({
  cols = "repeat(auto-fit, minmax(340px, 1fr))",
  children,
}: {
  cols?: string;
  children: ReactNode;
}) {
  return (
    <div className={styles.row} style={{ gridTemplateColumns: cols }}>
      {children}
    </div>
  );
}

export function Tiles({ children }: { children: ReactNode }) {
  return <div className={styles.tiles}>{children}</div>;
}

/* ------------------------------------------------------------------------- *
 * Figures
 * ------------------------------------------------------------------------- */

/**
 * A single number that is the answer to a question, with the question as its
 * label. No plot, so no hover layer — the caption carries the context.
 */
export function StatTile({
  label,
  icon,
  value,
  unit,
  caption,
  accent,
  status,
}: {
  label: string;
  icon?: string;
  value: string | number;
  unit?: string;
  caption?: ReactNode;
  /** Colour of the leading rule. Pass a reserved status colour only for state. */
  accent?: string;
  status?: Readiness;
}) {
  const meta = status ? readinessMeta[status] : undefined;
  const rule = accent ?? meta?.color;
  return (
    <article
      className={rule ? `${styles.tile} ${styles.tileAccent}` : styles.tile}
      style={rule ? ({ "--tile-accent": rule } as CSSProperties) : undefined}
    >
      <p className={styles.tileLabel}>
        {icon ? <Icon name={icon} /> : null}
        {label}
      </p>
      <p className={styles.tileValueRow}>
        <span className={styles.tileValue}>
          {typeof value === "number" ? formatNumber(value) : value}
        </span>
        {unit ? <span className={styles.tileUnit}>{unit}</span> : null}
      </p>
      {meta ? <StatusChip status={status!} /> : null}
      {caption ? <p className={styles.tileCaption}>{caption}</p> : null}
    </article>
  );
}

/** The headline number of a page or panel, with its reading spelled out. */
export function Hero({
  value,
  caption,
  color,
}: {
  value: string;
  caption: ReactNode;
  color?: string;
}) {
  return (
    <div className={styles.hero}>
      <p className={styles.heroValue} style={color ? { color } : undefined}>
        {value}
      </p>
      <p className={styles.heroCaption}>{caption}</p>
    </div>
  );
}

/* ------------------------------------------------------------------------- *
 * Status
 * ------------------------------------------------------------------------- */

function statusStyle(meta: StatusMeta): CSSProperties {
  return { "--status-color": meta.color } as CSSProperties;
}

/** Readiness as a pill: reserved colour, glyph and word together. */
export function StatusChip({ status, label }: { status: Readiness; label?: string }) {
  const meta = readinessMeta[status];
  return (
    <span className={styles.status} style={statusStyle(meta)}>
      <Icon name={meta.icon} />
      {label ?? meta.label}
    </span>
  );
}

/** Readiness without the pill, for use inside a dense table cell. */
export function StatusMark({ status, label }: { status: Readiness; label?: string }) {
  const meta = readinessMeta[status];
  return (
    <span className={styles.statusBare} style={statusStyle(meta)}>
      <Icon name={meta.icon} />
      {label ?? meta.label}
    </span>
  );
}

export function SeverityChip({ severity }: { severity: Severity }) {
  const meta = severityMeta[severity];
  return (
    <span className={styles.status} style={statusStyle(meta)}>
      <Icon name={meta.icon} />
      {meta.label}
    </span>
  );
}

/** A trend arrow with its word, never the arrow alone. */
export function TrendMark({ trend }: { trend: Trend }) {
  const meta = trendMeta[trend];
  return (
    <span className={styles.statusBare} style={{ "--status-color": "var(--mt-ink-2)" } as CSSProperties}>
      <Icon name={meta.icon} />
      {meta.label}
    </span>
  );
}

/* ------------------------------------------------------------------------- *
 * Meters
 * ------------------------------------------------------------------------- */

/**
 * A thin horizontal bar anchored to a baseline, with the value printed beside
 * the label — so the figure is readable whether or not the colour is.
 *
 * `target` draws a second thin mark where the requirement sits.
 */
export function Meter({
  label,
  value,
  max = 100,
  display,
  status,
  color,
  target,
  foot,
}: {
  label: string;
  value: number;
  max?: number;
  /** What to print as the value. Defaults to `value` of `max`. */
  display?: string;
  status?: Readiness;
  color?: string;
  target?: number;
  foot?: ReactNode;
}) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  const fill = color ?? (status ? readinessMeta[status].color : "var(--ig-primary-500)");
  const targetPct =
    target === undefined ? undefined : Math.max(0, Math.min(100, (target / max) * 100));
  return (
    <div className={styles.meter}>
      <p className={styles.meterHead}>
        <span className={styles.meterLabel}>{label}</span>
        <span className={styles.meterValue}>{display ?? `${formatNumber(value)}`}</span>
      </p>
      <div
        className={styles.meterTrack}
        role="meter"
        aria-label={label}
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuetext={display}
      >
        <span
          className={styles.meterFill}
          style={{ width: `${pct}%`, "--meter-color": fill } as CSSProperties}
        />
        {targetPct !== undefined ? (
          <span className={styles.meterTarget} style={{ insetInlineStart: `${targetPct}%` }} />
        ) : null}
      </div>
      {foot ? <p className={styles.meterFoot}>{foot}</p> : null}
    </div>
  );
}

/* ------------------------------------------------------------------------- *
 * Facts
 * ------------------------------------------------------------------------- */

export interface Fact {
  label: string;
  value: ReactNode;
}

export function Facts({ items }: { items: Fact[] }) {
  return (
    <dl className={styles.facts}>
      {items.map((f) => (
        <div key={f.label} className={styles.fact}>
          <dt className={styles.factLabel}>{f.label}</dt>
          <dd className={styles.factValue}>{f.value}</dd>
        </div>
      ))}
    </dl>
  );
}

/* ------------------------------------------------------------------------- *
 * Chart furniture
 * ------------------------------------------------------------------------- */

export interface LegendEntry {
  label: string;
  color: string;
}

/**
 * Present for every chart carrying two or more series, so identity never rests
 * on colour alone.
 */
export function Legend({ entries }: { entries: LegendEntry[] }) {
  return (
    <ul className={styles.legend}>
      {entries.map((e) => (
        <li key={e.label} className={styles.legendItem}>
          <span className={styles.legendSwatch} style={{ "--swatch": e.color } as CSSProperties} />
          {e.label}
        </li>
      ))}
    </ul>
  );
}

/**
 * Wraps a chart with its legend and caption. The `viz` child gets a real height
 * because charts, gauges and grids all size themselves from their parent.
 */
export function Figure({
  legend,
  caption,
  height,
  autoHeight,
  children,
}: {
  legend?: LegendEntry[];
  caption?: ReactNode;
  height?: number;
  autoHeight?: boolean;
  children: ReactNode;
}) {
  return (
    <figure className={styles.figure}>
      {legend?.length ? <Legend entries={legend} /> : null}
      <div
        className={autoHeight ? `${styles.viz} ${styles.vizAuto}` : styles.viz}
        style={height ? ({ "--viz-height": `${height}px` } as CSSProperties) : undefined}
      >
        {children}
      </div>
      {caption ? <figcaption className={styles.figureCaption}>{caption}</figcaption> : null}
    </figure>
  );
}

/* ------------------------------------------------------------------------- *
 * Data table — the relief channel behind every chart
 * ------------------------------------------------------------------------- */

export interface TableColumn<T> {
  key: string;
  header: string;
  numeric?: boolean;
  render: (row: T) => ReactNode;
}

export function DataTable<T>({
  caption,
  columns,
  rows,
  rowKey,
}: {
  caption?: string;
  columns: TableColumn<T>[];
  rows: T[];
  rowKey: (row: T, index: number) => string;
}) {
  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        {caption ? <caption>{caption}</caption> : null}
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c.key} scope="col" className={c.numeric ? styles.numeric : undefined}>
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={rowKey(row, i)}>
              {columns.map((c) => (
                <td key={c.key} className={c.numeric ? styles.numeric : undefined}>
                  {c.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ------------------------------------------------------------------------- *
 * Odds and ends
 * ------------------------------------------------------------------------- */

/* Pages that need a class from this module import `kit.module.css` directly —
 * re-exporting it from here would break Fast Refresh for every component in the
 * file. */

export function Empty({ icon = "scroll", children }: { icon?: string; children: ReactNode }) {
  return (
    <div className={styles.empty}>
      <Icon name={icon} />
      <p>{children}</p>
    </div>
  );
}

export function Prose({ children }: { children: ReactNode }) {
  return <p className={styles.prose}>{children}</p>;
}

/**
 * A navigation link dressed as an action. A real anchor rather than a button, so
 * it keeps middle-click, copy-link and the browser's own affordances.
 */
export function SectionLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link to={to} className={styles.linkButton}>
      {children}
      <Icon name="arrow-right" />
    </Link>
  );
}

export function Muted({ children }: { children: ReactNode }) {
  return <p className={styles.muted}>{children}</p>;
}

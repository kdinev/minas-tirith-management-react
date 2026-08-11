import { useDeferredValue, useMemo, useState } from "react";
import {
  IgrInput,
  IgrSelect,
  IgrSelectItem,
  type IgrComponentValueChangedEventArgs,
  type IgrSelectItemComponentEventArgs,
} from "igniteui-react";
import { IgrGridLite, IgrGridLiteColumn, type IgrCellContext } from "igniteui-react/grid-lite";
import { IgrCategoryChart } from "igniteui-react-charts";
import {
  armorySummary,
  armorySuppliers,
  bandScore,
  formatDays,
  formatNumber,
  magazineStock,
  outputByLocation,
  readinessMeta,
  smithingByWeek,
  smithingSeriesKeys,
  type ArmorySupplier,
  type Readiness,
} from "../data";
import {
  Empty,
  Figure,
  Meter,
  Page,
  PageHeader,
  Panel,
  Prose,
  Row,
  StatTile,
  StatusChip,
  StatusMark,
  Tiles,
} from "../ui/kit";
import { TableView } from "../ui/table-view";
import { SERIES, barMarks, crosshairHover, lineMarks, valueAxisTheme } from "../ui/charts";
import styles from "./pages.module.css";

/**
 * Output indexed to 100 at the first week.
 *
 * The four kinds differ by two orders of magnitude — four thousand arrow-shafts
 * a week against twenty engines — so their absolute figures cannot share one
 * axis, and a second axis would invent a relationship that is not in the data.
 * Indexing to a common base puts all four on one honest scale and answers the
 * actual question: which kinds are keeping up and which are falling away. The
 * absolute figures are in the table beneath.
 */
const smithingIndexed = smithingByWeek.map((week) => {
  const base = smithingByWeek[0];
  const row: Record<string, string | number> = { period: week.period };
  for (const key of smithingSeriesKeys) {
    row[key] = Math.round((week[key] / base[key]) * 100);
  }
  return row;
});

const strongCell = (ctx: IgrCellContext<ArmorySupplier>) => (
  <span className={styles.cellStrong}>{ctx.value as string}</span>
);

const numberCell = (ctx: IgrCellContext<ArmorySupplier>) => (
  <span className={styles.cellNumeric}>{formatNumber(ctx.value as number)}</span>
);

const supplyCell = (ctx: IgrCellContext<ArmorySupplier>) => {
  const pct = ctx.value as number;
  return (
    <span className={styles.cellNumeric} style={{ color: readinessMeta[bandScore(pct)].color }}>
      {pct}%
    </span>
  );
};

const readinessCell = (ctx: IgrCellContext<ArmorySupplier>) => (
  <StatusMark status={ctx.value as Readiness} />
);

const READINESS_ORDER: Readiness[] = ["critical", "depleted", "strained", "ready"];
const arrows = magazineStock[0];

export default function Armoury() {
  const [readiness, setReadiness] = useState<Readiness | "all">("all");
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);

  const shown = useMemo(() => {
    const needle = deferredQuery.trim().toLowerCase();
    return armorySuppliers.filter((s) => {
      if (readiness !== "all" && s.readiness !== readiness) return false;
      if (!needle) return true;
      return (
        s.name.toLowerCase().includes(needle) ||
        s.location.toLowerCase().includes(needle) ||
        s.specialty.toLowerCase().includes(needle)
      );
    });
  }, [readiness, deferredQuery]);

  const worstFirst = useMemo(
    () => [...shown].sort((a, b) => a.materialSupply - b.materialSupply),
    [shown],
  );

  return (
    <Page>
      <PageHeader
        eyebrow="Forges of the realm"
        icon="anvil"
        title="Armoury"
        lede="Eight forges, foundries and bowyers arm the City. For each: what it strikes, how many
          hands are at the anvils, what it could strike if fully supplied, and how much iron,
          charcoal and stave-wood it has left. Beneath them, what the magazines hold."
      />

      <Tiles>
        <StatTile
          label="Forge capacity in use"
          icon="anvil"
          value={armorySummary.utilisation}
          unit="%"
          status={bandScore(armorySummary.utilisation)}
          caption={`${formatNumber(armorySummary.weeklyOutput)} pieces struck last week of a possible ${formatNumber(
            armorySummary.capacity,
          )}.`}
        />
        <StatTile
          label="Smiths at the anvils"
          icon="people"
          value={armorySummary.smiths}
          unit="hands"
          accent={SERIES[0]}
          caption="Hands are not the want. Material is."
        />
        <StatTile
          label="Forges short of material"
          icon="status-critical"
          value={armorySummary.starved}
          unit={`of ${armorySummary.count}`}
          status="depleted"
          caption="Erech at 22 per cent and Pelargir at 34. Both feed the forges below the City."
        />
        <StatTile
          label="Arrows in the magazines"
          icon="bow"
          value={arrows.inStore}
          unit="shafts"
          status={bandScore(Math.round((arrows.inStore / arrows.required) * 100))}
          caption={`${Math.round(
            (arrows.inStore / arrows.required) * 100,
          )}% of the ${formatNumber(arrows.required)} the muster requires.`}
        />
        <StatTile
          label="Engines fit to serve"
          icon="anvil"
          value={magazineStock.at(-1)!.inStore}
          unit={`of ${magazineStock.at(-1)!.required}`}
          status={bandScore(
            Math.round((magazineStock.at(-1)!.inStore / magazineStock.at(-1)!.required) * 100),
          )}
          caption="Thirty-four upon the walls. Twenty-six more would be needed to answer theirs."
        />
        <StatTile
          label="Longest haul"
          icon="clock"
          value={13}
          unit="days"
          accent={SERIES[3]}
          caption="Anfalas. Leather enough there, and no way to bring it in time."
        />
      </Tiles>

      <Row cols="minmax(340px, 1.05fr) minmax(340px, 0.95fr)">
        <Panel
          title="Struck last week, by forge"
          subtitle="Finished pieces, wherever they were made"
          note="Morthond and the Gate Armoury between them account for four fifths of everything
            struck — and both make shafts, which are also what runs out fastest."
        >
          <Figure
            height={270}
            caption="One measure, so every bar takes the same hue. The forges have no natural order, so none is implied."
          >
            <IgrCategoryChart
              dataSource={outputByLocation}
              chartType="column"
              includedProperties={["period", "value"]}
              brushes={[SERIES[0]]}
              {...barMarks}
              yAxisTitle="Pieces struck"
              xAxisLabelAngle={-30}
              {...valueAxisTheme}
              {...crosshairHover}
            />
          </Figure>
          <TableView
            caption="Finished pieces struck in the last full week, by forge"
            columns={[
              { key: "forge", header: "Forge", render: (r) => r.period },
              {
                key: "value",
                header: "Pieces",
                numeric: true,
                render: (r) => formatNumber(r.value),
              },
            ]}
            rows={outputByLocation}
            rowKey={(r) => r.period}
          />
        </Panel>

        <Panel
          title="Smithing by kind, five weeks"
          subtitle="Indexed to 100 at the first week, so four kinds of very different size share one scale"
          note="Shafts are still rising because every idle hand in the City has been set to them.
            Mail and engines are falling away as iron from Erech ceases to arrive."
        >
          <Figure
            height={270}
            legend={smithingSeriesKeys.map((k, i) => ({ label: k, color: SERIES[i] }))}
            caption="An index, not a count: 100 is each kind's own output in Week 1. The absolute figures are below."
          >
            {/* No final-value annotations: the charts package draws them against
                the value axis, which is on the left, so they overlap its tick
                labels instead of sitting at the line ends. */}
            <IgrCategoryChart
              dataSource={smithingIndexed}
              chartType="line"
              includedProperties={["period", ...smithingSeriesKeys]}
              brushes={[SERIES[0], SERIES[1], SERIES[2], SERIES[3]]}
              markerBrushes={[SERIES[0], SERIES[1], SERIES[2], SERIES[3]]}
              {...lineMarks}
              yAxisTitle="Index (Week 1 = 100)"
              {...valueAxisTheme}
              {...crosshairHover}
            />
          </Figure>
          <TableView
            caption="Pieces struck each week, by kind — absolute figures"
            columns={[
              { key: "period", header: "Week", render: (r) => r.period },
              ...smithingSeriesKeys.map((k) => ({
                key: k,
                header: k,
                numeric: true,
                render: (r: (typeof smithingByWeek)[number]) => formatNumber(r[k]),
              })),
            ]}
            rows={smithingByWeek}
            rowKey={(r) => r.period}
          />
        </Panel>
      </Row>

      <Panel
        title="What the magazines hold against what the muster needs"
        subtitle="The pale mark on each bar is the requirement"
        note="Arrows are the binding shortage: a hundred and seventy-five thousand shafts short, and
          a siege spends them faster than any other thing in the list."
      >
        <div className={styles.factors}>
          {magazineStock.map((line) => {
            const met = Math.round((line.inStore / line.required) * 100);
            return (
              <div key={line.id} className={styles.factor}>
                <Meter
                  label={line.item}
                  value={line.inStore}
                  max={Math.max(line.required, line.inStore)}
                  target={line.required}
                  display={`${formatNumber(line.inStore)} / ${formatNumber(line.required)} ${line.unit}`}
                  status={bandScore(met)}
                  foot={`${met}% of requirement · ${formatNumber(
                    Math.max(0, line.required - line.inStore),
                  )} ${line.unit} short`}
                />
              </div>
            );
          })}
        </div>
        <TableView
          caption="Magazine stock against the requirement of the muster"
          columns={[
            { key: "item", header: "Item", render: (r) => r.item },
            {
              key: "inStore",
              header: "In store",
              numeric: true,
              render: (r) => formatNumber(r.inStore),
            },
            {
              key: "required",
              header: "Required",
              numeric: true,
              render: (r) => formatNumber(r.required),
            },
            {
              key: "met",
              header: "Met",
              numeric: true,
              render: (r) => `${Math.round((r.inStore / r.required) * 100)}%`,
            },
            { key: "unit", header: "Unit", render: (r) => r.unit },
          ]}
          rows={magazineStock}
          rowKey={(r) => r.id}
        />
      </Panel>

      {/* One filter row above the roll and the meters it scopes. */}
      <div className={styles.filters}>
        <div className={styles.filterField}>
          <IgrSelect
            label="Readiness"
            value={readiness}
            onChange={(e: IgrSelectItemComponentEventArgs) =>
              setReadiness(e.detail.value as Readiness | "all")
            }
          >
            <IgrSelectItem value="all">All forges</IgrSelectItem>
            {READINESS_ORDER.map((r) => (
              <IgrSelectItem key={r} value={r}>
                {readinessMeta[r].label}
              </IgrSelectItem>
            ))}
          </IgrSelect>
        </div>
        <div className={styles.filterField}>
          <IgrInput
            label="Search"
            placeholder="Forge, location or trade"
            value={query}
            onInput={(e: IgrComponentValueChangedEventArgs) => setQuery(e.detail)}
          />
        </div>
        <span className={styles.filterSpacer} />
        <p className={styles.filterCount}>
          Showing {shown.length} of {armorySuppliers.length} forges
        </p>
      </div>

      {shown.length === 0 ? (
        <Panel>
          <Empty icon="anvil">
            No forge answers to that description. Clear the filters to see them all.
          </Empty>
        </Panel>
      ) : (
        <>
          <Panel
            title="Smithing production by location"
            subtitle="Sort by output, by capacity, or by what material each has left"
            flush
          >
            <div className={styles.grid} style={{ "--grid-height": "480px" } as React.CSSProperties}>
              <IgrGridLite data={shown}>
                <IgrGridLiteColumn
                  field="name"
                  header="Forge"
                  dataType="string"
                  sortable
                  cellTemplate={strongCell}
                />
                <IgrGridLiteColumn field="location" header="Location" dataType="string" sortable />
                <IgrGridLiteColumn field="specialty" header="Strikes" dataType="string" sortable />
                <IgrGridLiteColumn field="smiths" header="Smiths" dataType="number" sortable />
                <IgrGridLiteColumn
                  field="weeklyOutput"
                  header="Struck / week"
                  dataType="number"
                  sortable
                  cellTemplate={numberCell}
                />
                <IgrGridLiteColumn
                  field="capacity"
                  header="Capacity"
                  dataType="number"
                  sortable
                  cellTemplate={numberCell}
                />
                <IgrGridLiteColumn
                  field="materialSupply"
                  header="Material"
                  dataType="number"
                  sortable
                  cellTemplate={supplyCell}
                />
                <IgrGridLiteColumn
                  field="readiness"
                  header="Readiness"
                  dataType="string"
                  sortable
                  cellTemplate={readinessCell}
                />
              </IgrGridLite>
            </div>
          </Panel>

          <Panel
            title="Each forge against its own capacity"
            subtitle="Worst-supplied first — the material figure is what limits the rest"
          >
            <div className={styles.rows}>
              {worstFirst.map((s) => (
                <article key={s.id} className={styles.rowLine}>
                  <div className={styles.rowName}>
                    <p className={styles.rowTitle}>{s.name}</p>
                    <p className={styles.rowMeta}>
                      {s.location} &middot; {s.specialty}
                    </p>
                  </div>
                  <StatusChip status={s.readiness} />
                  <Meter
                    label="Struck against capacity"
                    value={s.weeklyOutput}
                    max={s.capacity}
                    target={s.capacity}
                    display={`${formatNumber(s.weeklyOutput)} / ${formatNumber(s.capacity)}`}
                    color={SERIES[0]}
                    foot={`${s.smiths} smiths · ${Math.round(
                      (s.weeklyOutput / s.capacity) * 100,
                    )}% of capacity`}
                  />
                  <Meter
                    label="Material on hand"
                    value={s.materialSupply}
                    display={`${s.materialSupply}%`}
                    status={bandScore(s.materialSupply)}
                    foot={s.note}
                  />
                </article>
              ))}
            </div>
          </Panel>
        </>
      )}

      <Panel title="Notes from the Master of the Armoury">
        <Prose>
          Every forge but Erech and Pelargir could strike more than it does, and none of them lacks
          hands. What they lack is billets, charcoal and stave-wood, and all three come up the same
          roads that the Corsairs and the Enemy are now closing. Setting more smiths to the anvils
          will not answer it. Opening the road from Lamedon would.
        </Prose>
        <Prose>
          Of what stands in the magazines, only swords and shields are near enough to the requirement
          to be called sufficient. Should the siege last beyond a fortnight at the present rate of
          expenditure, the walls will be defended with stones and hot oil, of which the City has no
          shortage whatever &mdash; {formatDays(14)} being the Master&rsquo;s own reckoning, and he
          asks that it be recorded as his.
        </Prose>
      </Panel>
    </Page>
  );
}

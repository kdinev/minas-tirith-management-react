import { useDeferredValue, useMemo, useState } from "react";
import {
  IgrAccordion,
  IgrExpansionPanel,
  IgrInput,
  IgrSelect,
  IgrSelectItem,
  type IgrComponentValueChangedEventArgs,
  type IgrSelectItemComponentEventArgs,
} from "igniteui-react";
import { IgrGridLite, IgrGridLiteColumn, type IgrCellContext } from "igniteui-react/grid-lite";
import { IgrCategoryChart, IgrPieChart } from "igniteui-react-charts";
import {
  bandProvisionDays,
  bandScore,
  formatDays,
  formatNumber,
  garrisonSummary,
  garrisons,
  moraleHistory,
  readinessMeta,
  type Garrison,
  type Readiness,
} from "../data";
import {
  Empty,
  Facts,
  Figure,
  Meter,
  Page,
  PageHeader,
  Panel,
  Prose,
  Row,
  StatTile,
  StatusMark,
  Tiles,
  TrendMark,
} from "../ui/kit";
import { TableView } from "../ui/table-view";
import { CHROME, SERIES, STATUS, crosshairHover, lineMarks, valueAxisTheme } from "../ui/charts";
import styles from "./pages.module.css";

/* Cell templates are defined outside the component so the grid is not handed a
 * new function on every render. */

const strongCell = (ctx: IgrCellContext<Garrison>) => (
  <span className={styles.cellStrong}>{ctx.value as string}</span>
);

const numberCell = (ctx: IgrCellContext<Garrison>) => (
  <span className={styles.cellNumeric}>{formatNumber(ctx.value as number)}</span>
);

const scoreCell = (ctx: IgrCellContext<Garrison>) => {
  const score = ctx.value as number;
  return (
    <span className={styles.cellNumeric} style={{ color: readinessMeta[bandScore(score)].color }}>
      {score}
    </span>
  );
};

const victualCell = (ctx: IgrCellContext<Garrison>) => {
  const days = ctx.value as number;
  return (
    <span
      className={styles.cellNumeric}
      style={{ color: readinessMeta[bandProvisionDays(days)].color }}
    >
      {days}
    </span>
  );
};

const readinessCell = (ctx: IgrCellContext<Garrison>) => (
  <StatusMark status={ctx.value as Readiness} />
);

const reportAgeCell = (ctx: IgrCellContext<Garrison>) => {
  const days = ctx.value as number;
  return (
    <span className={styles.cellNumeric} style={days >= 2 ? { color: STATUS.serious } : undefined}>
      {days === 0 ? "Today" : formatDays(days)}
    </span>
  );
};

/** Arms of the whole command, for the composition chart. */
const armsBreakdown = [
  { arm: "Foot", men: garrisonSummary.infantry },
  { arm: "Archers", men: garrisonSummary.archers },
  { arm: "Horse", men: garrisonSummary.horse },
];

const READINESS_ORDER: Readiness[] = ["critical", "depleted", "strained", "ready"];

export default function Garrisons() {
  const [readiness, setReadiness] = useState<Readiness | "all">("all");
  const [query, setQuery] = useState("");
  // Typing stays responsive while the grid and charts re-render behind it.
  const deferredQuery = useDeferredValue(query);

  const shown = useMemo(() => {
    const needle = deferredQuery.trim().toLowerCase();
    return garrisons.filter((g) => {
      if (readiness !== "all" && g.readiness !== readiness) return false;
      if (!needle) return true;
      return (
        g.name.toLowerCase().includes(needle) ||
        g.commander.toLowerCase().includes(needle) ||
        g.station.toLowerCase().includes(needle)
      );
    });
  }, [readiness, deferredQuery]);

  const worstFirst = useMemo(
    () => [...shown].sort((a, b) => a.provisionDays - b.provisionDays || a.morale - b.morale),
    [shown],
  );

  return (
    <Page>
      <PageHeader
        eyebrow="Reports from the garrisons"
        icon="shield"
        title="Garrisons"
        lede="Eight fortified positions answer to the Citadel. For each: what it holds, how its men
          are armed, the spirit and the health of the roll, and how many days of victual stand in
          its store."
      />

      <Tiles>
        <StatTile
          label="Men under arms"
          icon="people"
          value={garrisonSummary.strength}
          unit="men"
          accent={SERIES[0]}
          caption={`${formatNumber(garrisonSummary.infantry)} foot, ${formatNumber(
            garrisonSummary.archers,
          )} archers, ${formatNumber(garrisonSummary.horse)} horse.`}
        />
        <StatTile
          label="Fit for duty"
          icon="people"
          value={garrisonSummary.health}
          unit="%"
          status={bandScore(garrisonSummary.health)}
          caption={`${formatNumber(
            garrisonSummary.wounded,
          )} men in the houses of healing or otherwise unfit.`}
        />
        <StatTile
          label="Spirit of the men"
          icon="shield"
          value={garrisonSummary.morale}
          unit="/ 100"
          status={bandScore(garrisonSummary.morale)}
          caption="Weighted by garrison strength. Falling in five of eight positions."
        />
        <StatTile
          label="Garrisons in crisis"
          icon="status-critical"
          value={garrisonSummary.critical}
          unit={`of ${garrisonSummary.count}`}
          status="critical"
          caption="Rammas Echor, the Causeway forts, Osgiliath and Cair Andros."
        />
        <StatTile
          label="Arrows in store"
          icon="bow"
          value={garrisonSummary.shafts}
          unit="shafts"
          accent={SERIES[3]}
          caption="Across every magazine from the Citadel to the Harlond."
        />
        <StatTile
          label="Reports gone stale"
          icon="clock"
          value={garrisonSummary.stale}
          unit={`of ${garrisonSummary.count}`}
          accent={STATUS.serious}
          caption="No rider in two days or more. Cair Andros is the worst at three."
        />
      </Tiles>

      {/* One filter row above everything it scopes — grid, roll and charts all
          read the same slice. */}
      <div className={styles.filters}>
        <div className={styles.filterField}>
          <IgrSelect
            label="Readiness"
            value={readiness}
            onChange={(e: IgrSelectItemComponentEventArgs) =>
              setReadiness(e.detail.value as Readiness | "all")
            }
          >
            <IgrSelectItem value="all">All garrisons</IgrSelectItem>
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
            placeholder="Garrison, station or captain"
            value={query}
            onInput={(e: IgrComponentValueChangedEventArgs) => setQuery(e.detail)}
          />
        </div>
        <span className={styles.filterSpacer} />
        <p className={styles.filterCount}>
          Showing {shown.length} of {garrisons.length} garrisons
        </p>
      </div>

      {shown.length === 0 ? (
        <Panel>
          <Empty icon="shield">
            No garrison answers to that description. Clear the filters to see the whole roll.
          </Empty>
        </Panel>
      ) : (
        <>
          <Panel
            title="The garrison roll"
            subtitle="Sort any column to read the roll another way. The filters above scope it."
            flush
          >
            <div className={styles.grid} style={{ "--grid-height": "540px" } as React.CSSProperties}>
              {/* Sorting only: the page's own filter row scopes the grid, the
                  charts and the reports together, so the grid's built-in filter
                  row would be a second, narrower control for the same job. */}
              <IgrGridLite data={shown}>
                <IgrGridLiteColumn
                  field="name"
                  header="Garrison"
                  dataType="string"
                  sortable
                  cellTemplate={strongCell}
                />
                <IgrGridLiteColumn field="commander" header="Captain" dataType="string" sortable />
                <IgrGridLiteColumn
                  field="strength"
                  header="Strength"
                  dataType="number"
                  sortable
                  cellTemplate={numberCell}
                />
                <IgrGridLiteColumn field="infantry" header="Foot" dataType="number" sortable />
                <IgrGridLiteColumn field="archers" header="Archers" dataType="number" sortable />
                <IgrGridLiteColumn field="horse" header="Horse" dataType="number" sortable />
                <IgrGridLiteColumn
                  field="morale"
                  header="Morale"
                  dataType="number"
                  sortable
                  cellTemplate={scoreCell}
                />
                <IgrGridLiteColumn
                  field="health"
                  header="Fit %"
                  dataType="number"
                  sortable
                  cellTemplate={scoreCell}
                />
                <IgrGridLiteColumn
                  field="wounded"
                  header="Wounded"
                  dataType="number"
                  sortable
                  cellTemplate={numberCell}
                />
                <IgrGridLiteColumn
                  field="provisionDays"
                  header="Victual (days)"
                  dataType="number"
                  sortable
                  cellTemplate={victualCell}
                />
                <IgrGridLiteColumn
                  field="shafts"
                  header="Shafts"
                  dataType="number"
                  sortable
                  cellTemplate={numberCell}
                />
                <IgrGridLiteColumn
                  field="readiness"
                  header="Readiness"
                  dataType="string"
                  sortable
                  cellTemplate={readinessCell}
                />
                <IgrGridLiteColumn
                  field="reportAgeDays"
                  header="Last report"
                  dataType="number"
                  sortable
                  cellTemplate={reportAgeCell}
                />
              </IgrGridLite>
            </div>
          </Panel>

          <Panel
            title="Morale, health and victual, worst first"
            subtitle="The three figures a captain is judged on, side by side"
            note="A garrison whose victual falls below ten days cannot be relieved in time from the
              City's own stores; it must be withdrawn or resupplied by road."
          >
            <div className={styles.garrisonRoll}>
              {worstFirst.map((g) => (
                <article key={g.id} className={styles.garrisonLine}>
                  <div className={styles.garrisonName}>
                    <p className={styles.garrisonTitle}>{g.name}</p>
                    <p className={styles.garrisonStation}>
                      {g.station} &middot; {g.commander}
                    </p>
                  </div>
                  <StatusMark status={g.readiness} />
                  <Meter
                    label="Morale"
                    value={g.morale}
                    display={`${g.morale} / 100`}
                    status={bandScore(g.morale)}
                  />
                  <Meter
                    label="Fit for duty"
                    value={g.health}
                    display={`${g.health}%`}
                    status={bandScore(g.health)}
                  />
                  <Meter
                    label="Victual"
                    value={g.provisionDays}
                    max={90}
                    display={formatDays(g.provisionDays)}
                    status={bandProvisionDays(g.provisionDays)}
                  />
                </article>
              ))}
            </div>
          </Panel>

          <Row cols="minmax(320px, 0.9fr) minmax(340px, 1.1fr)">
            <Panel
              title="How the command is armed"
              subtitle="Every man on the roll, by his arm"
            >
              <Figure
                height={230}
                legend={armsBreakdown.map((a, i) => ({ label: a.arm, color: SERIES[i] }))}
                caption="Part of a whole, at a glance. The exact figures are in the table."
              >
                {/* A 2px surface-coloured outline separates the slices rather
                    than a drawn border. */}
                <IgrPieChart
                  dataSource={armsBreakdown}
                  labelMemberPath="arm"
                  valueMemberPath="men"
                  brushes={[SERIES[0], SERIES[1], SERIES[2]]}
                  outlines={[CHROME.surface, CHROME.surface, CHROME.surface]}
                  labelsPosition="OutsideEnd"
                  labelExtent={14}
                  leaderLineType="Arc"
                  leaderLineVisibility="Visible"
                  labelOuterColor={CHROME.inkSecondary}
                  radiusFactor={0.8}
                  startAngle={-90}
                />
              </Figure>
              <TableView
                caption="Men on the garrison roll by arm"
                columns={[
                  { key: "arm", header: "Arm", render: (r) => r.arm },
                  {
                    key: "men",
                    header: "Men",
                    numeric: true,
                    render: (r) => formatNumber(r.men),
                  },
                  {
                    key: "share",
                    header: "Share",
                    numeric: true,
                    render: (r) => `${Math.round((r.men / garrisonSummary.strength) * 100)}%`,
                  },
                ]}
                rows={armsBreakdown}
                rowKey={(r) => r.arm}
              />
            </Panel>

            <Panel
              title="Spirit of the men, month by month"
              subtitle="Average morale across the garrisons, 3019"
              note="The rise at Súlimë III is Faramir's return from Ithilien, not any easing of the
                Enemy's pressure."
            >
              <Figure height={230} caption="One series; the hover layer and the table carry the values.">
                <IgrCategoryChart
                  dataSource={moraleHistory}
                  chartType="line"
                  includedProperties={["period", "value"]}
                  brushes={[SERIES[0]]}
                  markerBrushes={[SERIES[0]]}
                  {...lineMarks}
                  yAxisMinimumValue={0}
                  yAxisMaximumValue={100}
                  yAxisInterval={25}
                  yAxisTitle="Morale (0–100)"
                  {...valueAxisTheme}
                  {...crosshairHover}
                />
              </Figure>
              <TableView
                caption="Average garrison morale by month, 3019"
                columns={[
                  { key: "period", header: "Month", render: (r) => r.period },
                  { key: "value", header: "Morale", numeric: true, render: (r) => r.value },
                ]}
                rows={moraleHistory}
                rowKey={(r) => r.period}
              />
            </Panel>
          </Row>

          <Panel
            title="Captains' reports in full"
            subtitle="What each commander sent with his figures"
          >
            {/* The panel's own title part is sized for a page heading; the sizes
                come from these spans instead, which is more robust than fighting
                the shadow part. */}
            <IgrAccordion className={styles.reportsAccordion}>
              {worstFirst.map((g) => (
                <IgrExpansionPanel key={g.id}>
                  <span slot="title" className={styles.reportTitle}>
                    {g.name}
                  </span>
                  <span slot="subtitle" className={styles.reportSubtitle}>
                    {g.commander} &middot; {readinessMeta[g.readiness].label} &middot;{" "}
                    {formatDays(g.provisionDays)} of victual
                  </span>
                  <div className={styles.dialogBody}>
                    <Facts
                      items={[
                        { label: "Station", value: g.station },
                        { label: "Strength", value: `${formatNumber(g.strength)} men` },
                        {
                          label: "Composition",
                          value: `${formatNumber(g.infantry)} foot · ${formatNumber(
                            g.archers,
                          )} archers · ${formatNumber(g.horse)} horse`,
                        },
                        { label: "Morale", value: `${g.morale} / 100` },
                        { label: "Morale trend", value: <TrendMark trend={g.moraleTrend} /> },
                        { label: "Fit for duty", value: `${g.health}%` },
                        { label: "Wounded", value: `${formatNumber(g.wounded)} men` },
                        { label: "Victual in store", value: formatDays(g.provisionDays) },
                        { label: "Shafts in magazine", value: formatNumber(g.shafts) },
                        {
                          label: "Last report",
                          value: g.reportAgeDays === 0 ? "Today" : formatDays(g.reportAgeDays),
                        },
                        { label: "Readiness", value: <StatusMark status={g.readiness} /> },
                      ]}
                    />
                    <Prose>{g.note}</Prose>
                  </div>
                </IgrExpansionPanel>
              ))}
            </IgrAccordion>
          </Panel>
        </>
      )}
    </Page>
  );
}

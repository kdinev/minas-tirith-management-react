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
import { IgrLinearGauge, IgrLinearGraphRange } from "igniteui-react-gauges";
import {
  bandProvisionDays,
  bandScore,
  fiefSeriesKeys,
  foodSuppliers,
  formatDays,
  formatNumber,
  granaryIntake,
  intakeByFief,
  provisionSummary,
  readinessMeta,
  storesByKind,
  victualReserveDays,
  type FoodSupplier,
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
import {
  CHROME,
  SERIES,
  STATUS,
  barMarks,
  crosshairHover,
  lineMarks,
  valueAxisTheme,
} from "../ui/charts";
import styles from "./pages.module.css";

/** Days of victual the City holds at present issue, and what a siege demands. */
const STORE_DAYS = victualReserveDays.at(-1)!.value;
const STORE_SCALE_MAX = 120;

const strongCell = (ctx: IgrCellContext<FoodSupplier>) => (
  <span className={styles.cellStrong}>{ctx.value as string}</span>
);

const numberCell = (ctx: IgrCellContext<FoodSupplier>) => (
  <span className={styles.cellNumeric}>{formatNumber(ctx.value as number)}</span>
);

const availabilityCell = (ctx: IgrCellContext<FoodSupplier>) => {
  const pct = ctx.value as number;
  return (
    <span className={styles.cellNumeric} style={{ color: readinessMeta[bandScore(pct)].color }}>
      {pct}%
    </span>
  );
};

const transitCell = (ctx: IgrCellContext<FoodSupplier>) => (
  <span className={styles.cellNumeric}>
    {(ctx.value as number) === 0 ? "In the townlands" : formatDays(ctx.value as number)}
  </span>
);

const readinessCell = (ctx: IgrCellContext<FoodSupplier>) => (
  <StatusMark status={ctx.value as Readiness} />
);

const READINESS_ORDER: Readiness[] = ["critical", "depleted", "strained", "ready"];
const storeMax = Math.max(...storesByKind.map((s) => s.value));

export default function Provisions() {
  const [readiness, setReadiness] = useState<Readiness | "all">("all");
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);

  const shown = useMemo(() => {
    const needle = deferredQuery.trim().toLowerCase();
    return foodSuppliers.filter((s) => {
      if (readiness !== "all" && s.readiness !== readiness) return false;
      if (!needle) return true;
      return (
        s.name.toLowerCase().includes(needle) ||
        s.region.toLowerCase().includes(needle) ||
        s.goods.toLowerCase().includes(needle)
      );
    });
  }, [readiness, deferredQuery]);

  const worstFirst = useMemo(
    () => [...shown].sort((a, b) => a.availability - b.availability),
    [shown],
  );

  return (
    <Page>
      <PageHeader
        eyebrow="Granaries of the City"
        icon="wheat"
        title="Provisions"
        lede="Nine fiefs and ports are bound to victual Minas Tirith. For each: what they send, how
          much of their levied quota they can presently meet, and how many days the wains are on the
          road. Beneath them, what stands in the granaries."
      />

      <Tiles>
        <StatTile
          label="Quota rendered"
          icon="wheat"
          value={provisionSummary.quotaMet}
          unit="%"
          status={bandScore(provisionSummary.quotaMet)}
          caption={`${formatNumber(provisionSummary.monthlyOutput)} sacks against ${formatNumber(
            provisionSummary.quota,
          )} owed last month.`}
        />
        <StatTile
          label="Monthly shortfall"
          icon="wheat"
          value={provisionSummary.shortfall}
          unit="sacks"
          accent={STATUS.serious}
          caption="What must be found elsewhere, or gone without, each month."
        />
        <StatTile
          label="City store at issue"
          icon="clock"
          value={STORE_DAYS}
          unit="days"
          status={bandProvisionDays(STORE_DAYS)}
          caption="At the present ration. Down from a hundred and eighteen at Ringarë."
        />
        <StatTile
          label="Victuallers failing"
          icon="status-critical"
          value={provisionSummary.failing}
          unit={`of ${provisionSummary.count}`}
          status="depleted"
          caption="The Pelennor, the Ethir, Pelargir and Anfalas."
        />
        <StatTile
          label="Longest haul"
          icon="clock"
          value={Math.max(...foodSuppliers.map((s) => s.transitDays))}
          unit="days"
          accent={SERIES[3]}
          caption="Anfalas, by the coast road. Little arrives from it unspoiled."
        />
        <StatTile
          label="Grain and meal in store"
          icon="wheat"
          value={storesByKind[0].value}
          unit="sacks"
          accent={SERIES[0]}
          caption="Two thirds of everything in the granaries is bread-corn."
        />
      </Tiles>

      <Row cols="minmax(320px, 0.95fr) minmax(340px, 1.05fr)">
        <Panel
          title="Days of victual in store"
          subtitle="At present issue, against the bands the Warden of the Granaries reckons by"
          note="Below ten days the City cannot relieve its own outer garrisons; below twenty-one it
            cannot feed the fiefs' levies once they arrive."
        >
          <div className={styles.gaugeReadout}>
            <p className={styles.gaugeValue}>{STORE_DAYS} days</p>
            <StatusChip status={bandProvisionDays(STORE_DAYS)} />
          </div>
          {/* `height` matches `.gaugeBox` so the figure leaves no slack under it. */}
          <Figure
            height={124}
            autoHeight
            caption="The bands are the same readiness scale used everywhere in this console."
          >
            <div className={styles.gaugeBox}>
              <IgrLinearGauge
                value={STORE_DAYS}
                minimumValue={0}
                maximumValue={STORE_SCALE_MAX}
                interval={20}
                labelInterval={20}
                labelExtent={0.08}
                orientation="Horizontal"
                backingBrush="transparent"
                backingOutline="transparent"
                backingStrokeThickness={0}
                scaleBrush={CHROME.track}
                scaleOutline="transparent"
                scaleStrokeThickness={0}
                scaleInnerExtent={0.42}
                scaleOuterExtent={0.58}
                rangeInnerExtent={0.42}
                rangeOuterExtent={0.58}
                needleBrush={CHROME.inkPrimary}
                needleOutline={CHROME.surface}
                needleStrokeThickness={1}
                needleShape="Needle"
                needleInnerExtent={0.2}
                needleOuterExtent={0.72}
                needleBreadth={9}
                tickBrush={CHROME.axis}
                tickStartExtent={0.64}
                tickEndExtent={0.74}
                tickStrokeThickness={1.5}
                minorTickBrush={CHROME.grid}
                minorTickCount={3}
                minorTickStartExtent={0.66}
                minorTickEndExtent={0.72}
                fontBrush={CHROME.inkMuted}
                font="12px Titillium Web, Segoe UI, sans-serif"
                transitionDuration={800}
                isNeedleDraggingEnabled={false}
              >
                <IgrLinearGraphRange
                  name="critical"
                  startValue={0}
                  endValue={10}
                  brush={STATUS.critical}
                  outline={CHROME.surface}
                  strokeThickness={2}
                />
                <IgrLinearGraphRange
                  name="depleted"
                  startValue={10}
                  endValue={21}
                  brush={STATUS.serious}
                  outline={CHROME.surface}
                  strokeThickness={2}
                />
                <IgrLinearGraphRange
                  name="strained"
                  startValue={21}
                  endValue={45}
                  brush={STATUS.warning}
                  outline={CHROME.surface}
                  strokeThickness={2}
                />
                <IgrLinearGraphRange
                  name="ready"
                  startValue={45}
                  endValue={STORE_SCALE_MAX}
                  brush={STATUS.good}
                  outline={CHROME.surface}
                  strokeThickness={2}
                />
              </IgrLinearGauge>
            </div>
          </Figure>
          <TableView
            caption="Days of victual in store, month by month"
            columns={[
              { key: "period", header: "Month", render: (r) => r.period },
              { key: "value", header: "Days", numeric: true, render: (r) => r.value },
            ]}
            rows={victualReserveDays}
            rowKey={(r) => r.period}
          />
        </Panel>

        <Panel
          title="Received into the granaries"
          subtitle="Sacks-equivalent taken in, month by month"
          note="Twenty-four thousand sacks a month less than at Ringarë, and more than half of the
            loss is the Pelennor's alone."
        >
          <Figure
            height={250}
            caption="One measure, so every bar takes the same hue; the axis and the table carry the values."
          >
            <IgrCategoryChart
              dataSource={granaryIntake}
              chartType="column"
              includedProperties={["period", "value"]}
              brushes={[SERIES[0]]}
              {...barMarks}
              yAxisTitle="Sacks received"
              {...valueAxisTheme}
              {...crosshairHover}
            />
          </Figure>
          <TableView
            caption="Sacks received into the granaries, month by month"
            columns={[
              { key: "period", header: "Month", render: (r) => r.period },
              {
                key: "value",
                header: "Sacks",
                numeric: true,
                render: (r) => formatNumber(r.value),
              },
            ]}
            rows={granaryIntake}
            rowKey={(r) => r.period}
          />
        </Panel>
      </Row>

      <Panel
        title="Rendering by the four chief victuallers"
        subtitle="Sacks-equivalent delivered each month by the fiefs the City most depends on"
        note="Lossarnach and Lebennin hold roughly steady; Pelargir has halved under the Corsair
          threat, and the Pelennor has collapsed to nothing since the steadings were emptied."
      >
        <Figure
          height={290}
          legend={fiefSeriesKeys.map((k, i) => ({ label: k, color: SERIES[i] }))}
          caption="Four series on one axis, in the same units. Every figure is in the table below."
        >
          {/* No final-value annotations here: the charts package renders them
              against the value axis, which is on the left, so they land on top
              of the tick labels rather than at the line ends. Identity comes
              from the legend, values from the crosshair and the table. */}
          <IgrCategoryChart
            dataSource={intakeByFief}
            chartType="line"
            includedProperties={["period", ...fiefSeriesKeys]}
            brushes={[SERIES[0], SERIES[1], SERIES[2], SERIES[3]]}
            markerBrushes={[SERIES[0], SERIES[1], SERIES[2], SERIES[3]]}
            {...lineMarks}
            yAxisTitle="Sacks per month"
            {...valueAxisTheme}
            {...crosshairHover}
          />
        </Figure>
        <TableView
          caption="Sacks rendered per month by the four chief victuallers"
          columns={[
            { key: "period", header: "Month", render: (r) => r.period },
            ...fiefSeriesKeys.map((k) => ({
              key: k,
              header: k,
              numeric: true,
              render: (r: (typeof intakeByFief)[number]) => formatNumber(r[k]),
            })),
          ]}
          rows={intakeByFief}
          rowKey={(r) => r.period}
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
            <IgrSelectItem value="all">All victuallers</IgrSelectItem>
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
            placeholder="Fief, region or goods"
            value={query}
            onInput={(e: IgrComponentValueChangedEventArgs) => setQuery(e.detail)}
          />
        </div>
        <span className={styles.filterSpacer} />
        <p className={styles.filterCount}>
          Showing {shown.length} of {foodSuppliers.length} victuallers
        </p>
      </div>

      {shown.length === 0 ? (
        <Panel>
          <Empty icon="wheat">
            No victualler answers to that description. Clear the filters to see them all.
          </Empty>
        </Panel>
      ) : (
        <>
          <Panel title="The victuallers' roll" subtitle="Sort any column to read it another way" flush>
            <div className={styles.grid} style={{ "--grid-height": "540px" } as React.CSSProperties}>
              <IgrGridLite data={shown}>
                <IgrGridLiteColumn
                  field="name"
                  header="Fief or port"
                  dataType="string"
                  sortable
                  cellTemplate={strongCell}
                />
                <IgrGridLiteColumn field="region" header="Region" dataType="string" sortable />
                <IgrGridLiteColumn field="goods" header="Renders" dataType="string" sortable />
                <IgrGridLiteColumn
                  field="availability"
                  header="Quota met"
                  dataType="number"
                  sortable
                  cellTemplate={availabilityCell}
                />
                <IgrGridLiteColumn
                  field="monthlyOutput"
                  header="Sacks sent"
                  dataType="number"
                  sortable
                  cellTemplate={numberCell}
                />
                <IgrGridLiteColumn
                  field="quota"
                  header="Sacks owed"
                  dataType="number"
                  sortable
                  cellTemplate={numberCell}
                />
                <IgrGridLiteColumn
                  field="transitDays"
                  header="On the road"
                  dataType="number"
                  sortable
                  cellTemplate={transitCell}
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
            title="What each fief renders against what it owes"
            subtitle="The pale mark on each bar is the levied quota"
          >
            <div className={styles.rows}>
              {worstFirst.map((s) => (
                <article key={s.id} className={styles.rowLine}>
                  <div className={styles.rowName}>
                    <p className={styles.rowTitle}>{s.name}</p>
                    <p className={styles.rowMeta}>
                      {s.goods} &middot;{" "}
                      {s.transitDays === 0 ? "in the townlands" : `${formatDays(s.transitDays)} by road`}
                    </p>
                  </div>
                  <StatusChip status={s.readiness} />
                  <Meter
                    label="Rendered against quota"
                    value={s.monthlyOutput}
                    max={Math.max(s.quota, s.monthlyOutput)}
                    target={s.quota}
                    display={`${formatNumber(s.monthlyOutput)} / ${formatNumber(s.quota)}`}
                    status={bandScore(s.availability)}
                    foot={`${s.availability}% of quota`}
                  />
                  <Prose>{s.note}</Prose>
                </article>
              ))}
            </div>
          </Panel>
        </>
      )}

      <Panel
        title="What stands in the granaries"
        subtitle="By kind of victual, sacks-equivalent"
        note="Bread-corn will outlast everything else. Wine and oil will be the first to fail, and
          the men will notice it first."
      >
        <div className={styles.factors}>
          {storesByKind.map((s) => (
            <Meter
              key={s.period}
              label={s.period}
              value={s.value}
              max={storeMax}
              display={`${formatNumber(s.value)} sacks`}
              color={SERIES[0]}
            />
          ))}
        </div>
        <TableView
          caption="Stores in the granaries of the City, by kind"
          columns={[
            { key: "kind", header: "Kind", render: (r) => r.period },
            {
              key: "value",
              header: "Sacks",
              numeric: true,
              render: (r) => formatNumber(r.value),
            },
          ]}
          rows={storesByKind}
          rowKey={(r) => r.period}
        />
      </Panel>
    </Page>
  );
}

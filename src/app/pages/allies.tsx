import {
  IgrCard,
  IgrCardContent,
  IgrCardHeader,
  IgrDivider,
} from "igniteui-react";
import { IgrGridLite, IgrGridLiteColumn, type IgrCellContext } from "igniteui-react/grid-lite";
import { IgrCategoryChart } from "igniteui-react-charts";
import {
  allies,
  allySummary,
  arrivalForecast,
  bandScore,
  formatDays,
  formatNumber,
  readinessMeta,
  type Ally,
  type Readiness,
} from "../data";
import {
  Facts,
  Figure,
  Meter,
  Page,
  PageHeader,
  Panel,
  Row,
  StatTile,
  StatusChip,
  StatusMark,
  Tiles,
} from "../ui/kit";
import { TableView } from "../ui/table-view";
import { SERIES, barMarks, crosshairHover, valueAxisTheme } from "../ui/charts";
import styles from "./pages.module.css";

/**
 * Men standing before the walls on each day of the muster, cumulative.
 *
 * The daily arrivals and the running total differ by an order of magnitude, so
 * they are not put on one plot together; the running total is the figure that
 * answers "how many men will I have on the tenth day", and the daily arrivals
 * are in the table beneath it.
 */
const arrivalsCumulative = (() => {
  let running = 0;
  return arrivalForecast.map((day) => {
    running += day.value;
    return { period: day.period, arriving: day.value, standing: running };
  });
})();

const answering = allies.filter((a) => a.estimatedForce > 0);
const silent = allies.filter((a) => a.estimatedForce === 0);
const largestForce = Math.max(...answering.map((a) => a.estimatedForce));

const strongCell = (ctx: IgrCellContext<Ally>) => (
  <span className={styles.cellStrong}>{ctx.value as string}</span>
);

const numberCell = (ctx: IgrCellContext<Ally>) => (
  <span className={styles.cellNumeric}>{formatNumber(ctx.value as number)}</span>
);

const daysCell = (ctx: IgrCellContext<Ally>) => {
  const days = ctx.value as number;
  return <span className={styles.cellNumeric}>{days === 0 ? "No word" : formatDays(days)}</span>;
};

const willingnessCell = (ctx: IgrCellContext<Ally>) => {
  const pct = ctx.value as number;
  return (
    <span className={styles.cellNumeric} style={{ color: readinessMeta[bandScore(pct)].color }}>
      {pct === 0 ? "—" : `${pct}%`}
    </span>
  );
};

const readinessCell = (ctx: IgrCellContext<Ally>) => <StatusMark status={ctx.value as Readiness} />;

export default function Allies() {
  return (
    <Page>
      <PageHeader
        eyebrow="Beyond the walls"
        icon="banner"
        title="Allies"
        lede="Eleven realms and fiefs may answer the summons. For each: what stands under arms there,
          what they are judged able to send to the Pelennor, and how many days lie between the
          sending and their arrival before the walls."
      />

      <Tiles>
        <StatTile
          label="Promised to the muster"
          icon="banner"
          value={allySummary.estimatedForce}
          unit="men"
          accent={SERIES[2]}
          caption={`From ${allySummary.answering} of ${allySummary.count} realms summoned.`}
        />
        <StatTile
          label="Largest contingent"
          icon="people"
          value={allySummary.largest.estimatedForce}
          unit="men"
          accent={SERIES[0]}
          caption={`${allySummary.largest.realm} — ${allySummary.largest.arm.toLowerCase()}.`}
        />
        <StatTile
          label="Full muster in"
          icon="clock"
          value={allySummary.fullMusterDays}
          unit="days"
          accent={SERIES[3]}
          caption="Anfalas is the last to arrive, by the coast road."
        />
        <StatTile
          label="Realms silent"
          icon="status-critical"
          value={allySummary.silent}
          unit={`of ${allySummary.count}`}
          status="critical"
          caption="The Dúnedain of the North and the Elven realms. No herald received."
        />
        <StatTile
          label="Under arms in the fiefs"
          icon="shield"
          value={allySummary.troopsAvailable}
          unit="men"
          accent={SERIES[6]}
          caption="What they hold. Rather more than half of it must stay to ward their own lands."
        />
        <StatTile
          label="Here within four days"
          icon="clock"
          value={answering
            .filter((a) => a.mobilizeDays <= 4)
            .reduce((n, a) => n + a.estimatedForce, 0)}
          unit="men"
          accent={SERIES[0]}
          caption="Lossarnach and Dol Amroth. Everything else, Rohan included, comes later."
        />
      </Tiles>

      <Row cols="minmax(340px, 1.05fr) minmax(320px, 0.95fr)">
        <Panel
          title="The muster as it arrives"
          subtitle="Men standing before the walls, cumulative, day by day"
          note="The seventh day is the one that matters: Rohan's six thousand more than doubles
            everything gathered before it."
        >
          <Figure
            height={260}
            caption="Running total, one measure. Daily arrivals are in the table below."
          >
            <IgrCategoryChart
              dataSource={arrivalsCumulative}
              chartType="column"
              includedProperties={["period", "standing"]}
              brushes={[SERIES[2]]}
              {...barMarks}
              yAxisTitle="Men before the walls"
              {...valueAxisTheme}
              {...crosshairHover}
            />
          </Figure>
          <TableView
            caption="Arrivals before the walls, by day of the muster"
            columns={[
              { key: "period", header: "Day", render: (r) => r.period },
              {
                key: "arriving",
                header: "Arriving",
                numeric: true,
                render: (r) => formatNumber(r.arriving),
              },
              {
                key: "standing",
                header: "Standing",
                numeric: true,
                render: (r) => formatNumber(r.standing),
              },
            ]}
            rows={arrivalsCumulative}
            rowKey={(r) => r.period}
          />
        </Panel>

        <Panel
          title="Who sends most, and how long they take"
          subtitle="Realms in the order their forces reach the City"
        >
          {[...answering]
            .sort((a, b) => a.mobilizeDays - b.mobilizeDays)
            .map((a) => (
              <Meter
                key={a.id}
                label={a.realm}
                value={a.estimatedForce}
                max={largestForce}
                display={`${formatNumber(a.estimatedForce)} men`}
                color={SERIES[2]}
                foot={`${formatDays(a.mobilizeDays)} · ${a.distanceLeagues} leagues · ${a.arm}`}
              />
            ))}
        </Panel>
      </Row>

      <Panel
        title="Reports from the allies"
        subtitle="The last word received from each realm that has answered"
      >
        <div className={styles.allyGrid}>
          {answering.map((a) => (
            <AllyCard key={a.id} ally={a} />
          ))}
        </div>
      </Panel>

      <Panel
        title="Realms that have not answered"
        subtitle="Summoned, and nothing received"
        note="Neither is counted in any figure on this page. The Steward is advised not to build a
          plan upon either."
      >
        <div className={styles.allyGrid}>
          {silent.map((a) => (
            <AllyCard key={a.id} ally={a} silent />
          ))}
        </div>
      </Panel>

      <Panel
        title="The allies' roll"
        subtitle="Sort by force, by time to muster, or by how readily they are judged to answer"
        flush
      >
        <div className={styles.grid} style={{ "--grid-height": "520px" } as React.CSSProperties}>
          <IgrGridLite data={allies}>
            <IgrGridLiteColumn
              field="realm"
              header="Realm"
              dataType="string"
              sortable
              cellTemplate={strongCell}
            />
            <IgrGridLiteColumn field="envoy" header="Speaks for them" dataType="string" sortable />
            <IgrGridLiteColumn field="arm" header="Chief arm" dataType="string" sortable />
            <IgrGridLiteColumn
              field="troopsAvailable"
              header="Under arms"
              dataType="number"
              sortable
              cellTemplate={numberCell}
            />
            <IgrGridLiteColumn
              field="estimatedForce"
              header="Can send"
              dataType="number"
              sortable
              cellTemplate={numberCell}
            />
            <IgrGridLiteColumn
              field="mobilizeDays"
              header="Time to muster"
              dataType="number"
              sortable
              cellTemplate={daysCell}
            />
            <IgrGridLiteColumn
              field="distanceLeagues"
              header="Leagues"
              dataType="number"
              sortable
              cellTemplate={numberCell}
            />
            <IgrGridLiteColumn
              field="willingness"
              header="Willingness"
              dataType="number"
              sortable
              cellTemplate={willingnessCell}
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
    </Page>
  );
}

function AllyCard({ ally, silent = false }: { ally: Ally; silent?: boolean }) {
  return (
    <IgrCard className={silent ? `${styles.allyCard} ${styles.allyCardSilent}` : styles.allyCard}>
      <IgrCardHeader>
        <h3 slot="title" className={styles.allyRealm}>
          {ally.realm}
        </h3>
        <p slot="subtitle" className={styles.allyArm}>
          {ally.arm}
        </p>
      </IgrCardHeader>
      <IgrCardContent>
        <div className={styles.allyCardBody}>
          <div className={styles.allyHead}>
            <StatusChip status={ally.readiness} />
            <span className={styles.rowMeta}>{ally.distanceLeagues} leagues distant</span>
          </div>

          <Facts
            items={[
              {
                label: "Can send",
                value: ally.estimatedForce > 0 ? `${formatNumber(ally.estimatedForce)} men` : "—",
              },
              {
                label: "Under arms",
                value:
                  ally.troopsAvailable > 0 ? `${formatNumber(ally.troopsAvailable)} men` : "Unknown",
              },
              {
                label: "Time to muster",
                value: ally.mobilizeDays > 0 ? formatDays(ally.mobilizeDays) : "No word",
              },
            ]}
          />

          {ally.willingness > 0 ? (
            <Meter
              label="Judged willingness to answer"
              value={ally.willingness}
              display={`${ally.willingness} / 100`}
              status={bandScore(ally.willingness)}
            />
          ) : null}

          <IgrDivider />

          <p className={styles.allyWord}>
            <span className={styles.allyWordLabel}>Last word &mdash; {ally.envoy}</span>
            {ally.lastWord}
          </p>
        </div>
      </IgrCardContent>
    </IgrCard>
  );
}

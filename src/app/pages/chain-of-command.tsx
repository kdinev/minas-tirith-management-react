import { useEffect, useRef } from "react";
import { IgrGridLite, IgrGridLiteColumn, type IgrCellContext } from "igniteui-react/grid-lite";
import { IgrCategoryChart } from "igniteui-react-charts";
import {
  buildCommandTree,
  commanders,
  flattenCommandTree,
  formatMobilizeHours,
  formatNumber,
  readinessMeta,
  type CommandNode,
  type Commander,
  type Readiness,
} from "../data";
import {
  Facts,
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
import { SERIES, barMarks, crosshairHover, valueAxisTheme } from "../ui/charts";
import styles from "./pages.module.css";

const tree = buildCommandTree();
const roll = flattenCommandTree(tree);

/**
 * How the host builds after the order is given.
 *
 * Each officer contributes only his *direct* command — the men not already
 * counted under a named subordinate — so no company appears twice. Bucketing to
 * six windows rather than one column per distinct hour keeps the axis readable:
 * fourteen categories produced labels the chart had to truncate to two
 * characters.
 */
const MUSTER_WINDOWS: { label: string; withinHours: number }[] = [
  { label: "Within 1 hr", withinHours: 1 },
  { label: "Within 6 hrs", withinHours: 6 },
  { label: "Within a day", withinHours: 24 },
  { label: "Within 2 days", withinHours: 48 },
  { label: "Within 4 days", withinHours: 96 },
  { label: "Within a week", withinHours: 168 },
];

const buildUp = MUSTER_WINDOWS.map((window) => ({
  period: window.label,
  hours: window.withinHours,
  men: roll
    .filter((o) => o.mobilizeHours <= window.withinHours)
    .reduce((sum, o) => sum + Math.max(0, o.directForce), 0),
}));

const mobilizeCell = (ctx: IgrCellContext<Commander>) => (
  <span className={styles.cellNumeric}>{formatMobilizeHours(ctx.value as number)}</span>
);

const forceCell = (ctx: IgrCellContext<Commander>) => (
  <span className={styles.cellNumeric}>{formatNumber(ctx.value as number)}</span>
);

const readinessCell = (ctx: IgrCellContext<Commander>) => (
  <StatusMark status={ctx.value as Readiness} />
);

const strongCell = (ctx: IgrCellContext<Commander>) => (
  <span className={styles.cellStrong}>{ctx.value as string}</span>
);

const byName = new Map(commanders.map((c) => [c.id, c.name]));

/** The officer with the longest road, which sets the length of the full muster. */
const slowest = [...roll].sort((a, b) => b.mobilizeHours - a.mobilizeHours)[0];

/**
 * Officers who bring men of their own, in the order their forces come ready.
 *
 * Keyed on `directForce`, not `mobilizableForce`: a lord's total covers his
 * lieutenants', so listing both would count the same companies twice and put the
 * Steward at the head of the ladder with the whole host beside his name.
 */
const ladder = [...roll]
  .filter((o) => o.directForce > 0)
  .sort((a, b) => a.mobilizeHours - b.mobilizeHours || b.directForce - a.directForce);

const largestCommand = Math.max(...ladder.map((o) => o.directForce));

const superiorCell = (ctx: IgrCellContext<Commander>) => (
  <span className={styles.cellMuted}>
    {ctx.value ? (byName.get(ctx.value as string) ?? "—") : "The Steward himself"}
  </span>
);

export default function ChainOfCommand() {
  const chart = useRef<HTMLDivElement>(null);

  // The chart is far wider than any screen. Open it centred on the Steward
  // rather than at the far-left edge, where the root is nowhere in sight.
  useEffect(() => {
    const box = chart.current;
    if (box) box.scrollLeft = (box.scrollWidth - box.clientWidth) / 2;
  }, []);

  return (
    <Page>
      <PageHeader
        eyebrow="Captains of Gondor"
        icon="command"
        title="Chain of Command"
        lede="Every officer who answers to the Tower, and beneath each: how long from the order being
          given to his force standing ready, and how many men that force numbers. A superior's figure
          covers his lieutenants'; the direct-command figure is what he holds himself."
      />

      <Tiles>
        <StatTile
          label="Whole host, if summoned"
          icon="people"
          value={tree.mobilizableForce}
          unit="men"
          accent={SERIES[0]}
          caption={`Under ${tree.chainSize} named officers, from the Citadel to the Langstrand.`}
        />
        <StatTile
          label="Ready within a day"
          icon="clock"
          value={buildUp.find((b) => b.hours >= 24)?.men ?? 0}
          unit="men"
          accent={SERIES[2]}
          caption="The City's own garrison and the Rangers. Everything else is on the road."
        />
        <StatTile
          label="Full muster takes"
          icon="clock"
          value={formatMobilizeHours(slowest.mobilizeHours)}
          caption={`${slowest.name}, from ${slowest.station}, has the longest road of any officer.`}
          accent={SERIES[3]}
        />
        <StatTile
          label="Officers on the roll"
          icon="command"
          value={commanders.length}
          caption="The Steward, his captains of the City and the river, and the lords of the fiefs."
          accent={SERIES[6]}
        />
        <StatTile
          label="Commands in crisis"
          icon="status-critical"
          value={roll.filter((o) => o.readiness === "critical").length}
          unit={`of ${commanders.length}`}
          status="critical"
          caption="Boromir, of whom there is no word, and Cair Andros, which has fallen silent."
        />
        <StatTile
          label="Held by the Steward direct"
          icon="tower"
          value={Math.max(0, tree.directForce)}
          unit="men"
          accent={SERIES[4]}
          caption="The Steward commands no company himself; every man is under a named captain."
        />
      </Tiles>

      <Panel
        title="The chain of command"
        subtitle="Each card carries the officer's own command, his whole chain, and how long it takes to raise"
        note="Scroll sideways to follow the lords of the outlying fiefs. A card's accent is its
          readiness; the figure beneath 'Whole chain' includes every officer below it."
      >
        <div className={styles.orgScroll} ref={chart}>
          <div className={styles.orgTree}>
            <ul>
              <OfficerBranch node={tree} />
            </ul>
          </div>
        </div>
      </Panel>

      <Row cols="minmax(340px, 1.05fr) minmax(320px, 0.95fr)">
        <Panel
          title="How the host builds"
          subtitle="Men standing ready at each point on the clock, once the order is given"
          note="Each officer is counted at his own mobilization hour and only for the men he holds
            directly, so no company is counted twice."
        >
          <Figure
            height={250}
            caption="Cumulative, one series. The table below gives every step."
          >
            <IgrCategoryChart
              dataSource={buildUp}
              chartType="column"
              includedProperties={["period", "men"]}
              brushes={[SERIES[0]]}
              {...barMarks}
              yAxisTitle="Men standing ready"
              {...valueAxisTheme}
              {...crosshairHover}
            />
          </Figure>
          <TableView
            caption="Cumulative strength standing ready, by hour after the order"
            columns={[
              { key: "period", header: "After", render: (r) => r.period },
              {
                key: "men",
                header: "Men ready",
                numeric: true,
                render: (r) => formatNumber(r.men),
              },
              {
                key: "share",
                header: "Share of the host",
                numeric: true,
                render: (r) => `${Math.round((r.men / tree.mobilizableForce) * 100)}%`,
              },
            ]}
            rows={buildUp}
            rowKey={(r) => r.period}
          />
        </Panel>

        <Panel
          title="The mobilization ladder"
          subtitle="Men each officer brings himself, in the order they come ready"
          note="Only men not already counted under a subordinate, so the bars sum to the whole host
            of 13,350 rather than counting a lord's companies twice."
        >
          <div className={styles.factors}>
            {ladder.map((o) => (
              <Meter
                key={o.id}
                label={`${o.name} — ${o.title}`}
                value={o.directForce}
                max={largestCommand}
                display={`${formatNumber(o.directForce)} men`}
                color={SERIES[0]}
                foot={`${
                  o.mobilizeHours === 0
                    ? "Ready at once"
                    : `Ready in ${formatMobilizeHours(o.mobilizeHours)}`
                } · ${o.station}`}
              />
            ))}
          </div>
        </Panel>
      </Row>

      <Panel
        title="The officers' roll"
        subtitle="Sort by force or by mobilization time to see who can be called on soonest"
        flush
      >
        <div className={styles.grid} style={{ "--grid-height": "560px" } as React.CSSProperties}>
          <IgrGridLite data={roll as Commander[]}>
            <IgrGridLiteColumn
              field="name"
              header="Officer"
              dataType="string"
              sortable
              cellTemplate={strongCell}
            />
            <IgrGridLiteColumn field="rank" header="Rank" dataType="string" sortable />
            <IgrGridLiteColumn field="title" header="Office" dataType="string" sortable />
            <IgrGridLiteColumn field="station" header="Station" dataType="string" sortable />
            <IgrGridLiteColumn
              field="reportsTo"
              header="Answers to"
              dataType="string"
              sortable
              cellTemplate={superiorCell}
            />
            <IgrGridLiteColumn
              field="mobilizeHours"
              header="Time to muster"
              dataType="number"
              sortable
              cellTemplate={mobilizeCell}
            />
            <IgrGridLiteColumn
              field="mobilizableForce"
              header="Force"
              dataType="number"
              sortable
              cellTemplate={forceCell}
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

      <Panel title="Notes on the captains" subtitle="What the Steward has set against each name">
        <div className={styles.rows}>
          {roll.map((o) => (
            <article key={o.id} className={styles.rowLine}>
              <div className={styles.rowName}>
                <p className={styles.rowTitle}>{o.name}</p>
                <p className={styles.rowMeta}>
                  {o.rank} &middot; {o.title}
                </p>
              </div>
              <StatusChip status={o.readiness} />
              <Facts
                items={[
                  { label: "Muster in", value: formatMobilizeHours(o.mobilizeHours) },
                  { label: "Force", value: `${formatNumber(o.mobilizableForce)} men` },
                ]}
              />
              <Prose>{o.note}</Prose>
            </article>
          ))}
        </div>
      </Panel>
    </Page>
  );
}

/** One officer and, recursively, everyone beneath him. */
function OfficerBranch({ node }: { node: CommandNode }) {
  return (
    <li>
      <OfficerCard node={node} />
      {node.reports.length > 0 ? (
        <ul>
          {node.reports.map((child) => (
            <OfficerBranch key={child.id} node={child} />
          ))}
        </ul>
      ) : null}
    </li>
  );
}

function OfficerCard({ node }: { node: CommandNode }) {
  const meta = readinessMeta[node.readiness];
  const hasChain = node.reports.length > 0;
  return (
    <article
      className={styles.orgCard}
      style={{ "--card-accent": meta.color } as React.CSSProperties}
    >
      <div className={styles.orgCardHead}>
        <p className={styles.orgRank}>{node.rank}</p>
        <p className={styles.orgName}>{node.name}</p>
        <p className={styles.orgTitle}>{node.title}</p>
        {/* The reserved status colour never stands alone — the word comes with it. */}
        <StatusMark status={node.readiness} />
      </div>
      <div className={styles.orgStats}>
        <div className={styles.orgStat}>
          <span className={styles.orgStatLabel}>Muster in</span>
          <span className={styles.orgStatValue}>{formatMobilizeHours(node.mobilizeHours)}</span>
        </div>
        <div className={styles.orgStat}>
          <span className={styles.orgStatLabel}>{hasChain ? "Whole chain" : "Force"}</span>
          <span className={styles.orgStatValue}>{formatNumber(node.mobilizableForce)}</span>
        </div>
      </div>
      {hasChain ? (
        <p className={styles.orgChainNote}>
          {formatNumber(Math.max(0, node.directForce))} held directly &middot; {node.chainSize}{" "}
          officer{node.chainSize === 1 ? "" : "s"} beneath &middot; whole chain ready in{" "}
          {formatMobilizeHours(node.chainMobilizeHours)}
        </p>
      ) : (
        <p className={styles.orgChainNote}>{node.station}</p>
      )}
    </article>
  );
}

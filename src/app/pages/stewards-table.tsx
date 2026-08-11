import { IgrCategoryChart } from "igniteui-react-charts";
import {
  allySummary,
  armorySummary,
  bandForThreat,
  bandProvisionDays,
  bandScore,
  formatCompact,
  formatDays,
  formatMobilizeHours,
  formatNumber,
  garrisonSummary,
  garrisons,
  intelSummary,
  provisionSummary,
  threatHistory,
  threatIndex,
  musterHistory,
  victualReserveDays,
  allies,
  type Garrison,
} from "../data";
import {
  Facts,
  Figure,
  Hero,
  Icon,
  Meter,
  Page,
  PageHeader,
  Panel,
  Prose,
  Row,
  SectionLink,
  StatTile,
  StatusMark,
  Tiles,
} from "../ui/kit";
import { TableView } from "../ui/table-view";
import { ThreatMeter } from "../ui/threat-meter";
import { CHROME, SERIES, STATUS, barMarks, crosshairHover, valueAxisTheme } from "../ui/charts";
import styles from "./pages.module.css";

/** Garrisons in the order the Steward must worry about them. */
const byUrgency = [...garrisons].sort(
  (a, b) => a.provisionDays - b.provisionDays || a.morale - b.morale,
);

export default function StewardsTable() {
  const band = bandForThreat(threatIndex);
  const latest = intelSummary.latest;

  return (
    <Page>
      <PageHeader
        eyebrow="Tower of Ecthelion"
        icon="tower"
        title="The Steward's Table"
        lede="Everything the Citadel knows this morning, on one board: what stands under arms, what
          it eats, what it is armed with, who is coming, and how near the Enemy has drawn."
        actions={<SectionLink to="/mordor">Reports on the Enemy</SectionLink>}
      />

      <Tiles>
        <StatTile
          label="Under arms"
          icon="people"
          value={garrisonSummary.strength}
          unit="men"
          accent={SERIES[0]}
          caption={`Across ${garrisonSummary.count} garrisons, from the Citadel to Cair Andros.`}
        />
        <StatTile
          label="Promised by the fiefs"
          icon="banner"
          value={allySummary.estimatedForce}
          unit="men"
          accent={SERIES[2]}
          caption={`${allySummary.answering} realms answering, the last arriving in ${formatDays(
            allySummary.fullMusterDays,
          )}.`}
        />
        <StatTile
          label="Spirit of the men"
          icon="shield"
          value={`${garrisonSummary.morale}`}
          unit="/ 100"
          status={bandScore(garrisonSummary.morale)}
          caption="Weighted by the strength of each garrison, not its number."
        />
        <StatTile
          label="Fit for duty"
          icon="people"
          value={`${garrisonSummary.health}`}
          unit="%"
          status={bandScore(garrisonSummary.health)}
          caption={`${formatNumber(garrisonSummary.wounded)} men wounded or otherwise unfit.`}
        />
        <StatTile
          label="Leanest victual"
          icon="wheat"
          value={garrisonSummary.leanestProvisionDays}
          unit="days"
          status={bandProvisionDays(garrisonSummary.leanestProvisionDays)}
          caption="Osgiliath. The store that empties first is the one that decides."
        />
        <StatTile
          label="Enemy counted"
          icon="eye"
          value={intelSummary.countedEnemy}
          unit="reckoned"
          accent={band.color}
          caption={`${intelSummary.grave} reports of grave severity in the last nine days.`}
        />
      </Tiles>

      {/* ---- The Enemy ---------------------------------------------------- */}

      <Row cols="minmax(320px, 0.85fr) minmax(340px, 1.15fr)">
        <Panel
          title="Threat of invasion"
          subtitle="A weighted index of six factors, read hourly"
          actions={<SectionLink to="/mordor">The Watch</SectionLink>}
        >
          <ThreatMeter index={threatIndex} size={230} />
        </Panel>

        <Panel
          title="How the threat has moved"
          subtitle="Composite index, 1 to 10 March"
          note={
            <>
              The index has risen {threatHistory.at(-1)!.value - threatHistory[0].value} points in
              nine days. It has never before stood above 60 in the Steward&rsquo;s lifetime.
            </>
          }
        >
          <Figure
            height={210}
            caption="One series, so the axis and the hover layer carry the values; the table below holds them in full."
          >
            {/* The threat index means "bad", so the series wears the reserved
                critical status colour rather than a categorical slot. */}
            <IgrCategoryChart
              dataSource={threatHistory}
              chartType="area"
              includedProperties={["period", "value"]}
              brushes={[`${STATUS.critical}55`]}
              outlines={[STATUS.critical]}
              thickness={2}
              markerTypes="Circle"
              markerBrushes={[STATUS.critical]}
              markerOutlines={[CHROME.surface]}
              markerThickness={2}
              areaFillOpacity={0.35}
              yAxisMinimumValue={0}
              yAxisMaximumValue={100}
              yAxisInterval={25}
              yAxisTitle="Threat index"
              {...valueAxisTheme}
              {...crosshairHover}
            />
          </Figure>

          <div className={styles.latestReport}>
            <p className={styles.latestHead}>
              <Icon name="flame" />
              Latest report &mdash; {latest.date}, {latest.source}
            </p>
            <p className={styles.latestHeadline}>{latest.headline}</p>
            <Prose>{latest.detail}</Prose>
          </div>

          <TableView
            caption="Composite threat index by day, 3019"
            columns={[
              { key: "period", header: "Day", render: (r) => r.period },
              { key: "value", header: "Index", numeric: true, render: (r) => r.value },
            ]}
            rows={threatHistory}
            rowKey={(r) => r.period}
          />
        </Panel>
      </Row>

      {/* ---- Garrisons ---------------------------------------------------- */}

      <Panel
        title="Garrisons, worst first"
        subtitle="Ordered by days of victual remaining, then by morale"
        actions={<SectionLink to="/garrisons">Full garrison reports</SectionLink>}
      >
        <div className={styles.garrisonRoll}>
          {byUrgency.map((g) => (
            <GarrisonLine key={g.id} garrison={g} />
          ))}
        </div>
      </Panel>

      {/* ---- Supply ------------------------------------------------------- */}

      <Row>
        <Panel
          title="Provisions"
          subtitle="What the fiefs render against what they owe"
          actions={<SectionLink to="/provisions">The granaries</SectionLink>}
        >
          <Hero
            value={`${provisionSummary.quotaMet}%`}
            caption={
              <>
                of the levied quota rendered last month &mdash;{" "}
                {formatNumber(provisionSummary.monthlyOutput)} sacks against{" "}
                {formatNumber(provisionSummary.quota)} owed, a shortfall of{" "}
                {formatNumber(provisionSummary.shortfall)}.
              </>
            }
            color={SERIES[2]}
          />
          <Facts
            items={[
              { label: "Victuallers", value: `${provisionSummary.count} fiefs and ports` },
              {
                label: "Failing or depleted",
                value: `${provisionSummary.failing} of ${provisionSummary.count}`,
              },
              {
                label: "City store at present issue",
                value: formatDays(victualReserveDays.at(-1)!.value),
              },
            ]}
          />
        </Panel>

        <Panel
          title="Armoury"
          subtitle="What the forges strike against what they could"
          actions={<SectionLink to="/armoury">The forges</SectionLink>}
        >
          <Hero
            value={`${armorySummary.utilisation}%`}
            caption={
              <>
                of forge capacity in use &mdash; {formatNumber(armorySummary.weeklyOutput)} pieces
                struck last week against a capacity of {formatNumber(armorySummary.capacity)}. Iron
                and charcoal, not hands, are the binding want.
              </>
            }
            color={SERIES[3]}
          />
          <Facts
            items={[
              { label: "Smiths at the anvils", value: formatNumber(armorySummary.smiths) },
              {
                label: "Forges short of material",
                value: `${armorySummary.starved} of ${armorySummary.count}`,
              },
              { label: "Shafts in the magazines", value: formatCompact(garrisonSummary.shafts) },
            ]}
          />
        </Panel>
      </Row>

      {/* ---- The muster --------------------------------------------------- */}

      <Row cols="minmax(340px, 1.1fr) minmax(300px, 0.9fr)">
        <Panel
          title="The muster roll, month by month"
          subtitle="Men on the garrison roll across the whole command, 3019"
          note="Twelve hundred and fifty men fewer than at Narvinyë, and the Rammas not yet assaulted."
        >
          <Figure height={230} caption="Garrison strength only; the fiefs' levies are counted separately.">
            <IgrCategoryChart
              dataSource={musterHistory}
              chartType="column"
              includedProperties={["period", "value"]}
              brushes={[SERIES[0]]}
              {...barMarks}
              yAxisTitle="Men on the roll"
              {...valueAxisTheme}
              {...crosshairHover}
            />
          </Figure>
          <TableView
            caption="Garrison muster roll by month, 3019"
            columns={[
              { key: "period", header: "Month", render: (r) => r.period },
              { key: "value", header: "Men", numeric: true, render: (r) => formatNumber(r.value) },
            ]}
            rows={musterHistory}
            rowKey={(r) => r.period}
          />
        </Panel>

        <Panel
          title="Who is coming"
          subtitle="The three largest contingents promised"
          actions={<SectionLink to="/allies">All allies</SectionLink>}
        >
          {[...allies]
            .filter((a) => a.estimatedForce > 0)
            .sort((a, b) => b.estimatedForce - a.estimatedForce)
            .slice(0, 3)
            .map((a) => (
              <Meter
                key={a.id}
                label={`${a.realm} — ${a.arm}`}
                value={a.estimatedForce}
                max={allySummary.largest.estimatedForce}
                display={`${formatNumber(a.estimatedForce)} men`}
                color={SERIES[2]}
                foot={`Before the walls in ${formatDays(a.mobilizeDays)} · ${a.envoy}`}
              />
            ))}
          <Facts
            items={[
              {
                label: "Total promised",
                value: `${formatNumber(allySummary.estimatedForce)} men`,
              },
              { label: "Realms silent", value: `${allySummary.silent}` },
              {
                label: "Full muster in",
                value: formatDays(allySummary.fullMusterDays),
              },
            ]}
          />
        </Panel>
      </Row>

      {/* ---- What must be decided ---------------------------------------- */}

      <Panel
        title="What the Steward must decide today"
        subtitle="Drawn from the sections above, worst standing first"
      >
        <ol className={styles.decisions}>
          <Decision
            title="Osgiliath cannot be held"
            detail="Faramir asks leave to fall back to the Rammas. Five days of victual, morale at 48,
              three hundred and nineteen wounded, and the east bank already lost."
            to="/garrisons"
            link="Garrison report"
          />
          <Decision
            title="Cair Andros has been silent three days"
            detail="With the isle gone, Anórien is open and the north road — by which Rohan must come —
              is no longer certainly ours."
            to="/mordor"
            link="The report"
          />
          <Decision
            title="The Pelennor farms render nothing further"
            detail="Eighteen per cent of quota and falling. The steadings are emptied by your own order
              and the fields fired; the shortfall must come from Lebennin by road."
            to="/provisions"
            link="The granaries"
          />
          <Decision
            title="Erech sends no iron"
            detail="Twenty-two per cent material supply at the ironworks. Every forge below the City
              slows behind it, and the magazines hold 56 per cent of the arrows the muster needs."
            to="/armoury"
            link="The forges"
          />
          <Decision
            title={`The Rohirrim are ${formatMobilizeHours(7 * 24)} out`}
            detail="Six thousand riders, the largest force promised, and the longest to arrive. Every
              other decision is really a question of holding until they come."
            to="/allies"
            link="Rohan's return"
          />
        </ol>
      </Panel>
    </Page>
  );
}

/** One garrison, with the four figures the Steward reads first. */
function GarrisonLine({ garrison }: { garrison: Garrison }) {
  return (
    <article className={styles.garrisonLine}>
      <div className={styles.garrisonName}>
        <p className={styles.garrisonTitle}>{garrison.name}</p>
        <p className={styles.garrisonStation}>
          {garrison.station} &middot; {garrison.commander}
        </p>
      </div>
      <StatusMark status={garrison.readiness} />
      <Meter
        label="Strength"
        value={garrison.strength}
        max={1500}
        display={`${formatNumber(garrison.strength)} men`}
        color={SERIES[0]}
      />
      <Meter
        label="Morale"
        value={garrison.morale}
        display={`${garrison.morale} / 100`}
        status={bandScore(garrison.morale)}
      />
      <Meter
        label="Victual"
        value={garrison.provisionDays}
        max={90}
        display={formatDays(garrison.provisionDays)}
        status={bandProvisionDays(garrison.provisionDays)}
      />
    </article>
  );
}

function Decision({
  title,
  detail,
  to,
  link,
}: {
  title: string;
  detail: string;
  to: string;
  link: string;
}) {
  return (
    <li className={styles.decision}>
      <div className={styles.decisionText}>
        <p className={styles.decisionTitle}>{title}</p>
        <p className={styles.decisionDetail}>{detail}</p>
      </div>
      <SectionLink to={to}>{link}</SectionLink>
    </li>
  );
}

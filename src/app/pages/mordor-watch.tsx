import { useDeferredValue, useMemo, useState } from "react";
import {
  IgrInput,
  IgrSelect,
  IgrSelectItem,
  type IgrComponentValueChangedEventArgs,
  type IgrSelectItemComponentEventArgs,
} from "igniteui-react";
import { IgrCategoryChart } from "igniteui-react-charts";
import {
  bandForThreat,
  formatNumber,
  intelSummary,
  mordorReports,
  reportVolume,
  severityMeta,
  threatFactors,
  threatHistory,
  threatIndex,
  type MordorReport,
  type Severity,
} from "../data";
import {
  Empty,
  Figure,
  Hero,
  Icon,
  Meter,
  Page,
  PageHeader,
  Panel,
  Prose,
  Row,
  SeverityChip,
  StatTile,
  Tiles,
} from "../ui/kit";
import { TableView } from "../ui/table-view";
import { ThreatMeter } from "../ui/threat-meter";
import { CHROME, SERIES, STATUS, barMarks, crosshairHover, valueAxisTheme } from "../ui/charts";
import styles from "./pages.module.css";

const SEVERITY_ORDER: Severity[] = ["grave", "high", "moderate", "low"];
const sources = [...new Set(mordorReports.map((r) => r.source))].sort();

export default function MordorWatch() {
  const [severity, setSeverity] = useState<Severity | "all">("all");
  const [source, setSource] = useState("all");
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const band = bandForThreat(threatIndex);

  const shown = useMemo(() => {
    const needle = deferredQuery.trim().toLowerCase();
    return mordorReports.filter((r) => {
      if (severity !== "all" && r.severity !== severity) return false;
      if (source !== "all" && r.source !== source) return false;
      if (!needle) return true;
      return (
        r.headline.toLowerCase().includes(needle) ||
        r.detail.toLowerCase().includes(needle) ||
        r.place.toLowerCase().includes(needle)
      );
    });
  }, [severity, source, deferredQuery]);

  return (
    <Page>
      <PageHeader
        eyebrow="The Enemy"
        icon="eye"
        title="Mordor Watch"
        lede="Everything received on the Enemy, newest first, with the source and the confidence the
          receiving officer placed in it. The threat meter beneath is a weighted index of six
          factors; its arithmetic is set out so it can be argued with."
      />

      <Tiles>
        <StatTile
          label="Threat of invasion"
          icon="eye"
          value={threatIndex}
          unit="/ 100"
          accent={band.color}
          caption={`Standing at "${band.label}". ${band.meaning}`}
        />
        <StatTile
          label="Grave reports"
          icon="status-critical"
          value={intelSummary.grave}
          unit={`of ${intelSummary.count}`}
          status="critical"
          caption="Four of them received within the last two days."
        />
        <StatTile
          label="Enemy counted or reckoned"
          icon="people"
          value={intelSummary.countedEnemy}
          unit="and more"
          accent={STATUS.critical}
          caption="Only where a report gave a figure. Several gave none."
        />
        <StatTile
          label="Nearest enemy"
          icon="flame"
          value="4"
          unit="leagues"
          status="critical"
          caption="The eastern ruins of Osgiliath, taken this morning."
        />
        <StatTile
          label="Reports received today"
          icon="scroll"
          value={reportVolume.at(-1)!.value}
          unit="despatches"
          accent={SERIES[3]}
          caption="Nine times the rate of the first of the month."
        />
        <StatTile
          label="Index has risen"
          icon="trend-up"
          value={`+${threatHistory.at(-1)!.value - threatHistory[0].value}`}
          unit="in nine days"
          accent={STATUS.critical}
          caption="From 38 on the first of March. It has never stood here before."
        />
      </Tiles>

      <Row cols="minmax(320px, 0.8fr) minmax(360px, 1.2fr)">
        <Panel
          title="Threat meter"
          subtitle="How imminent an assault on the City is judged to be"
        >
          <ThreatMeter index={threatIndex} size={280} />
        </Panel>

        <Panel
          title="What drives the needle"
          subtitle="The six factors, each scored 0–100 and weighted to a share of the whole"
          note={
            <>
              The index is the weighted mean of these six scores:{" "}
              {threatFactors
                .map((f) => `${Math.round(f.weight * 100)}% × ${f.score}`)
                .join(" + ")}{" "}
              = {threatIndex}.
            </>
          }
        >
          <div className={styles.factors}>
            {threatFactors.map((f) => (
              <div key={f.id} className={styles.factor}>
                <Meter
                  label={`${f.label} — ${Math.round(f.weight * 100)}% of the index`}
                  value={f.score}
                  display={`${f.score} / 100`}
                  color={STATUS.critical}
                />
                <p className={styles.factorDetail}>{f.detail}</p>
              </div>
            ))}
          </div>
          <TableView
            caption="Threat factors, scores and weights"
            columns={[
              { key: "label", header: "Factor", render: (r) => r.label },
              { key: "score", header: "Score", numeric: true, render: (r) => r.score },
              {
                key: "weight",
                header: "Weight",
                numeric: true,
                render: (r) => `${Math.round(r.weight * 100)}%`,
              },
              {
                key: "contribution",
                header: "Contribution",
                numeric: true,
                render: (r) => (r.score * r.weight).toFixed(1),
              },
            ]}
            rows={threatFactors}
            rowKey={(r) => r.id}
          />
        </Panel>
      </Row>

      <Row>
        <Panel
          title="How the threat has moved"
          subtitle="Composite index, 1 to 10 March 3019"
        >
          <Figure height={240} caption="One series; the hover layer and the table carry the values.">
            {/* The index means "bad", so it wears the reserved critical colour
                rather than a categorical slot. */}
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
          <TableView
            caption="Composite threat index by day, March 3019"
            columns={[
              { key: "period", header: "Day", render: (r) => r.period },
              { key: "value", header: "Index", numeric: true, render: (r) => r.value },
            ]}
            rows={threatHistory}
            rowKey={(r) => r.period}
          />
        </Panel>

        <Panel
          title="Despatches received per day"
          subtitle="How fast word is now coming in"
          note="Rising report volume is itself a signal: it means the Enemy is moving in the open
            and no longer troubling to conceal it."
        >
          <Figure height={240} caption="One measure, so every bar takes the same hue.">
            <IgrCategoryChart
              dataSource={reportVolume}
              chartType="column"
              includedProperties={["period", "value"]}
              brushes={[SERIES[0]]}
              {...barMarks}
              yAxisTitle="Despatches"
              {...valueAxisTheme}
              {...crosshairHover}
            />
          </Figure>
          <TableView
            caption="Despatches received per day"
            columns={[
              { key: "period", header: "Day", render: (r) => r.period },
              { key: "value", header: "Despatches", numeric: true, render: (r) => r.value },
            ]}
            rows={reportVolume}
            rowKey={(r) => r.period}
          />
        </Panel>
      </Row>

      {/* One filter row above the despatches it scopes. */}
      <div className={styles.filters}>
        <div className={styles.filterField}>
          <IgrSelect
            label="Severity"
            value={severity}
            onChange={(e: IgrSelectItemComponentEventArgs) =>
              setSeverity(e.detail.value as Severity | "all")
            }
          >
            <IgrSelectItem value="all">All severities</IgrSelectItem>
            {SEVERITY_ORDER.map((s) => (
              <IgrSelectItem key={s} value={s}>
                {severityMeta[s].label}
              </IgrSelectItem>
            ))}
          </IgrSelect>
        </div>
        <div className={styles.filterField}>
          <IgrSelect
            label="Source"
            value={source}
            onChange={(e: IgrSelectItemComponentEventArgs) => setSource(e.detail.value as string)}
          >
            <IgrSelectItem value="all">All sources</IgrSelectItem>
            {sources.map((s) => (
              <IgrSelectItem key={s} value={s}>
                {s}
              </IgrSelectItem>
            ))}
          </IgrSelect>
        </div>
        <div className={styles.filterField}>
          <IgrInput
            label="Search"
            placeholder="Place, headline or detail"
            value={query}
            onInput={(e: IgrComponentValueChangedEventArgs) => setQuery(e.detail)}
          />
        </div>
        <span className={styles.filterSpacer} />
        <p className={styles.filterCount}>
          Showing {shown.length} of {mordorReports.length} despatches
        </p>
      </div>

      <Panel
        title="Despatches"
        subtitle="Newest first. Each carries its source, the confidence placed in it, and the enemy numbers where any could be counted."
      >
        {shown.length === 0 ? (
          <Empty icon="scroll">
            No despatch answers to that description. Clear the filters to read them all.
          </Empty>
        ) : (
          <ol className={styles.timeline}>
            {shown.map((report) => (
              <ReportEntry key={report.id} report={report} />
            ))}
          </ol>
        )}
      </Panel>

      <Panel title="The Steward's own reading">
        <Hero
          value={`${threatIndex} / 100`}
          caption={
            <>
              <strong>{band.label}.</strong> {band.meaning}
            </>
          }
          color={band.color}
        />
        <Prose>
          Fifty thousand of the Enemy are counted or reckoned within three days&rsquo; march. Osgiliath
          is taken, Cair Andros is silent, the Rammas is breached, and the road by which Rohan must
          come has been felled across in the Drúadan wood. Against this the City can set five
          thousand eight hundred and fifty men on its own walls and sixteen thousand promised from
          the fiefs and from Rohan, of which the greater part is still seven days out.
        </Prose>
        <Prose>
          The index does not measure whether the City can be held. It measures how little time is
          left before that question is put. On the reckoning above, that time is hours.
        </Prose>
      </Panel>
    </Page>
  );
}

function ReportEntry({ report }: { report: MordorReport }) {
  return (
    <li className={styles.report}>
      <div className={styles.reportWhen}>
        <p className={styles.reportDate}>{report.date}</p>
        <p className={styles.reportSource}>{report.source}</p>
        <SeverityChip severity={report.severity} />
      </div>
      <div className={styles.reportBody}>
        <div className={styles.reportHeadRow}>
          <h3 className={styles.reportHeadline}>{report.headline}</h3>
        </div>
        <p className={styles.reportMeta}>
          <span>
            <Icon name="eye" /> {report.place}
          </span>
          <span>
            <Icon name="scroll" /> Confidence {report.confidence}%
          </span>
          {report.enemyStrength !== null ? (
            <span>
              <Icon name="people" /> {formatNumber(report.enemyStrength)} counted
            </span>
          ) : (
            <span>
              <Icon name="people" /> Numbers not counted
            </span>
          )}
        </p>
        <p className={styles.reportDetail}>{report.detail}</p>
      </div>
    </li>
  );
}

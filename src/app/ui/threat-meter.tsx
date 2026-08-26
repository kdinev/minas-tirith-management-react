import { IgrRadialGauge, IgrRadialGaugeRange } from "igniteui-react-gauges";
import { bandForThreat, threatBands, type ThreatBand } from "../data";
import { CHROME, STATUS } from "./charts";
import { Icon } from "./kit";
import styles from "./threat-meter.module.css";

/** Reserved status colour per band, as literal hex for the gauge's canvas. */
const BAND_BRUSH: Record<string, string> = {
  Watchful: STATUS.good,
  Gathering: STATUS.warning,
  Imminent: STATUS.serious,
  "At the Gate": STATUS.critical,
};

/**
 * How imminent an assault is, on one 0–100 dial.
 *
 * The needle is never the only channel: the band's name, its glyph and the
 * index itself are printed beside it, and the four arcs are labelled below. A
 * reader who cannot separate the arc colours still gets the answer in words.
 */
export function ThreatMeter({
  index,
  size = 260,
  showBands = true,
}: {
  index: number;
  /** Height of the dial in pixels. The gauge fills its box. */
  size?: number;
  showBands?: boolean;
}) {
  const band = bandForThreat(index);
  return (
    <div className={styles.meter}>
      <div className={styles.dial} style={{ height: size }}>
        <div className={styles.dialCanvas}>
          <IgrRadialGauge
          value={index}
          minimumValue={0}
          maximumValue={100}
          interval={25}
          labelInterval={25}
          labelExtent={0.62}
          minorTickCount={4}
          /* A 240° arc opening at the bottom, so the needle stands upright at
             the worst reading rather than pointing off the page. */
          scaleStartAngle={150}
          scaleEndAngle={30}
          scaleStartExtent={0.7}
          scaleEndExtent={0.78}
          scaleBrush={CHROME.track}
          scaleOversweep={0}
          backingBrush="transparent"
          backingOutline="transparent"
          backingStrokeThickness={0}
          fontBrush={CHROME.inkMuted}
          font="12px Titillium Web, Segoe UI, sans-serif"
          tickBrush={CHROME.axis}
          tickStartExtent={0.64}
          tickEndExtent={0.7}
          tickStrokeThickness={1.5}
          minorTickBrush={CHROME.grid}
          minorTickStartExtent={0.66}
          minorTickEndExtent={0.7}
          minorTickStrokeThickness={1}
          needleBrush={CHROME.inkPrimary}
          needleOutline={CHROME.surface}
          needleStrokeThickness={1}
          needleShape="NeedleWithBulb"
          needleStartExtent={0.05}
          needleEndExtent={0.68}
          needlePivotShape="CircleOverlay"
          needlePivotBrush={CHROME.inkPrimary}
          needlePivotOutline={CHROME.surface}
          transitionDuration={900}
          isNeedleDraggingEnabled={false}
          rangeBrushes={threatBands.map((b) => BAND_BRUSH[b.label])}
          rangeOutlines={threatBands.map((b) => BAND_BRUSH[b.label])}
        >
          {threatBands.map((b) => (
            <IgrRadialGaugeRange
              key={b.label}
              name={b.label}
              startValue={b.min}
              endValue={b.max}
              brush={BAND_BRUSH[b.label]}
              outline={CHROME.surface}
              strokeThickness={2}
              innerStartExtent={0.79}
              innerEndExtent={0.79}
              outerStartExtent={0.9}
              outerEndExtent={0.9}
            />
          ))}
          </IgrRadialGauge>
        </div>

        {/* The reading in words and figures, over the dial's open bottom. */}
        <div className={styles.readout}>
          <p className={styles.readoutIndex} style={{ color: band.ink }}>
            {index}
          </p>
          <p className={styles.readoutBand}>
            <Icon name={band.icon} />
            {band.label}
          </p>
        </div>
      </div>

      {showBands ? <BandKey current={band} /> : null}
    </div>
  );
}

/** The four bands and what each means, with the standing one marked. */
export function BandKey({ current }: { current: ThreatBand }) {
  return (
    <ul className={styles.bands}>
      {threatBands.map((b) => {
        const standing = b.label === current.label;
        return (
          <li
            key={b.label}
            className={standing ? `${styles.band} ${styles.bandStanding}` : styles.band}
            style={{ "--band-color": b.color, "--band-ink": b.ink } as React.CSSProperties}
            aria-current={standing ? "true" : undefined}
          >
            <span className={styles.bandHead}>
              <span className={styles.bandSwatch} />
              <span className={styles.bandName}>{b.label}</span>
              <span className={styles.bandRange}>
                {b.min}&ndash;{b.max}
              </span>
              {standing ? <span className={styles.bandNow}>Standing</span> : null}
            </span>
            <span className={styles.bandMeaning}>{b.meaning}</span>
          </li>
        );
      })}
    </ul>
  );
}

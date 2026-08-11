/**
 * Domain model for the Steward's console.
 *
 * `Readiness` is the single status scale used across every section, so a colour
 * or an icon means the same thing on the garrison roll as it does on the supply
 * ledger. It maps onto the reserved status palette (good / warning / serious /
 * critical) and is always rendered with a label beside it.
 */
export type Readiness = "ready" | "strained" | "depleted" | "critical";

/** Direction of the last reported change. */
export type Trend = "rising" | "steady" | "falling";

/** A fortified position that reports to the Citadel. */
export interface Garrison {
  id: string;
  name: string;
  /** Where it stands — circle of the City, or a position on the Anduin. */
  station: string;
  commander: string;
  /** Men-at-arms currently on the muster roll. */
  strength: number;
  /** Breakdown of the strength figure. */
  infantry: number;
  archers: number;
  horse: number;
  /** 0–100. Spirit of the men as judged by their captain. */
  morale: number;
  moraleTrend: Trend;
  /** 0–100. Share of the roll fit to stand in the line. */
  health: number;
  /** Men in the houses of healing or otherwise unfit. */
  wounded: number;
  /** Days of victual in store at present issue. */
  provisionDays: number;
  /** Arrows and quarrels in the magazine. */
  shafts: number;
  readiness: Readiness;
  /** Days since the last rider came in with a report. */
  reportAgeDays: number;
  note: string;
}

/** A captain or lieutenant in the chain of command. */
export interface Commander {
  id: string;
  name: string;
  rank: string;
  /** Formal office, where one is held. */
  title: string;
  station: string;
  /** `null` marks the head of the chain — the Steward himself. */
  reportsTo: string | null;
  /** Hours from the order being given to the force standing ready to march. */
  mobilizeHours: number;
  /** Men this officer can bring to the muster, his own command included. */
  mobilizableForce: number;
  readiness: Readiness;
  note: string;
}

/** One period of a production or output series. */
export interface OutputPoint {
  /** Label for the category axis — a month of the Steward's Reckoning. */
  period: string;
  value: number;
}

/** A fief or port victualling the City. */
export interface FoodSupplier {
  id: string;
  name: string;
  region: string;
  /** What they send — grain, cattle, fish, wine. */
  goods: string;
  /** 0–100. Share of the levied quota they can presently meet. */
  availability: number;
  /** Sacks-equivalent delivered in the last full month. */
  monthlyOutput: number;
  /** Sacks-equivalent the fief is bound to render each month. */
  quota: number;
  /** Days on the road from the fief to the granaries of the City. */
  transitDays: number;
  readiness: Readiness;
  note: string;
}

/** A forge, foundry or bowyer arming the City. */
export interface ArmorySupplier {
  id: string;
  name: string;
  location: string;
  /** Blades, mail, shafts, engines. */
  specialty: string;
  /** Smiths and journeymen at the anvils. */
  smiths: number;
  /** Finished pieces struck in the last full week. */
  weeklyOutput: number;
  /** Pieces the forge can strike in a week when fully supplied. */
  capacity: number;
  /** 0–100. Iron, charcoal and stave-wood on hand against need. */
  materialSupply: number;
  readiness: Readiness;
  note: string;
}

/** A realm or fief that may answer the summons. */
export interface Ally {
  id: string;
  realm: string;
  /** Who speaks for them. */
  envoy: string;
  /** Men presently under arms in that realm. */
  troopsAvailable: number;
  /** Men they are judged able to send to the Pelennor. */
  estimatedForce: number;
  /** Days from the summons to their arrival before the walls. */
  mobilizeDays: number;
  /** Leagues of road between them and the City. */
  distanceLeagues: number;
  /** 0–100. How readily they are judged to answer. */
  willingness: number;
  /** Chief arm of their host. */
  arm: string;
  readiness: Readiness;
  /** The last word received, and when. */
  lastWord: string;
}

/** Severity as assessed by the officer who received the report. */
export type Severity = "low" | "moderate" | "high" | "grave";

/** An intelligence report on the Enemy. */
export interface MordorReport {
  id: string;
  /** Day of the Steward's Reckoning, 3019. */
  date: string;
  /** Rangers, scouts, watchmen of the Rammas, the palantír. */
  source: string;
  place: string;
  headline: string;
  severity: Severity;
  /** 0–100. Confidence the officer places in the report. */
  confidence: number;
  /** Enemy numbers, where they could be counted or guessed. */
  enemyStrength: number | null;
  detail: string;
}

/** One component of the composite threat assessment. */
export interface ThreatFactor {
  id: string;
  label: string;
  /** 0–100. */
  score: number;
  /** Share of the composite index, 0–1. */
  weight: number;
  detail: string;
}

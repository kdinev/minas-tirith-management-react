import { commanders } from "./command";
import { garrisons } from "./garrisons";
import { allies } from "./allies";
import { foodSuppliers } from "./provisions";
import { armorySuppliers } from "./armory";
import { mordorReports, threatFactors } from "./mordor";
import type { Commander, Readiness, Severity, Trend } from "./types";

export * from "./types";
export * from "./garrisons";
export * from "./command";
export * from "./provisions";
export * from "./armory";
export * from "./allies";
export * from "./mordor";

/* ------------------------------------------------------------------------- *
 * Status vocabulary
 *
 * One place decides what each readiness state is called, which reserved status
 * colour it wears and which glyph accompanies it — so state never rides on
 * colour alone, and the same state reads identically on every page.
 * ------------------------------------------------------------------------- */

export interface StatusMeta {
  label: string;
  /** CSS custom property holding the reserved status colour, as a mark. */
  color: string;
  /**
   * The same status as ink. `color` is a mark colour and three of the four are
   * too light to carry text or a glyph on the console's surfaces, so anything
   * that paints a figure or an icon uses this darker twin instead.
   */
  ink: string;
  /** Registered icon name in the `mt` collection. */
  icon: string;
  /** Rank for sorting worst-first. */
  weight: number;
}

export const readinessMeta: Record<Readiness, StatusMeta> = {
  ready: { label: "Ready", color: "var(--mt-good)", ink: "var(--mt-good-ink)", icon: "status-ready", weight: 0 },
  strained: { label: "Strained", color: "var(--mt-warning)", ink: "var(--mt-warning-ink)", icon: "status-strained", weight: 1 },
  depleted: { label: "Depleted", color: "var(--mt-serious)", ink: "var(--mt-serious-ink)", icon: "status-depleted", weight: 2 },
  critical: { label: "Critical", color: "var(--mt-critical)", ink: "var(--mt-critical-ink)", icon: "status-critical", weight: 3 },
};

export const severityMeta: Record<Severity, StatusMeta> = {
  low: { label: "Low", color: "var(--mt-good)", ink: "var(--mt-good-ink)", icon: "status-ready", weight: 0 },
  moderate: { label: "Moderate", color: "var(--mt-warning)", ink: "var(--mt-warning-ink)", icon: "status-strained", weight: 1 },
  high: { label: "High", color: "var(--mt-serious)", ink: "var(--mt-serious-ink)", icon: "status-depleted", weight: 2 },
  grave: { label: "Grave", color: "var(--mt-critical)", ink: "var(--mt-critical-ink)", icon: "status-critical", weight: 3 },
};

export const trendMeta: Record<Trend, { label: string; icon: string }> = {
  rising: { label: "Rising", icon: "trend-up" },
  steady: { label: "Steady", icon: "trend-flat" },
  falling: { label: "Falling", icon: "trend-down" },
};

/**
 * Turns a 0–100 score into a readiness band. Used for morale, health, supply
 * availability and willingness, so all of them band the same way.
 */
export function bandScore(score: number): Readiness {
  if (score >= 75) return "ready";
  if (score >= 55) return "strained";
  if (score >= 35) return "depleted";
  return "critical";
}

/** Days of victual banded against how long a siege is expected to last. */
export function bandProvisionDays(days: number): Readiness {
  if (days >= 45) return "ready";
  if (days >= 21) return "strained";
  if (days >= 10) return "depleted";
  return "critical";
}

/* ------------------------------------------------------------------------- *
 * The threat index
 * ------------------------------------------------------------------------- */

/** Weighted mean of the threat factors, 0–100, rounded to the nearest whole. */
export const threatIndex = Math.round(
  threatFactors.reduce((sum, f) => sum + f.score * f.weight, 0) /
    threatFactors.reduce((sum, f) => sum + f.weight, 0),
);

export interface ThreatBand {
  label: string;
  /** What the band means, in one line. */
  meaning: string;
  /** The band as a mark — the dial's arc, the key's swatch, the badge wash. */
  color: string;
  /** The band as ink — the readout figure, the badge glyph. See `StatusMeta`. */
  ink: string;
  icon: string;
  min: number;
  max: number;
}

/** The four bands the needle can stand in. Contiguous and ordered. */
export const threatBands: ThreatBand[] = [
  {
    label: "Watchful",
    meaning: "The Enemy stirs, but no host is on the march.",
    color: "var(--mt-good)",
    ink: "var(--mt-good-ink)",
    icon: "status-ready",
    min: 0,
    max: 25,
  },
  {
    label: "Gathering",
    meaning: "Hosts are mustering beyond the river. Weeks, not days.",
    color: "var(--mt-warning)",
    ink: "var(--mt-warning-ink)",
    icon: "status-strained",
    min: 25,
    max: 50,
  },
  {
    label: "Imminent",
    meaning: "The vanguard is across the Anduin. Days.",
    color: "var(--mt-serious)",
    ink: "var(--mt-serious-ink)",
    icon: "status-depleted",
    min: 50,
    max: 75,
  },
  {
    label: "At the Gate",
    meaning: "Assault expected within hours. The siege has begun.",
    color: "var(--mt-critical)",
    ink: "var(--mt-critical-ink)",
    icon: "status-critical",
    min: 75,
    max: 100,
  },
];

export function bandForThreat(index: number): ThreatBand {
  return threatBands.find((b) => index < b.max) ?? threatBands[threatBands.length - 1];
}

/* ------------------------------------------------------------------------- *
 * The chain of command as a tree
 * ------------------------------------------------------------------------- */

export interface CommandNode extends Commander {
  /** Officers reporting directly to this one, ordered by force descending. */
  reports: CommandNode[];
  /** Men under this officer that are not under a named subordinate. */
  directForce: number;
  /** Longest mobilization time anywhere in this officer's chain, in hours. */
  chainMobilizeHours: number;
  /** How many officers sit beneath, at any depth. */
  chainSize: number;
  depth: number;
}

/**
 * Builds the org chart from the flat roll.
 *
 * Throws on a dangling `reportsTo` or a missing root rather than silently
 * dropping officers — a captain quietly absent from the Steward's chart is
 * worse than a loud failure.
 */
export function buildCommandTree(roll: Commander[] = commanders): CommandNode {
  const byId = new Map<string, CommandNode>();
  for (const officer of roll) {
    byId.set(officer.id, {
      ...officer,
      reports: [],
      directForce: officer.mobilizableForce,
      chainMobilizeHours: officer.mobilizeHours,
      chainSize: 0,
      depth: 0,
    });
  }

  let root: CommandNode | undefined;
  for (const officer of roll) {
    const node = byId.get(officer.id)!;
    if (officer.reportsTo === null) {
      if (root) throw new Error(`Two officers claim the head of the chain: ${root.id}, ${node.id}`);
      root = node;
      continue;
    }
    const superior = byId.get(officer.reportsTo);
    if (!superior) {
      throw new Error(`${officer.name} reports to "${officer.reportsTo}", who is not on the roll`);
    }
    superior.reports.push(node);
  }
  if (!root) throw new Error("No officer heads the chain of command");

  // One post-order pass fills in everything derived from the subtree.
  const settle = (node: CommandNode, depth: number): void => {
    node.depth = depth;
    node.reports.sort((a, b) => b.mobilizableForce - a.mobilizableForce);
    let beneath = 0;
    for (const child of node.reports) {
      settle(child, depth + 1);
      beneath += child.mobilizableForce;
      node.chainSize += child.chainSize + 1;
      node.chainMobilizeHours = Math.max(node.chainMobilizeHours, child.chainMobilizeHours);
    }
    node.directForce = node.mobilizableForce - beneath;
    if (import.meta.env.DEV && node.directForce < 0) {
      console.warn(
        `${node.name} musters ${node.mobilizableForce} men but his subordinates total ${beneath}.`,
      );
    }
  };
  settle(root, 0);
  return root;
}

/** Flattens the tree depth-first, so a list view keeps the chart's order. */
export function flattenCommandTree(node: CommandNode): CommandNode[] {
  return [node, ...node.reports.flatMap(flattenCommandTree)];
}

/* ------------------------------------------------------------------------- *
 * Roll-ups for the overview
 * ------------------------------------------------------------------------- */

const strengthTotal = garrisons.reduce((n, g) => n + g.strength, 0);

/** Mean weighted by garrison strength — a 240-man refuge must not out-vote the Gate. */
function weightedMean(pick: (g: (typeof garrisons)[number]) => number): number {
  return Math.round(garrisons.reduce((n, g) => n + pick(g) * g.strength, 0) / strengthTotal);
}

export const garrisonSummary = {
  count: garrisons.length,
  strength: strengthTotal,
  infantry: garrisons.reduce((n, g) => n + g.infantry, 0),
  archers: garrisons.reduce((n, g) => n + g.archers, 0),
  horse: garrisons.reduce((n, g) => n + g.horse, 0),
  wounded: garrisons.reduce((n, g) => n + g.wounded, 0),
  shafts: garrisons.reduce((n, g) => n + g.shafts, 0),
  morale: weightedMean((g) => g.morale),
  health: weightedMean((g) => g.health),
  /** The garrison that will run out of victual first is the one that matters. */
  leanestProvisionDays: Math.min(...garrisons.map((g) => g.provisionDays)),
  critical: garrisons.filter((g) => g.readiness === "critical").length,
  stale: garrisons.filter((g) => g.reportAgeDays >= 2).length,
};

export const allySummary = {
  count: allies.length,
  /** Realms that have answered in some form. */
  answering: allies.filter((a) => a.estimatedForce > 0).length,
  silent: allies.filter((a) => a.estimatedForce === 0).length,
  troopsAvailable: allies.reduce((n, a) => n + a.troopsAvailable, 0),
  estimatedForce: allies.reduce((n, a) => n + a.estimatedForce, 0),
  /** When the last of the answering realms is expected before the walls. */
  fullMusterDays: Math.max(...allies.filter((a) => a.estimatedForce > 0).map((a) => a.mobilizeDays)),
  /** The single largest contingent — Rohan, as it happens. */
  largest: allies.reduce((best, a) => (a.estimatedForce > best.estimatedForce ? a : best)),
};

export const provisionSummary = {
  count: foodSuppliers.length,
  monthlyOutput: foodSuppliers.reduce((n, s) => n + s.monthlyOutput, 0),
  quota: foodSuppliers.reduce((n, s) => n + s.quota, 0),
  get shortfall() {
    return this.quota - this.monthlyOutput;
  },
  get quotaMet() {
    return Math.round((this.monthlyOutput / this.quota) * 100);
  },
  failing: foodSuppliers.filter((s) => s.readiness === "critical" || s.readiness === "depleted")
    .length,
};

export const armorySummary = {
  count: armorySuppliers.length,
  smiths: armorySuppliers.reduce((n, s) => n + s.smiths, 0),
  weeklyOutput: armorySuppliers.reduce((n, s) => n + s.weeklyOutput, 0),
  capacity: armorySuppliers.reduce((n, s) => n + s.capacity, 0),
  get utilisation() {
    return Math.round((this.weeklyOutput / this.capacity) * 100);
  },
  starved: armorySuppliers.filter((s) => s.materialSupply < 40).length,
};

export const intelSummary = {
  count: mordorReports.length,
  grave: mordorReports.filter((r) => r.severity === "grave").length,
  /** Enemy numbers counted or reckoned, where a report gave a figure. */
  countedEnemy: mordorReports.reduce((n, r) => n + (r.enemyStrength ?? 0), 0),
  latest: mordorReports[0],
};

/* ------------------------------------------------------------------------- *
 * Formatting
 * ------------------------------------------------------------------------- */

const wholeNumber = new Intl.NumberFormat("en-GB");

export const formatNumber = (n: number): string => wholeNumber.format(n);

/** Compact figures for tiles and axis labels: 12500 → "12.5k". */
export function formatCompact(n: number): string {
  if (Math.abs(n) >= 1000) {
    const thousands = n / 1000;
    return `${thousands >= 100 ? Math.round(thousands) : thousands.toFixed(1).replace(/\.0$/, "")}k`;
  }
  return wholeNumber.format(n);
}

/** Hours as the Steward would read them: "4 hrs", "2 days", "4½ days". */
export function formatMobilizeHours(hours: number): string {
  if (hours === 0) return "At once";
  if (hours < 24) return `${hours} hr${hours === 1 ? "" : "s"}`;
  const days = hours / 24;
  return `${days % 1 === 0 ? days : days.toFixed(1)} days`;
}

export const formatDays = (days: number): string => `${days} day${days === 1 ? "" : "s"}`;

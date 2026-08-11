import { expect, test } from "vitest";
import {
  allies,
  allySummary,
  armorySuppliers,
  armorySummary,
  bandForThreat,
  buildCommandTree,
  commanders,
  flattenCommandTree,
  foodSuppliers,
  garrisonSummary,
  garrisons,
  granaryIntake,
  magazineStock,
  musterHistory,
  provisionSummary,
  threatBands,
  threatFactors,
  threatIndex,
  type Commander,
} from ".";
import { navSections } from "../shell/nav";

/*
 * These are consistency checks, not behaviour tests. Every figure on the console
 * is derived from this data, and several of them are the *same* figure reached by
 * two different routes — a roll-up tile and the last point of a series, say. When
 * those disagree the console quietly lies, and nothing else catches it.
 */

test("each garrison's strength is the sum of its arms", () => {
  for (const g of garrisons) {
    expect(g.infantry + g.archers + g.horse, g.name).toBe(g.strength);
  }
});

test("the muster roll series ends at the present garrison strength", () => {
  expect(musterHistory.at(-1)!.value).toBe(garrisonSummary.strength);
});

test("arrows counted in the garrison magazines match the armoury's stock line", () => {
  const arrows = magazineStock.find((line) => line.id === "arrows")!;
  expect(garrisonSummary.shafts).toBe(arrows.inStore);
});

test("granary intake ends at the sum of what the victuallers render", () => {
  expect(granaryIntake.at(-1)!.value).toBe(provisionSummary.monthlyOutput);
  expect(provisionSummary.monthlyOutput).toBe(
    foodSuppliers.reduce((n, s) => n + s.monthlyOutput, 0),
  );
});

test("no forge is reported striking more than its own capacity", () => {
  for (const forge of armorySuppliers) {
    expect(forge.weeklyOutput, forge.name).toBeLessThanOrEqual(forge.capacity);
  }
  expect(armorySummary.utilisation).toBeLessThanOrEqual(100);
});

test("no realm is reported sending more men than it has under arms", () => {
  for (const ally of allies) {
    expect(ally.estimatedForce, ally.realm).toBeLessThanOrEqual(ally.troopsAvailable);
  }
  expect(allySummary.answering + allySummary.silent).toBe(allies.length);
});

test("threat factor weights sum to one, and the index is their weighted mean", () => {
  const total = threatFactors.reduce((n, f) => n + f.weight, 0);
  expect(total).toBeCloseTo(1, 6);
  const expected = Math.round(threatFactors.reduce((n, f) => n + f.score * f.weight, 0) / total);
  expect(threatIndex).toBe(expected);
});

test("the threat bands are contiguous and cover the whole scale", () => {
  expect(threatBands[0].min).toBe(0);
  expect(threatBands.at(-1)!.max).toBe(100);
  for (let i = 1; i < threatBands.length; i++) {
    expect(threatBands[i].min).toBe(threatBands[i - 1].max);
  }
  // Every point on the scale resolves to exactly one band, boundaries included.
  for (const value of [0, 24, 25, 49, 50, 74, 75, 99, 100]) {
    expect(bandForThreat(value)).toBeTruthy();
  }
});

test("the command tree holds every officer exactly once", () => {
  const flat = flattenCommandTree(buildCommandTree());
  expect(flat).toHaveLength(commanders.length);
  expect(new Set(flat.map((o) => o.id)).size).toBe(commanders.length);
});

test("no officer's command is smaller than the sum of his subordinates'", () => {
  for (const node of flattenCommandTree(buildCommandTree())) {
    expect(node.directForce, node.name).toBeGreaterThanOrEqual(0);
  }
});

test("men held directly across the chain sum to the whole host", () => {
  const tree = buildCommandTree();
  const direct = flattenCommandTree(tree).reduce((n, o) => n + o.directForce, 0);
  expect(direct).toBe(tree.mobilizableForce);
});

test("a dangling superior is a loud failure, not a quietly dropped officer", () => {
  const broken: Commander[] = [
    ...commanders,
    { ...commanders[1], id: "orphan", name: "Orphan", reportsTo: "no-such-officer" },
  ];
  expect(() => buildCommandTree(broken)).toThrow(/not on the roll/);
});

test("a chain with no head is rejected", () => {
  const headless = commanders.filter((c) => c.reportsTo !== null);
  expect(() => buildCommandTree(headless)).toThrow();
});

test("every drawer section has a distinct path", () => {
  const paths = navSections.map((s) => s.path);
  expect(new Set(paths).size).toBe(paths.length);
});

import type { ArmorySupplier, OutputPoint } from "./types";

/** Forges, foundries and bowyers arming the City, as returned by the Master of the Armoury. */
export const armorySuppliers: ArmorySupplier[] = [
  {
    id: "citadel-forges",
    name: "Citadel Forges",
    location: "Minas Tirith, Sixth Circle",
    specialty: "Blades, plate, helms",
    smiths: 96,
    weeklyOutput: 410,
    capacity: 520,
    materialSupply: 74,
    readiness: "ready",
    note: "The best hands in Gondor. Charcoal is the binding want, not skill.",
  },
  {
    id: "gate-armoury",
    name: "The Gate Armoury",
    location: "Minas Tirith, First Circle",
    specialty: "Spears, shafts, shields",
    smiths: 148,
    weeklyOutput: 1920,
    capacity: 2200,
    materialSupply: 61,
    readiness: "strained",
    note: "Working night-shifts on arrow-shafts. Stave-wood down to nine days.",
  },
  {
    id: "lossarnach-foundry",
    name: "Lossarnach Foundries",
    location: "Lossarnach",
    specialty: "Mail, hauberks, axe-heads",
    smiths: 112,
    weeklyOutput: 640,
    capacity: 800,
    materialSupply: 69,
    readiness: "ready",
    note: "Water-driven hammers. Renders on time and to measure.",
  },
  {
    id: "morthond-bowyers",
    name: "Morthond Bowyers",
    location: "Blackroot Vale",
    specialty: "Bows, arrows",
    smiths: 74,
    weeklyOutput: 2400,
    capacity: 2600,
    materialSupply: 81,
    readiness: "ready",
    note: "Finest yew in the realm. Eleven days on the road to the City.",
  },
  {
    id: "pelargir-yards",
    name: "Pelargir Yards",
    location: "Pelargir",
    specialty: "Engines, iron fittings, bolts",
    smiths: 88,
    weeklyOutput: 310,
    capacity: 700,
    materialSupply: 34,
    readiness: "depleted",
    note: "Half the yards turned to warding the haven. Iron from Erech no longer arrives.",
  },
  {
    id: "erech-ironworks",
    name: "Erech Ironworks",
    location: "Lamedon, under the Stone",
    specialty: "Pig iron, billets, nails",
    smiths: 64,
    weeklyOutput: 180,
    capacity: 460,
    materialSupply: 22,
    readiness: "critical",
    note: "Ore-carts halted. Without billets from Erech every forge below the City slows.",
  },
  {
    id: "dol-amroth-armourers",
    name: "Dol Amroth Armourers",
    location: "Dol Amroth",
    specialty: "Plate, lances, barding",
    smiths: 82,
    weeklyOutput: 290,
    capacity: 360,
    materialSupply: 77,
    readiness: "ready",
    note: "Arming the Swan Knights first, by the Prince's leave.",
  },
  {
    id: "anfalas-tanneries",
    name: "Anfalas Tanneries",
    location: "The Langstrand",
    specialty: "Jerkins, straps, quivers",
    smiths: 58,
    weeklyOutput: 520,
    capacity: 620,
    materialSupply: 66,
    readiness: "strained",
    note: "Leather enough, carriage lacking. Thirteen days by the coast road.",
  },
];

/**
 * Pieces struck each week, by kind. Four series on a line chart, so slots 1–4
 * are assigned in order and each line carries a direct label at its end.
 */
export interface SmithingWeekPoint {
  period: string;
  Shafts: number;
  Blades: number;
  Mail: number;
  Engines: number;
}

export const smithingSeriesKeys = ["Shafts", "Blades", "Mail", "Engines"] as const;

export const smithingByWeek: SmithingWeekPoint[] = [
  { period: "Week 1", Shafts: 4100, Blades: 640, Mail: 780, Engines: 22 },
  { period: "Week 2", Shafts: 4260, Blades: 690, Mail: 760, Engines: 26 },
  { period: "Week 3", Shafts: 4480, Blades: 720, Mail: 730, Engines: 24 },
  { period: "Week 4", Shafts: 4610, Blades: 700, Mail: 690, Engines: 19 },
  { period: "Week 5", Shafts: 4320, Blades: 660, Mail: 640, Engines: 14 },
];

/** Finished pieces struck in the last full week, by forge. One measure — one hue. */
export const outputByLocation: OutputPoint[] = [
  { period: "Morthond", value: 2400 },
  { period: "Gate Armoury", value: 1920 },
  { period: "Lossarnach", value: 640 },
  { period: "Anfalas", value: 520 },
  { period: "Citadel", value: 410 },
  { period: "Pelargir", value: 310 },
  { period: "Dol Amroth", value: 290 },
  { period: "Erech", value: 180 },
];

/** What stands in the magazines of the City against what the muster requires. */
export interface StockLine {
  id: string;
  item: string;
  inStore: number;
  required: number;
  unit: string;
}

export const magazineStock: StockLine[] = [
  { id: "arrows", item: "Arrows and quarrels", inStore: 225200, required: 400000, unit: "shafts" },
  { id: "spears", item: "Spears and pikes", inStore: 8400, required: 11000, unit: "pieces" },
  { id: "swords", item: "Swords and axes", inStore: 6900, required: 7500, unit: "pieces" },
  { id: "mail", item: "Mail and hauberks", inStore: 5200, required: 8800, unit: "suits" },
  { id: "shields", item: "Shields", inStore: 7100, required: 9000, unit: "pieces" },
  { id: "engines", item: "Engines and trebuchets", inStore: 34, required: 60, unit: "engines" },
];

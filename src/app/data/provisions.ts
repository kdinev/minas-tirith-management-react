import type { FoodSupplier, OutputPoint } from "./types";

/** Fiefs and ports bound to victual the City, as returned by the Warden of the Granaries. */
export const foodSuppliers: FoodSupplier[] = [
  {
    id: "lossarnach",
    name: "Lossarnach",
    region: "Vale of Anduin, south of the City",
    goods: "Grain, orchard fruit, cattle",
    availability: 82,
    monthlyOutput: 14800,
    quota: 18000,
    transitDays: 2,
    readiness: "ready",
    note: "Forlong renders in full but holds back seed-corn against the summer.",
  },
  {
    id: "lebennin",
    name: "Lebennin",
    region: "Between Anduin and Gilrain",
    goods: "Grain, cattle, river fish",
    availability: 71,
    monthlyOutput: 19600,
    quota: 27500,
    transitDays: 5,
    readiness: "strained",
    note: "Carters will not take the coast road while Corsair sail is reported.",
  },
  {
    id: "pelennor",
    name: "The Pelennor Farmlands",
    region: "Townlands within the Rammas",
    goods: "Grain, roots, vegetables",
    availability: 18,
    monthlyOutput: 3100,
    quota: 17000,
    transitDays: 0,
    readiness: "critical",
    note: "Steadings emptied by order and the fields fired. No further rendering expected.",
  },
  {
    id: "pelargir",
    name: "Pelargir",
    region: "Mouths of Anduin",
    goods: "Salt fish, oil, imported grain",
    availability: 44,
    monthlyOutput: 8200,
    quota: 18500,
    transitDays: 6,
    readiness: "depleted",
    note: "The haven is watched. Two grain hulks taken at the Ethir last month.",
  },
  {
    id: "ringlo",
    name: "Ringló Vale",
    region: "Between Morthond and Gilrain",
    goods: "Grain, wine, mutton",
    availability: 76,
    monthlyOutput: 6900,
    quota: 9000,
    transitDays: 8,
    readiness: "strained",
    note: "Renders willingly, but the wains are nine days on the road.",
  },
  {
    id: "lamedon",
    name: "Lamedon",
    region: "Under the White Mountains",
    goods: "Cattle, cheese, hard bread",
    availability: 68,
    monthlyOutput: 5400,
    quota: 8000,
    transitDays: 9,
    readiness: "strained",
    note: "Angbor sends what he can while mustering his own levy.",
  },
  {
    id: "anfalas",
    name: "Anfalas",
    region: "The Langstrand",
    goods: "Salt mutton, wool, dried fish",
    availability: 39,
    monthlyOutput: 2400,
    quota: 6200,
    transitDays: 13,
    readiness: "depleted",
    note: "A poor country and the longest haul of the fiefs. Little arrives unspoiled.",
  },
  {
    id: "ethir",
    name: "Ethir Anduin",
    region: "The Delta",
    goods: "Salt, salt fish",
    availability: 26,
    monthlyOutput: 1500,
    quota: 5800,
    transitDays: 7,
    readiness: "critical",
    note: "Fishing fleet driven off the water. Salt-pans idle since Nénimë.",
  },
  {
    id: "morthond",
    name: "Morthond Vale",
    region: "Blackroot Vale",
    goods: "Game, roots, hard cheese",
    availability: 63,
    monthlyOutput: 2900,
    quota: 4600,
    transitDays: 11,
    readiness: "strained",
    note: "Duinhir's vale renders in kind, but his men are on the road to the muster.",
  },
];

/**
 * Sacks-equivalent received into the granaries of the City, month by month.
 * One series — total intake — so the bars all take the slot-1 hue.
 *
 * The final month must equal the sum of `monthlyOutput` across `foodSuppliers`
 * (64,800), or the roll-up tiles and this chart will disagree about the same
 * month.
 */
export const granaryIntake: OutputPoint[] = [
  { period: "Ringarë", value: 88900 },
  { period: "Narvinyë", value: 85100 },
  { period: "Nénimë", value: 79400 },
  { period: "Súlimë I", value: 71600 },
  { period: "Súlimë II", value: 64800 },
];

/** Days of victual held in store at present issue, month by month. */
export const victualReserveDays: OutputPoint[] = [
  { period: "Ringarë", value: 118 },
  { period: "Narvinyë", value: 104 },
  { period: "Nénimë", value: 91 },
  { period: "Súlimë I", value: 74 },
  { period: "Súlimë II", value: 61 },
];

/**
 * Rendering by the four chief victuallers, month by month. Four series on a
 * line chart, so the categorical slots are assigned 1–4 in order and each line
 * is also directly labelled at its end.
 */
/**
 * Series keys are capitalised because the chart uses the property name as the
 * series label in its tooltip; `lossarnach` would be shown to the reader as-is.
 */
export interface FiefIntakePoint {
  period: string;
  Lossarnach: number;
  Lebennin: number;
  Pelargir: number;
  Pelennor: number;
}

export const fiefSeriesKeys = ["Lossarnach", "Lebennin", "Pelargir", "Pelennor"] as const;

export const intakeByFief: FiefIntakePoint[] = [
  { period: "Ringarë", Lossarnach: 17600, Lebennin: 26400, Pelargir: 17900, Pelennor: 16400 },
  { period: "Narvinyë", Lossarnach: 17100, Lebennin: 25100, Pelargir: 15600, Pelennor: 15800 },
  { period: "Nénimë", Lossarnach: 16200, Lebennin: 23000, Pelargir: 12400, Pelennor: 13100 },
  { period: "Súlimë I", Lossarnach: 15400, Lebennin: 21200, Pelargir: 10100, Pelennor: 8900 },
  { period: "Súlimë II", Lossarnach: 14800, Lebennin: 19600, Pelargir: 8200, Pelennor: 3100 },
];

/** How the granaries are stocked, by kind of victual. */
export const storesByKind: OutputPoint[] = [
  { period: "Grain and meal", value: 41200 },
  { period: "Salt meat", value: 14600 },
  { period: "Salt fish", value: 9800 },
  { period: "Hard bread", value: 7300 },
  { period: "Roots and pulse", value: 6100 },
  { period: "Wine and oil", value: 4400 },
];

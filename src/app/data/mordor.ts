import type { MordorReport, OutputPoint, ThreatFactor } from "./types";

/** Reports on the Enemy, newest first. */
export const mordorReports: MordorReport[] = [
  {
    id: "r-014",
    date: "10 March 3019",
    source: "Watch of the Rammas",
    place: "Pelennor, north-east",
    headline: "The Dawnless Day — no sunrise over the Ephel Dúath",
    severity: "grave",
    confidence: 100,
    enemyStrength: null,
    detail:
      "The darkness came out of Mordor before dawn and did not lift. It is a reek and not a cloud, and it comes westward under the wind. The men take it for an omen and it is worse than an omen: our bowmen cannot judge range in it, and the Enemy moves by preference in the dark.",
  },
  {
    id: "r-013",
    date: "10 March 3019",
    source: "Faramir, Captain of Ithilien",
    place: "Osgiliath",
    headline: "East bank of the Anduin lost; ford held under assault",
    severity: "grave",
    confidence: 96,
    enemyStrength: 18000,
    detail:
      "The Enemy crossed in force at dawn with rafts and a bridge of boats. Our companies were driven from the eastern ruins with heavy loss. The ford is held, but not for long. A Black Captain rides with them and the men will not stand where he passes.",
  },
  {
    id: "r-012",
    date: "10 March 3019",
    source: "Rangers of Ithilien — Damrod",
    place: "Cross-roads, Morgul road",
    headline: "Host of Minas Morgul issued forth; the Witch-king rides",
    severity: "grave",
    confidence: 92,
    enemyStrength: 22000,
    detail:
      "The gates of the Nameless City opened at dusk and the host came out under the Lord of the Nazgûl. Orcs of Morgul, men of Harad, and troll-folk in the van. They march by the Morgul road to the crossings. Nine days it has been gathering; it is greater than any host we have counted before.",
  },
  {
    id: "r-011",
    date: "9 March 3019",
    source: "Tower watch",
    place: "Above the Pelennor",
    headline: "Nazgûl overflying the townlands — five wings counted",
    severity: "grave",
    confidence: 88,
    enemyStrength: 5,
    detail:
      "Winged shadows passed thrice over the fields between the second hour and the fourth. Where their cry falls men leave their work and stand as if bound. Two companies of the Rammas broke and had to be gathered again by their captain.",
  },
  {
    id: "r-010",
    date: "9 March 3019",
    source: "Rangers of Ithilien — Mablung",
    place: "Harad road, south of the Cross-roads",
    headline: "Haradrim column moving north with mûmakil",
    severity: "high",
    confidence: 81,
    enemyStrength: 7000,
    detail:
      "A great company of the Southrons on the road, and with them beasts of war such as the old tales speak of — great grey hulks bearing towers. Our arrows will not touch the beasts. They march to join the host of Morgul.",
  },
  {
    id: "r-009",
    date: "8 March 3019",
    source: "Captain of Cair Andros",
    place: "Cair Andros",
    headline: "Enemy crossing north of the isle; island likely taken",
    severity: "grave",
    confidence: 64,
    enemyStrength: 6000,
    detail:
      "The garrison signalled a crossing above the isle at dusk and then signalled no more. Three days without a rider. Anórien lies open behind it, and with it the north road by which Rohan must come.",
  },
  {
    id: "r-008",
    date: "8 March 3019",
    source: "Harlond river watch",
    place: "Mouths of Anduin",
    headline: "Corsair fleet of Umbar under sail — fifty black ships",
    severity: "high",
    confidence: 76,
    enemyStrength: 9000,
    detail:
      "Word up-river from Pelargir: fifty great ships and lesser craft beyond count, standing north with the wind. If they come up to the Harlond the City is cut from the fiefs of the south and the whole southern muster is undone.",
  },
  {
    id: "r-007",
    date: "7 March 3019",
    source: "Watch of the Rammas",
    place: "Pelennor, east road",
    headline: "Siege engines drawn up beyond the Causeway",
    severity: "high",
    confidence: 84,
    enemyStrength: null,
    detail:
      "Great engines counted on the eastern road, drawn by beasts and by many hands. One is larger than the rest by far — a ram, hung on chains, with the head of a wolf. They mean the Gate itself.",
  },
  {
    id: "r-006",
    date: "6 March 3019",
    source: "Scouts of Anórien",
    place: "Drúadan Forest",
    headline: "Orc raiding parties astride the Rohan road",
    severity: "high",
    confidence: 79,
    enemyStrength: 1200,
    detail:
      "Raiders in the wood and on the north road, felling trees across it. It is done to slow a host coming from the west — which is to say, to slow the Rohirrim. The Wild Men of the wood are said to know paths around it.",
  },
  {
    id: "r-005",
    date: "5 March 3019",
    source: "Rangers of Ithilien — Anborn",
    place: "Morannon road",
    headline: "Easterling column through the Black Gate",
    severity: "moderate",
    confidence: 70,
    enemyStrength: 11000,
    detail:
      "Men of Rhûn in mail, marching in good order with a great baggage train, turning south within the Morannon rather than west. Their purpose is not yet plain; they may be meant as a second wave.",
  },
  {
    id: "r-004",
    date: "3 March 3019",
    source: "The palantír of Anárion",
    place: "The Tower of Ecthelion",
    headline: "The Eye is turned upon the City",
    severity: "grave",
    confidence: 100,
    enemyStrength: null,
    detail:
      "Seen by the Steward alone, and not to be entered in the common rolls. The strength arrayed against Gondor is beyond the counting of scouts and beyond the strength of Gondor to meet.",
  },
  {
    id: "r-003",
    date: "1 March 3019",
    source: "Beacon-wardens",
    place: "Amon Dîn to Halifirien",
    headline: "Beacons of Gondor lit along the range",
    severity: "moderate",
    confidence: 100,
    enemyStrength: null,
    detail:
      "All seven beacons fired within the day and answered from Halifirien. Rohan has seen them. The summons is given and cannot be recalled.",
  },
];

/**
 * The composite threat index. `score` is 0–100 and `weight` sums to 1, so the
 * index in `./index.ts` is a straight weighted mean — the arithmetic is on the
 * page so the Steward can see what drives the needle.
 */
export const threatFactors: ThreatFactor[] = [
  {
    id: "host",
    label: "Enemy host arrayed",
    score: 96,
    weight: 0.28,
    detail: "Some fifty thousand counted or reckoned within three days' march of the Rammas.",
  },
  {
    id: "proximity",
    label: "Proximity of the vanguard",
    score: 94,
    weight: 0.2,
    detail: "The eastern ruins of Osgiliath are taken. Four leagues to the Gate.",
  },
  {
    id: "terror",
    label: "Nazgûl and the darkness",
    score: 91,
    weight: 0.16,
    detail: "Five wings overflying the townlands; the Dawnless Day standing over the fields.",
  },
  {
    id: "encirclement",
    label: "Roads and river cut",
    score: 82,
    weight: 0.14,
    detail: "Cair Andros silent, Corsair sail in the south, the Rohan road felled in Drúadan.",
  },
  {
    id: "engines",
    label: "Siege train",
    score: 78,
    weight: 0.12,
    detail: "Engines drawn up on the east road, and among them a ram meant for the Gate.",
  },
  {
    id: "own-strength",
    label: "Weakness of our own defence",
    score: 71,
    weight: 0.1,
    detail: "The Rammas breached, the outer garrisons spent, the muster still five days out.",
  },
];

/** The threat index as it has moved, day by day. */
export const threatHistory: OutputPoint[] = [
  { period: "1 Mar", value: 38 },
  { period: "3 Mar", value: 47 },
  { period: "5 Mar", value: 55 },
  { period: "6 Mar", value: 61 },
  { period: "7 Mar", value: 68 },
  { period: "8 Mar", value: 76 },
  { period: "9 Mar", value: 83 },
  { period: "10 Mar", value: 88 },
];

/** Reports received per day, to show how fast word is now coming in. */
export const reportVolume: OutputPoint[] = [
  { period: "1 Mar", value: 2 },
  { period: "3 Mar", value: 3 },
  { period: "5 Mar", value: 4 },
  { period: "6 Mar", value: 6 },
  { period: "7 Mar", value: 7 },
  { period: "8 Mar", value: 11 },
  { period: "9 Mar", value: 14 },
  { period: "10 Mar", value: 19 },
];

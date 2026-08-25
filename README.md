# Minas Tirith — Steward's Command

A command console for the Steward of Gondor, built with React 19, TypeScript, Vite
and [Ignite UI for React](https://www.infragistics.com/products/ignite-ui-react).

Everything it reports is fixed to one morning: the muster of **10 March 3019**.

## Sections

| Route | Section | What it answers |
| --- | --- | --- |
| `/` | Steward's Table | The whole realm on one board, and what must be decided today |
| `/garrisons` | Garrisons | Strength and composition, morale, health, victual and shafts, per position |
| `/command` | Chain of Command | Org chart of captains and lieutenants, with time to muster and force size |
| `/provisions` | Provisions | Victuallers against their levied quotas; granary intake and stores |
| `/armoury` | Armoury | Forges and smithing production by location; magazine stock against requirement |
| `/allies` | Allies | Rohan and the sworn fiefs — troops available, time to muster, force size |
| `/mordor` | Mordor Watch | Despatches on the Enemy, and a weighted threat-of-invasion meter |

## Running it

```bash
npm install
npm start      # http://localhost:3003
npm run build  # type-check, then production bundle into dist/
npm test       # vitest, in a real Chromium via @vitest/browser-playwright
npm run lint
```

`npm test` needs a browser once: `npx playwright install chromium`.

## How it is put together

```
src/
  theme.css              Citadel palette — Ignite UI token overrides + semantic --mt-* tokens
  app/
    app.tsx              Shell: navbar, nav drawer, routed outlet
    app-routes.tsx       Routes; paths must match shell/nav.ts
    shell/               Nav model, media-query hook, shell styles
    data/                Domain types, the muster data, and every derived roll-up
    ui/                  Icons, chart theme, the shared kit, the threat meter
    pages/               One file per section
```

**Data lives in one place.** `src/app/data` holds the figures and every roll-up
derived from them, so no page computes a total of its own. Several figures are
reachable by two routes — a tile and the last point of a series, for instance —
and `data.test.ts` asserts that those agree. It also asserts that garrison
strengths equal the sum of their arms, that no officer's command is smaller than
his subordinates' combined, that the threat weights sum to one, and that a
dangling `reportsTo` throws rather than quietly dropping a captain from the org
chart.

**One status vocabulary.** `Readiness` (`ready` / `strained` / `depleted` /
`critical`) is used by every section and maps to a reserved status palette. Status
never rides on colour alone: each state ships a distinct glyph and its word.

Each state carries two colours rather than one, and the distinction matters when
adding a component. `color` is the **mark** — a chip's wash, an accent rule, a
gauge arc, a meter fill — where the colour only has to be seen. `ink` is the same
state stepped dark enough to carry text, because on white stone three of the four
marks cannot: `warning` sits at 1.8:1. Anything that paints a figure or a glyph
takes `ink`; anything that paints an area takes `color`.

**Charts.** Categorical series take a fixed, validated eight-slot palette assigned
in order and never cycled. Colour choices went through the `dataviz` skill's
validator against this console's white surface (lightness band, chroma floor,
protan/deutan separation, and contrast all pass). Notable consequences visible in
the code:

- Column charts are pinned to a zero baseline (`barMarks` in `ui/charts.ts`) —
  auto-ranging makes bar length encode differences rather than magnitudes.
- Nothing is dual-axis. Where two measures differ by orders of magnitude — the
  armoury's four thousand arrow-shafts a week against its twenty engines — the
  series are indexed to 100 at the first period and the absolute figures go in the
  table beneath.
- Every chart ships a collapsed table twin (`ui/table-view.tsx`), so no value is
  reachable only through a tooltip.
- Filters sit in one row above everything they scope, never inside a chart card.

### Two things worth knowing before you edit

**The Ignite UI packages are pinned with `~`, deliberately.** `igniteui-react`
19.7.0 shipped an `exports` map pointing at a `components.d.ts` that was not in
the tarball, which silently degraded every `Igr*` component to `any` — a minor
version bump caused it, and 19.8.1 fixed it. `igniteui-grid-lite` is still 0.x,
where minors are breaking, and `igniteui-react` declares it as a `~0.9.0` peer.
Widening these to `^` invites both problems back. After any Ignite UI bump, run
`npm run build` — the type-check is what catches a regressed declaration file.

**Charts and gauges need explicit registration.**
`igniteui-react-charts` and `igniteui-react-gauges` are the older,
non-auto-registering packages, and their release line trails the core one (19.6.0
against 19.8.1 — that gap is normal, not a missed upgrade). Their modules are
registered once in `ui/charts.ts`; a missing `register()` fails silently, and the
chart, an axis, or a series simply never appears.

## Known limitations

- **Light only.** The console commits to one light "White City" palette,
  validated against its own surface. There is no dark theme and no toggle. The
  chart palette is duplicated as literal hex in `ui/charts.ts` because the charts
  package draws to canvas and cannot read CSS custom properties, so a variant
  swap means editing two files rather than flipping one import.
- **Bundle size.** The charts and gauges packages dominate the ~900 kB gzipped
  bundle and are loaded up front. Splitting them per route is the obvious next
  step; see the `igniteui-react-optimize-bundle-size` skill in `.agents/skills`.
- **Static data.** Everything is seeded in `src/app/data`. There is no backend,
  no persistence, and no editing.

## How this was generated

This console was built by Claude Code on top of the Ignite UI CLI React template.
It is recorded here because the seven sections, the vocabulary, and several of the
constraints below came from a prompt rather than from a spec document — if you are
extending it, this is the intent you are extending.

### The originating prompt

Quoted verbatim, typos and all:

> I'm Denethor, Steward of Gondor, and I want to create an application to manage
> Minas Tirith. I want to be able to get quick reports from my garisons, to have
> an overview of the forces they control, their numbers, morale, health and what
> is the status of their provisions. I want to have an org chart of my generals
> and lieutenants with estimated time to mobilize forces and estimated size of the
> force they can mobilize. I also want to keep track of my food suppliers
> availability and food production, my armory suppliers and smithing production by
> location. I want reports from our allies, like Rohan, with troop availability,
> estimated time to mobilize forces and estimated size of the force they can
> mobilize. I want a special section for reports on anything coming out of Mordor
> and a threat meter showing how imminent an invasion from Mordor is.

Every clause maps onto one section in the table at the top of this file. The
in-world framing — the Steward's voice, the 10 March 3019 dating, Third Age
month names in the axis labels — is a deliberate consequence of that prompt, not
decoration: it is what makes the sample data legible as a single coherent morning
rather than as filler.

Follow-up instructions from the same session: update `igniteui-react` to its
latest version (which removed a `tsconfig` types workaround), confirm whether the
charts and gauges packages had newer releases (they did not), and add this
section.

### Skills that shaped the code

Agent skills are instruction sets the assistant loads for a task. Three did real
work here, and their fingerprints are in the source:

| Skill | Where it shows up |
| --- | --- |
| `dataviz` (bundled with Claude Code) | The whole chart layer. Its `scripts/validate_palette.js` was run against this console's white surface to choose the eight categorical slots, and its anti-pattern catalogue is why column charts are pinned to zero, why nothing is dual-axis, why every chart has a table twin, why status colours are reserved and never reused as a series, and why filters sit in one row above what they scope. |
| [`igniteui-react-components`](.agents/skills/igniteui-react-components/SKILL.md) | Theme-CSS import order in `main.tsx`; `.register()` for charts/gauges but never for `igniteui-react`; CSS that targets `igc-*` and `::part()` rather than React names; `e.detail` event payloads; explicitly sized containers for charts, gauges and grids; Grid Lite over the premium grid, and no fixed column widths. |
| [`igniteui-react-customize-theme`](.agents/skills/igniteui-react-customize-theme/SKILL.md) | `src/theme.css` overriding only the `500` shade of each palette role and letting the ramp derive; leaving the light variant's dark `gray` base alone; avoiding the `--ig-*-h/-s/-l` tokens, which are a silent no-op. |

The other skills in `.agents/skills` were not needed for this build but are the
right starting points for their subjects — notably
`igniteui-react-optimize-bundle-size` for the bundle limitation noted above, and
`grid-lite-to-igr-grid-migration` if a grid ever needs editing, selection, paging
or export.

### MCP servers

Two are configured for this repo, in both `.mcp.json` and `.vscode/mcp.json`:

| Server | Purpose |
| --- | --- |
| `igniteui-cli` | Authoritative component docs and API reference (`list_components`, `get_doc`, `get_api_reference`, `search_api`) |
| `igniteui-theming` | Palette, typography, elevation and per-component theme generation |

Both start via `npx` and need no credentials. In practice this build verified
component APIs against the `.d.ts` files in `node_modules` — the documented
fallback when the servers are unavailable — which is why several source comments
cite specific declaration files and enum members. Either route is fine; what
matters is that prop names, slot names, event names and enum values are
**checked** rather than recalled, because they move between versions. Prefer the
MCP servers when they are running.

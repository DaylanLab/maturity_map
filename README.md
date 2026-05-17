# PwC CMMI Maturity Dashboard

A client-side React app for running NIST CSF 2.0 cyber-maturity workshops on the CMMI 1–5 scale. Renders an interactive heatmap (treemap), per-function rollups, a goal-setting view, and a prioritized "Gap Analysis & Roadmap" of the highest-impact actions to take next.

**Live demo:** https://daylanlab.github.io/maturity_map/

---

## What's in it

Three views, switched by the top-nav tabs:

- **Current State** — heatmap of every subcategory colored by current maturity, with a left-rail function navigator and a click-to-pin scoring panel.
- **Goal Setting** — same heatmap but coloring by goal score; sliders edit goal values; CMMI · Goal score appears in the top-right.
- **Gap Analysis & Roadmap** — full-canvas grid of prioritized focus areas, sorted by weighted impact (`gap × overall weight`) so the highest-leverage actions surface first. Each card shows current → goal, the % overall lift if closed, and a tier-transition tip.

## Tech stack

- **React 19** + **Vite 8** (no SSR — entirely client-side)
- **d3-hierarchy** for the treemap layout
- Pure CSS (PwC palette tokens in `src/index.css`)
- No backend. No analytics. No external API calls.

## Run it locally

Requires Node 20+.

```bash
npm install
npm run dev      # http://localhost:5173
```

## Build for production

```bash
npm run build
```

Outputs to `docs/` (configured in `vite.config.js`). The repo is wired so GitHub Pages serves directly from `docs/` on the `master` branch — pushing to master auto-deploys via the workflow in `.github/workflows/deploy.yml`.

To host elsewhere, just take the `docs/` folder and drop it on any static host (S3, Netlify, internal server, etc.). Update `vite.config.js`'s `base` if the deploy path isn't `/maturity_map/`.

## Where to make changes

| Want to change... | Edit... |
|---|---|
| Default subcategory scores (baseline) | `src/App.jsx` — `RAW_DEFAULT_SCORES` (and `BASELINE_SHIFT` to rebaseline the whole demo in one constant) |
| Default goal scores | `src/App.jsx` — `DEFAULT_GOALS` |
| Heatmap color stops (1.0 → 5.0) | `src/utils/scoring.js` — `SCORE_COLORS` |
| Gap-color stops (goal-vs-current) | `src/utils/scoring.js` — `GAP_COLORS` |
| Status pill thresholds & labels | `src/App.jsx` — `statusLabel()` |
| CMMI tier-transition tips | `src/utils/tips.js` — `TIER_TRANSITION_TIPS` |
| Per-function focus copy | `src/utils/tips.js` — `FUNCTION_TIPS` |
| NIST CSF 2.0 framework data | `src/data/nistData.js` |
| Brand colors / palette | `src/index.css` — `:root` tokens (`--primary`, `--surface`, etc.) |
| Brand name in the top nav | `src/components/TopNavBar.jsx` |

## Project layout

```
src/
  App.jsx                  Top-level state, default scores, view-mode switching
  main.jsx                 React entry point
  index.css                Global styles + PwC palette tokens
  components/
    TopNavBar.jsx          Brand, view tabs, CMMI score(s), function pills
    SideNavBar.jsx         Framework Functions left rail
    Treemap.jsx            d3 treemap heatmap (Current State / Goal Setting)
    SelectionContext.jsx   Right-panel detail + score editor
    FocusAreas.jsx         Gap Analysis & Roadmap card grid
    ScoreEditor.jsx        Slider + 1–5 tick buttons
  data/
    nistData.js            NIST CSF 2.0 framework (functions → categories → subcategories)
  utils/
    scoring.js             Weighting, rollups, color interpolation, focus prioritization
    tips.js                CMMI level descriptors + tier-transition guidance
```

## Scoring math

- **Per-subcategory weight:** `1 / numFunctions × 1 / numCatsInFunction × 1 / numSubsInCategory`. Every function counts equally; every category within a function counts equally; every subcategory within a category counts equally.
- **Category / function / overall rollups:** unweighted mean of their children.
- **Focus prioritization:** `gap × weight × 100` → approximate % uplift to overall maturity if that subcategory were brought from current to goal. Cards are sorted by this value so the highest-leverage actions sit at the top.

## License & attribution

Internal PwC tool — not licensed for external redistribution.

The underlying framework (NIST Cybersecurity Framework 2.0) is public-domain US government work. The CMMI maturity scale is owned by ISACA/the CMMI Institute.

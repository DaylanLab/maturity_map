# Plan: NIST CSF 2.0 Maturity Treemap App

## Context

Single-page React app that renders an interactive treemap of the NIST CSF 2.0 framework. A company can set maturity scores at the subcategory level (106 total), and scores roll up automatically through categories → functions → overall. Treemap tiles are sized by their proportional impact on the overall score (`weightOverall`) and colored by score (red=low, yellow=high), functioning as a heat map. No backend, no routing, no database. PWC color scheme.

---

## Technology Choices

- **Bundler**: Vite + React (minimal config, fast dev server)
- **Treemap layout**: `d3-hierarchy` treemap algorithm — handles weighted hierarchical data, minimizes elongated rectangles
- **Rendering**: React SVG elements (full control over interactions and styling)
- **Styling**: Plain CSS with CSS variables for PWC colors (no CSS framework needed)
- **Score scale**: 1–4 matching NIST Implementation Tiers (Partial → Adaptive), default = 1

---

## File Structure

```
proj_daylan/
├── index.html
├── package.json
├── vite.config.js
└── src/
    ├── main.jsx
    ├── App.jsx              # Root component; holds score state, computes rollups
    ├── index.css            # PWC color variables, global resets
    ├── data/
    │   └── nistData.js      # Static: all 6 functions, 22 categories, 106 subcategories
    ├── utils/
    │   └── scoring.js       # scoreColor(), computeRollups(), buildD3Hierarchy()
    └── components/
        ├── Treemap.jsx      # D3 layout + React SVG render; handles click → onSelect
        ├── ScoreEditor.jsx  # Right-side panel: shows selected subcategory, score buttons 1–4
        └── ScoreBar.jsx     # Top bar: overall score + per-function score pills
```

---

## Data Model (`nistData.js`)

Static JS constant encoding all 106 subcategories:

```js
export const NIST_CSF = {
  functions: [
    {
      id: 'GV', name: 'GOVERN', color: '#000000',
      categories: [
        {
          id: 'GV.OC', name: 'Organizational Context',
          subcategories: [
            { id: 'GV.OC-01', description: '...' },
            { id: 'GV.OC-02', description: '...' },
            // ... 5 total
          ]
        },
        // ... 6 categories total
      ]
    },
    // ID, PR, DE, RS, RC ...
  ]
}
```

`weightOverall` for each subcategory is computed at runtime in `scoring.js`:
`1/6 × 1/numCatsInFunction × 1/numSubcatsInCategory`

---

## Score State (`App.jsx`)

```js
// Initial state: all 106 subcategories default to score 1
const [scores, setScores] = useState(() =>
  Object.fromEntries(allSubcatIds.map(id => [id, 1]))
)
const [selected, setSelected] = useState(null)  // subcategory id or null
```

Rollup computation (pure function, runs on every render):
```
subcategoryScore = scores[id]        // user-set, 1–4
categoryScore    = mean(subcategoryScores)
functionScore    = mean(categoryScores)
overallScore     = mean(functionScores)
```

---

## Treemap Layout (`Treemap.jsx`)

1. Build a d3 hierarchy from `NIST_CSF` with each leaf node's `value = weightOverall`
2. Apply `d3.treemap().size([width, height])` with `paddingOuter=10` on function nodes, `paddingInner=4` on category nodes
3. Render function labels as SVG `<text>` in each function group's top-left
4. Render category labels as small `<text>` elements
5. Render subcategory tiles as `<rect>` + `<text>` (ID label)
6. Tile fill = `scoreColor(score)` — interpolated from PwC palette (red → yellow)
7. Click on tile → `setSelected(subcatId)`
8. Selected tile gets a 2px white border highlight

Strategy: `d3.treemapSquarify` for the full 3-level hierarchy (function → category → subcategory).

---

## Score Editor Panel (`ScoreEditor.jsx`)

Shown when `selected !== null`. Fixed right panel (320px wide):
- Subcategory ID (large, bold)
- Full description text
- 4 score buttons: `[1] [2] [3] [4]` — active button highlighted with score color
- Tier labels: 1=Partial, 2=Risk Informed, 3=Repeatable, 4=Adaptive
- Category score (3 sig figs, e.g. "2.33") displayed below
- "Impact on overall score" shown as `weightOverall` percentage
- Close button (X) at top right

**Score display precision:**
- Subcategory scores: 2 sig figs (e.g. "1.0", "2.5" — since scores are integers 1–4 this displays as "1.0", "2.0", etc.)
- Category, function, and overall scores: 3 sig figs (e.g. "2.33", "3.75")

---

## Score Bar (`ScoreBar.jsx`)

Fixed at top of page:
- Left: **NIST CSF 2.0 Maturity Score: X.XX / 4** (3 sig figs, colored by score)
- Right: 6 function score pills (GV, ID, PR, DE, RS, RC) each showing 3-sig-fig score, colored by their function score

---

## PWC Color System (`index.css`)

```css
:root {
  --pwc-black:  #000000;
  --pwc-red:    #AD1B02;
  --pwc-orange: #D85604;
  --pwc-amber:  #E88D14;
  --pwc-yellow: #F3BE26;
  --pwc-light:  #F5F5F5;
}
```

Function label/border colors (cycling through PwC palette):
- GV: `#000000` (black)
- ID: `#AD1B02` (red)
- PR: `#D85604` (orange)
- DE: `#E88D14` (amber)
- RS: `#F3BE26` (yellow)
- RC: `#AD1B02` (red, reused — only 5 distinct PwC colors)

Score heat-map colors (interpolated across 1–4):
- 1 → `#AD1B02` (PwC red — lowest maturity)
- 2 → `#D85604` (PwC orange)
- 3 → `#E88D14` (PwC amber)
- 4 → `#F3BE26` (PwC yellow — highest maturity)

---

## Implementation Steps (ordered)

1. **Scaffold** — `npm create vite@latest . -- --template react`, install `d3-hierarchy`
2. **Data** — Write `nistData.js` with all 106 subcategories transcribed from `NIST_CSF_2.0.md`
3. **Scoring utils** — `scoring.js`: `computeWeights()`, `computeRollups(scores)`, `scoreColor(score)`, `buildHierarchy(nistData, rollups)`
4. **App** — State initialization, rollup computation, wire up `scores`/`selected` state
5. **ScoreBar** — Overall + per-function score display
6. **Treemap** — D3 layout + SVG rendering, click handler
7. **ScoreEditor** — Panel component wired to `selected` state
8. **Styling** — PWC colors, responsive layout (treemap fills remaining space after header)

---

## Source Files

- `NIST_CSF_2.0.md` — source of truth for all subcategory IDs and descriptions
- `starting_point.md` — requirements and weighting model

---

## Verification

1. Run `npm run dev` and open in browser
2. Confirm treemap renders all 6 function groups with correct labels
3. Click a subcategory tile — confirm editor panel opens with correct description
4. Change a score — confirm tile color updates immediately
5. Confirm category/function/overall scores in ScoreBar update
6. Verify RC.CO tiles are visually larger than GV.SC tiles (weight difference: 4.17% vs 0.28%)
7. Confirm PWC colors are used throughout

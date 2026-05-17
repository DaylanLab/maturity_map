// Heat map calibrated for the typical CMMI cyber population, which clusters
// in the 2.0–3.0 band. The midpoint (gold/neutral) is pulled down to 2.5 so:
//   • 2.0 reads orange — "noticeable gap" rather than "alarmingly red"
//   • 2.5 reads gold — "typical / acceptable"
//   • 3.0 reads yellow-green — "good, climbing"
//   • 4.0+ reads green — "leading"
// This gives the workshop a wider palette of meaningful color where real
// clients actually live, instead of compressing them all into "orange".
const SCORE_COLORS = [
  { score: 1.0, color: '#c8281a' }, // deep red — critical
  { score: 1.5, color: '#e87a1a' }, // orange — early gap
  { score: 2.0, color: '#8fbf3f' }, // light green — green territory begins here
  { score: 3.0, color: '#4f9a3a' }, // medium green — solid
  { score: 4.0, color: '#2e7a35' }, // strong green — leading
  { score: 5.0, color: '#1e5631' }, // deep green — optimizing
]

export function scoreColor(score) {
  const clamped = Math.max(1, Math.min(5, score))
  for (let i = 0; i < SCORE_COLORS.length - 1; i++) {
    const lo = SCORE_COLORS[i]
    const hi = SCORE_COLORS[i + 1]
    if (clamped <= hi.score) {
      const t = (clamped - lo.score) / (hi.score - lo.score)
      return lerpColor(lo.color, hi.color, t)
    }
  }
  return SCORE_COLORS[SCORE_COLORS.length - 1].color
}

function lerpColor(a, b, t) {
  const ra = parseInt(a.slice(1, 3), 16)
  const ga = parseInt(a.slice(3, 5), 16)
  const ba = parseInt(a.slice(5, 7), 16)
  const rb = parseInt(b.slice(1, 3), 16)
  const gb = parseInt(b.slice(3, 5), 16)
  const bb = parseInt(b.slice(5, 7), 16)
  const r = Math.round(ra + (rb - ra) * t)
  const g = Math.round(ga + (gb - ga) * t)
  const bl = Math.round(ba + (bb - ba) * t)
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${bl.toString(16).padStart(2, '0')}`
}

// Compute weightOverall for every subcategory:
// 1/6 × 1/numCatsInFunction × 1/numSubcatsInCategory
export function computeWeights(nistData) {
  const weights = {}
  const numFunctions = nistData.functions.length
  for (const fn of nistData.functions) {
    const numCats = fn.categories.length
    for (const cat of fn.categories) {
      const numSubs = cat.subcategories.length
      const w = (1 / numFunctions) * (1 / numCats) * (1 / numSubs)
      for (const sub of cat.subcategories) {
        weights[sub.id] = w
      }
    }
  }
  return weights
}

// Compute rollup scores from flat subcategory scores map
// Returns { subcategories, categories, functions, overall }
export function computeRollups(nistData, scores) {
  const categoryScores = {}
  const functionScores = {}

  for (const fn of nistData.functions) {
    const catScoreList = []
    for (const cat of fn.categories) {
      const subScores = cat.subcategories.map(s => scores[s.id] ?? 1)
      const catScore = mean(subScores)
      categoryScores[cat.id] = catScore
      catScoreList.push(catScore)
    }
    functionScores[fn.id] = mean(catScoreList)
  }

  const overall = mean(Object.values(functionScores))

  return { categoryScores, functionScores, overall }
}

function mean(arr) {
  if (!arr.length) return 0
  return arr.reduce((a, b) => a + b, 0) / arr.length
}

// Format a score for display
// subcategory: 2 sig figs (e.g. "1.0")
// category/function/overall: 3 sig figs (e.g. "2.33")
export function fmtSub(score) {
  return score.toFixed(1)
}

export function fmtRollup(score) {
  return score.toFixed(2)
}

// Gap heat: green (gap <= 0, met or surpassed) → gold (~1.0) → red (>=2.0).
const GAP_COLORS = [
  { gap: 0.0, color: '#1e5631' },
  { gap: 1.0, color: '#ffb600' },
  { gap: 2.0, color: '#e0301e' },
]

export function gapColor(currentScore, goalScore) {
  const gap = Math.max(0, (goalScore ?? 0) - (currentScore ?? 0))
  const clamped = Math.max(0, Math.min(2, gap))
  for (let i = 0; i < GAP_COLORS.length - 1; i++) {
    const lo = GAP_COLORS[i]
    const hi = GAP_COLORS[i + 1]
    if (clamped <= hi.gap) {
      const t = (clamped - lo.gap) / (hi.gap - lo.gap)
      return lerp(lo.color, hi.color, t)
    }
  }
  return GAP_COLORS[GAP_COLORS.length - 1].color
}

function lerp(a, b, t) {
  const ra = parseInt(a.slice(1, 3), 16), ga = parseInt(a.slice(3, 5), 16), ba = parseInt(a.slice(5, 7), 16)
  const rb = parseInt(b.slice(1, 3), 16), gb = parseInt(b.slice(3, 5), 16), bb = parseInt(b.slice(5, 7), 16)
  const r = Math.round(ra + (rb - ra) * t)
  const g = Math.round(ga + (gb - ga) * t)
  const bl = Math.round(ba + (bb - ba) * t)
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${bl.toString(16).padStart(2, '0')}`
}

// Compute prioritized focus recommendations.
// Score = weighted gap (gap × overall weight) so highest-impact items rise to the top.
// Returns top N entries with rich metadata for the FocusAreas panel.
export function computeFocusAreas(nistData, scores, goalScores, weights, topN = 8) {
  const entries = []
  for (const fn of nistData.functions) {
    for (const cat of fn.categories) {
      for (const sub of cat.subcategories) {
        const cur = scores[sub.id] ?? 1
        const goal = goalScores[sub.id] ?? cur
        const gap = Math.max(0, goal - cur)
        if (gap <= 0) continue
        const w = weights[sub.id] ?? 0
        const impactPct = gap * w * 100 // approximate % uplift to overall if closed
        entries.push({
          subcatId: sub.id,
          description: sub.description,
          functionId: fn.id,
          functionName: fn.name,
          categoryId: cat.id,
          categoryName: cat.name,
          current: cur,
          goal,
          gap,
          weight: w,
          impactPct,
        })
      }
    }
  }
  entries.sort((a, b) => b.impactPct - a.impactPct)
  return entries.slice(0, topN)
}

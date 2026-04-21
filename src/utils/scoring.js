// Heat map: red (1.0) → gold (3.0) → deep green (5.0)
const SCORE_COLORS = [
  { score: 1.0, color: '#e0301e' },
  { score: 3.0, color: '#ffb600' },
  { score: 5.0, color: '#1e5631' },
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

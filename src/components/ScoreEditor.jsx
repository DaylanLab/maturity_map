import { useState, useEffect } from 'react'
import { scoreColor, fmtRollup } from '../utils/scoring'

const TIER_LABELS = { 1: 'Initial', 2: 'Managed', 3: 'Defined', 4: 'Quantitatively Managed', 5: 'Optimizing' }

function tierLabel(score) {
  const tier = Math.ceil(score)
  return TIER_LABELS[Math.min(5, Math.max(1, tier))]
}

export default function ScoreEditor({ subcatId, nistData, scores, categoryScores, weights, onScore, onClose }) {
  let subcat = null
  let category = null
  let func = null

  for (const fn of nistData.functions) {
    for (const cat of fn.categories) {
      const found = cat.subcategories.find(s => s.id === subcatId)
      if (found) {
        subcat = found
        category = cat
        func = fn
        break
      }
    }
    if (subcat) break
  }

  if (!subcat) return null

  const currentScore = scores[subcatId] ?? 1.0
  const catScore = categoryScores[category.id] ?? 1
  const weightPct = ((weights[subcatId] ?? 0) * 100).toFixed(2)
  const color = scoreColor(currentScore)

  // Local string state lets the user type freely (e.g. "2", "2.", "2.2")
  // without the value being clamped mid-entry.
  const [inputValue, setInputValue] = useState(currentScore.toFixed(1))

  // Sync display when a different subcategory is selected
  useEffect(() => {
    setInputValue(currentScore.toFixed(1))
  }, [subcatId]) // eslint-disable-line react-hooks/exhaustive-deps

  function handleChange(e) {
    setInputValue(e.target.value)
  }

  function handleBlur() {
    const raw = parseFloat(inputValue)
    const committed = isNaN(raw)
      ? currentScore
      : Math.round(Math.min(5.0, Math.max(1.0, raw)) * 10) / 10
    onScore(subcatId, committed)
    setInputValue(committed.toFixed(1))
  }

  return (
    <div className="score-editor">
      <button className="score-editor__close" onClick={onClose} aria-label="Close">✕</button>

      <div className="score-editor__fn-tag" style={{ color: getFnColor(func.id) }}>
        {func.id} — {func.name}
      </div>

      <div className="score-editor__cat">{category.id} · {category.name}</div>

      <div className="score-editor__sub-id">{subcat.id}</div>
      <p className="score-editor__desc">{subcat.description}</p>

      <div className="score-editor__input-row">
        <input
          type="number"
          className="score-input"
          min={1.0}
          max={5.0}
          step={0.1}
          value={inputValue}
          onChange={handleChange}
          onBlur={handleBlur}
          style={{ borderColor: color, color }}
        />
        <span className="score-tier-label" style={{ color }}>{tierLabel(currentScore)}</span>
      </div>

      <div className="score-editor__meta">
        <div className="score-editor__meta-row">
          <span>Category score ({category.id})</span>
          <span style={{ color: scoreColor(catScore), fontWeight: 600 }}>{fmtRollup(catScore)}</span>
        </div>
        <div className="score-editor__meta-row">
          <span>Overall impact</span>
          <span style={{ fontWeight: 600 }}>{weightPct}%</span>
        </div>
      </div>
    </div>
  )
}

function getFnColor(id) {
  const colors = { GV: '#3B82F6', ID: '#8B5CF6', PR: '#06B6D4', DE: '#F97316', RS: '#EC4899', RC: '#94A3B8' }
  return colors[id] ?? '#8899BB'
}

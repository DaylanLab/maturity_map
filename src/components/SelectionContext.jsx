import { useState, useEffect } from 'react'
import { scoreColor, fmtRollup } from '../utils/scoring'

const TIER_LABELS = { 1: 'Initial', 2: 'Managed', 3: 'Defined', 4: 'Quantitatively Managed', 5: 'Optimizing' }

function tierLabel(score) {
  const tier = Math.ceil(score)
  return TIER_LABELS[Math.min(5, Math.max(1, tier))]
}

function statusIcon(score) {
  if (score >= 4.5) return 'verified'
  if (score >= 3.5) return 'check_circle'
  if (score >= 2.0) return 'warning'
  return 'error'
}

export default function SelectionContext({ subcatId, nistData, scores, categoryScores, weights, onScore }) {
  let subcat = null
  let category = null
  let func = null

  for (const fn of nistData.functions) {
    for (const cat of fn.categories) {
      const found = cat.subcategories.find(s => s.id === subcatId)
      if (found) { subcat = found; category = cat; func = fn; break }
    }
    if (subcat) break
  }

  if (!subcat) return null

  const currentScore = scores[subcatId] ?? 1.0
  const catScore = categoryScores[category.id] ?? 1
  const scoreCol = scoreColor(currentScore)
  const tier = tierLabel(currentScore)
  const icon = statusIcon(currentScore)

  const [inputValue, setInputValue] = useState(currentScore.toFixed(1))

  useEffect(() => {
    setInputValue(currentScore.toFixed(1))
  }, [subcatId]) // eslint-disable-line react-hooks/exhaustive-deps

  function handleChange(e) {
    const val = e.target.value
    setInputValue(val)
    const raw = parseFloat(val)
    if (!isNaN(raw) && raw >= 1.0 && raw <= 5.0) {
      onScore(subcatId, Math.round(raw * 10) / 10)
    }
  }

  function handleBlur() {
    const raw = parseFloat(inputValue)
    const committed = isNaN(raw)
      ? currentScore
      : Math.round(Math.min(5.0, Math.max(1.0, raw)) * 10) / 10
    onScore(subcatId, committed)
    setInputValue(committed.toFixed(1))
  }

  // Sibling subcategories in the same category (up to 5 for display)
  const siblings = category.subcategories.slice(0, 5)

  // ID range for category
  const ids = category.subcategories.map(s => s.id)
  const idRange = ids.length > 1
    ? `${ids[0]} through ${ids[ids.length - 1]}`
    : ids[0]

  return (
    <aside className="selection-context no-scrollbar">
      <div className="selection-context__inner">
        <div className="selection-context__label">Selection Context</div>

        {/* Title row */}
        <div className="selection-context__title-row">
          <div>
            <div className="selection-context__cat-name">{category.name}</div>
            <div className="selection-context__sub-range">{idRange}</div>
          </div>
          <div className="selection-context__status-icon" style={{ background: scoreCol }}>
            <span className="material-symbols-outlined mat-fill">{icon}</span>
          </div>
        </div>

        {/* Big score + tier */}
        <div className="selection-context__score-row">
          <div className="selection-context__big-score" style={{ color: scoreCol }}>
            {currentScore.toFixed(1)}
          </div>
          <div className="selection-context__tier-block">
            <span className="selection-context__tier-label">Maturity Tier</span>
            <span className="selection-context__tier-value">{tier}</span>
          </div>
        </div>

        {/* Score input */}
        <div className="selection-context__input-row">
          <span className="selection-context__input-label">
            {subcat.id} Score
          </span>
          <input
            type="number"
            className="score-input"
            min={1.0}
            max={5.0}
            step={0.1}
            value={inputValue}
            onChange={handleChange}
            onBlur={handleBlur}
            style={{ borderBottomColor: scoreCol, color: scoreCol }}
          />
        </div>

        {/* Progress bars */}
        <div className="selection-context__bars">
          <div className="selection-context__bar-row">
            <div className="selection-context__bar-meta">
              <span className="selection-context__bar-name">Category Score</span>
              <span className="selection-context__bar-val" style={{ color: scoreColor(catScore) }}>
                {fmtRollup(catScore)} / 5
              </span>
            </div>
            <div className="selection-context__bar-track">
              <div
                className="selection-context__bar-fill"
                style={{ width: `${((catScore - 1) / 4) * 100}%`, background: scoreColor(catScore) }}
              />
            </div>
          </div>
          <div className="selection-context__bar-row">
            <div className="selection-context__bar-meta">
              <span className="selection-context__bar-name">Overall Impact</span>
              <span className="selection-context__bar-val">
                {((weights[subcatId] ?? 0) * 100).toFixed(2)}%
              </span>
            </div>
            <div className="selection-context__bar-track">
              <div
                className="selection-context__bar-fill"
                style={{
                  width: `${Math.min(100, (weights[subcatId] ?? 0) * 2000)}%`,
                  background: 'var(--on-surface-variant)',
                  opacity: 0.5,
                }}
              />
            </div>
          </div>
        </div>

        {/* Category Highlights */}
        <div className="selection-context__highlights-heading">Category Highlights</div>
        <div className="selection-context__sub-cards">
          {siblings.map(sib => {
            const sibScore = scores[sib.id] ?? 1
            const sibColor = scoreColor(sibScore)
            const isSelected = sib.id === subcatId
            return (
              <div
                key={sib.id}
                className={`selection-context__sub-card${!isSelected ? ' selection-context__sub-card--faded' : ''}`}
                style={{ borderLeftColor: sibColor }}
              >
                <div className="selection-context__sub-card-id" style={{ color: sibColor }}>
                  {sib.id}
                </div>
                <div className="selection-context__sub-card-desc">{sib.description}</div>
              </div>
            )
          })}
        </div>

        {/* Doc button */}
        <button className="selection-context__doc-btn">
          View Evidentiary Documentation
        </button>
      </div>
    </aside>
  )
}

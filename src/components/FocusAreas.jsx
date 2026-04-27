import { useMemo } from 'react'
import { scoreColor, gapColor, fmtRollup, computeFocusAreas } from '../utils/scoring'
import { getTransitionTip, FUNCTION_TIPS } from '../utils/tips'

const FN_COLORS = { GV: '#3B82F6', ID: '#8B5CF6', PR: '#06B6D4', DE: '#F97316', RS: '#EC4899', RC: '#94A3B8' }

export default function FocusAreas({ nistData, scores, goalScores, weights, selected, onSelect, overallCurrent, overallGoal }) {
  const recs = useMemo(
    () => computeFocusAreas(nistData, scores, goalScores, weights, 8),
    [nistData, scores, goalScores, weights]
  )

  const totalImpact = recs.reduce((sum, r) => sum + r.impactPct, 0)
  const overallGap = Math.max(0, overallGoal - overallCurrent)

  return (
    <aside className="focus-areas no-scrollbar">
      <div className="focus-areas__inner">
        <div className="focus-areas__label">Roadmap · Focus Areas</div>

        {/* Headline gap card */}
        <div className="focus-areas__headline">
          <div className="focus-areas__headline-row">
            <div>
              <div className="focus-areas__headline-label">Current Maturity</div>
              <div className="focus-areas__headline-val" style={{ color: scoreColor(overallCurrent) }}>
                {fmtRollup(overallCurrent)}
              </div>
            </div>
            <span className="material-symbols-outlined focus-areas__arrow">trending_flat</span>
            <div>
              <div className="focus-areas__headline-label">Goal Maturity</div>
              <div className="focus-areas__headline-val" style={{ color: scoreColor(overallGoal) }}>
                {fmtRollup(overallGoal)}
              </div>
            </div>
          </div>
          <div className="focus-areas__headline-gap">
            <span>Gap to close: </span>
            <strong style={{ color: gapColor(overallCurrent, overallGoal) }}>{overallGap.toFixed(2)} pts</strong>
            <span> · Top {recs.length} actions cover </span>
            <strong>{totalImpact.toFixed(2)}%</strong>
            <span> of the lift</span>
          </div>
        </div>

        <div className="focus-areas__sub-label">
          Prioritized by weighted impact (gap × overall weight). Click a card to focus on it.
        </div>

        <div className="focus-areas__list">
          {recs.length === 0 && (
            <div className="focus-areas__empty">
              <span className="material-symbols-outlined">verified</span>
              <div>All goals are met or surpassed. Set higher goals or shift focus to maintaining maturity.</div>
            </div>
          )}

          {recs.map((rec, i) => {
            const tip = getTransitionTip(rec.current, rec.goal)
            const fnAccent = FN_COLORS[rec.functionId] ?? '#888'
            const isSelected = rec.subcatId === selected
            return (
              <button
                key={rec.subcatId}
                className={`focus-card${isSelected ? ' focus-card--selected' : ''}`}
                style={{ borderLeftColor: fnAccent }}
                onClick={() => onSelect(rec.subcatId, rec.functionId)}
              >
                <div className="focus-card__top">
                  <span className="focus-card__rank">#{i + 1}</span>
                  <span className="focus-card__id" style={{ color: fnAccent }}>{rec.subcatId}</span>
                  <span className="focus-card__cat">{rec.categoryName}</span>
                </div>
                <div className="focus-card__desc">{rec.description}</div>

                <div className="focus-card__scores">
                  <div className="focus-card__score-block">
                    <span className="focus-card__score-label">Current</span>
                    <span className="focus-card__score-val" style={{ color: scoreColor(rec.current) }}>
                      {rec.current.toFixed(1)}
                    </span>
                  </div>
                  <span className="material-symbols-outlined focus-card__arrow">arrow_forward</span>
                  <div className="focus-card__score-block">
                    <span className="focus-card__score-label">Goal</span>
                    <span className="focus-card__score-val" style={{ color: scoreColor(rec.goal) }}>
                      {rec.goal.toFixed(1)}
                    </span>
                  </div>
                  <div className="focus-card__impact">
                    <span className="focus-card__score-label">Impact</span>
                    <span className="focus-card__impact-val">+{rec.impactPct.toFixed(2)}%</span>
                  </div>
                </div>

                {tip && (
                  <div className="focus-card__tip">
                    <div className="focus-card__tip-headline">
                      <span className="material-symbols-outlined">tips_and_updates</span>
                      {tip.headline}
                    </div>
                    <ul className="focus-card__tip-list">
                      {tip.actions.slice(0, 3).map((a, idx) => <li key={idx}>{a}</li>)}
                    </ul>
                  </div>
                )}
              </button>
            )
          })}
        </div>

        {recs.length > 0 && (
          <div className="focus-areas__function-tip">
            <div className="focus-areas__function-tip-label">Function focus</div>
            <div className="focus-areas__function-tip-body">
              {FUNCTION_TIPS[recs[0].functionId]}
            </div>
          </div>
        )}
      </div>
    </aside>
  )
}

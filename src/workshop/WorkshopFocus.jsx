import { useMemo } from 'react'
import { computeFocusAreas, scoreColor, gapColor, fmtRollup } from '../utils/scoring'
import { getTransitionTip } from '../utils/tips'

// Roadmap-tab side panel.
// Shows the top N highest-impact gaps as actionable cards. "Apply this fix"
// pushes the subcategory's score up to its goal in a simulated overlay so the
// hero number ticks up live — clients see the lift before they commit.
export default function WorkshopFocus({
  nistData,
  scores,
  goalScores,
  weights,
  simulated,
  onApply,
  onUnapply,
  onReset,
  onSelect,
  pinnedId,
  overallCurrent,
  overallSimulated,
  overallGoal,
}) {
  const focus = useMemo(
    () => computeFocusAreas(nistData, scores, goalScores, weights, 10),
    [nistData, scores, goalScores, weights]
  )

  const appliedCount = Object.keys(simulated).length
  const lift = (overallSimulated ?? overallCurrent) - overallCurrent
  const remainingToGoal = Math.max(0, overallGoal - (overallSimulated ?? overallCurrent))

  if (focus.length === 0) {
    return (
      <aside className="ws-focus ws-focus--empty">
        <div className="ws-focus__empty">
          <span className="material-symbols-outlined ws-focus__empty-icon">verified</span>
          <div className="ws-focus__empty-title">No gaps to close</div>
          <div className="ws-focus__empty-sub">Current scores already meet or exceed every goal.</div>
        </div>
      </aside>
    )
  }

  return (
    <aside className="ws-focus">
      <header className="ws-focus__header">
        <div className="ws-focus__title">
          <span className="material-symbols-outlined">route</span>
          Roadmap Simulator
        </div>
        <div className="ws-focus__sub">
          Click <strong>Apply</strong> to model closing each gap. The hero updates live.
        </div>
      </header>

      <div className="ws-focus__sim-summary">
        <div className="ws-focus__sim-row">
          <span className="ws-focus__sim-label">Applied fixes</span>
          <span className="ws-focus__sim-val">{appliedCount}</span>
        </div>
        <div className="ws-focus__sim-row">
          <span className="ws-focus__sim-label">Simulated lift</span>
          <span className="ws-focus__sim-val ws-focus__sim-val--good">
            {lift > 0 ? `+${fmtRollup(lift)}` : '—'}
          </span>
        </div>
        <div className="ws-focus__sim-row">
          <span className="ws-focus__sim-label">Remaining to goal</span>
          <span className="ws-focus__sim-val">{fmtRollup(remainingToGoal)}</span>
        </div>
        {appliedCount > 0 && (
          <button className="ws-focus__reset" onClick={onReset}>
            <span className="material-symbols-outlined">refresh</span>
            Reset simulation
          </button>
        )}
      </div>

      <ol className="ws-focus__list">
        {focus.map((item, idx) => {
          const isApplied = simulated[item.subcatId] != null
          const isPinned = pinnedId === item.subcatId
          const tip = getTransitionTip(item.current, item.goal)
          return (
            <li
              key={item.subcatId}
              className={`ws-focus__card${isApplied ? ' ws-focus__card--applied' : ''}${isPinned ? ' ws-focus__card--pinned' : ''}`}
            >
              <div className="ws-focus__card-head" onClick={() => onSelect(item.subcatId, item.functionId)}>
                <div className="ws-focus__rank">#{idx + 1}</div>
                <div className="ws-focus__card-title">
                  <div className="ws-focus__card-id">{item.subcatId}</div>
                  <div className="ws-focus__card-cat">{item.categoryName}</div>
                </div>
                <div className="ws-focus__card-impact" title="Approx % lift to overall maturity if closed">
                  +{item.impactPct.toFixed(2)}%
                </div>
              </div>

              <div className="ws-focus__card-scores">
                <span className="ws-focus__chip" style={{ background: scoreColor(item.current) }}>
                  {item.current.toFixed(1)}
                </span>
                <span className="material-symbols-outlined ws-focus__card-arrow">arrow_forward</span>
                <span className="ws-focus__chip" style={{ background: scoreColor(item.goal) }}>
                  {item.goal.toFixed(1)}
                </span>
                <span className="ws-focus__gap" style={{ color: gapColor(item.current, item.goal) }}>
                  gap {item.gap.toFixed(1)}
                </span>
              </div>

              {tip && (
                <div className="ws-focus__tip">
                  <strong>{tip.headline}:</strong> {tip.actions[0]}
                </div>
              )}

              <div className="ws-focus__card-actions">
                {isApplied ? (
                  <button
                    className="ws-focus__btn ws-focus__btn--unapply"
                    onClick={() => onUnapply(item.subcatId)}
                  >
                    <span className="material-symbols-outlined">undo</span>
                    Unapply
                  </button>
                ) : (
                  <button
                    className="ws-focus__btn ws-focus__btn--apply"
                    onClick={() => onApply(item.subcatId)}
                  >
                    <span className="material-symbols-outlined">bolt</span>
                    Apply this fix
                  </button>
                )}
              </div>
            </li>
          )
        })}
      </ol>
    </aside>
  )
}

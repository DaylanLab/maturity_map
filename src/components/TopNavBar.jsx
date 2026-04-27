import { scoreColor, fmtRollup } from '../utils/scoring'

const VIEW_TABS = [
  { id: 'current', label: 'Current State' },
  { id: 'goal', label: 'Goal Setting' },
  { id: 'gap', label: 'Gap Analysis & Roadmap' },
]

export default function TopNavBar({ overall, overallGoal, functionScores, functions, viewMode, onChangeView }) {
  const overallColor = scoreColor(overall)
  const goalColor = scoreColor(overallGoal ?? overall)

  return (
    <header className="top-nav">
      <div className="top-nav__left">
        <span className="top-nav__brand">PwC Maturity Dashboard</span>
        <nav className="top-nav__tabs">
          {VIEW_TABS.map(tab => (
            <button
              key={tab.id}
              className={`top-nav__tab${viewMode === tab.id ? ' top-nav__tab--active' : ''}`}
              onClick={() => onChangeView(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="top-nav__right">
        <div className="top-nav__score-block">
          <span className="top-nav__score-label">CMMI · Current</span>
          <span className="top-nav__score-value" style={{ color: overallColor }}>
            {fmtRollup(overall)}
            <span className="top-nav__score-denom"> / 5</span>
          </span>
        </div>
        <span className="material-symbols-outlined top-nav__arrow">trending_flat</span>
        <div className="top-nav__score-block">
          <span className="top-nav__score-label">CMMI · Goal</span>
          <span className="top-nav__score-value" style={{ color: goalColor }}>
            {fmtRollup(overallGoal ?? overall)}
            <span className="top-nav__score-denom"> / 5</span>
          </span>
        </div>

        <div className="top-nav__divider" />

        <div className="top-nav__fn-pills">
          {functions.map(fn => {
            const score = functionScores[fn.id] ?? 1
            const color = scoreColor(score)
            return (
              <div key={fn.id} className="top-nav__fn-pill">
                <span className="top-nav__fn-pill-id">{fn.id}</span>
                <span className="top-nav__fn-pill-score" style={{ color }}>{fmtRollup(score)}</span>
              </div>
            )
          })}
        </div>

        <div className="top-nav__divider" />

        <button className="top-nav__icon-btn" aria-label="Notifications">
          <span className="material-symbols-outlined">notifications</span>
        </button>
        <button className="top-nav__icon-btn" aria-label="Settings">
          <span className="material-symbols-outlined">settings</span>
        </button>
        <div className="top-nav__avatar" aria-label="User profile">
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>person</span>
        </div>
      </div>
    </header>
  )
}

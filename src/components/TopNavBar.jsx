import { scoreColor, fmtRollup } from '../utils/scoring'

export default function TopNavBar({ overall, functionScores, functions }) {
  const overallColor = scoreColor(overall)

  return (
    <header className="top-nav">
      <div className="top-nav__left">
        <span className="top-nav__brand">PwC Maturity Dashboard</span>
        <nav className="top-nav__tabs">
          <a href="#" className="top-nav__tab top-nav__tab--active">Executive Summary</a>
          <a href="#" className="top-nav__tab">Framework View</a>
          <a href="#" className="top-nav__tab">Peer Benchmarking</a>
        </nav>
      </div>

      <div className="top-nav__right">
        <div className="top-nav__score-block">
          <span className="top-nav__score-label">CMMI Maturity Level</span>
          <span className="top-nav__score-value" style={{ color: overallColor }}>
            {fmtRollup(overall)}
            <span className="top-nav__score-denom"> / 5</span>
          </span>
        </div>

        <div className="top-nav__divider" />

        {/* Function score pills */}
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

        {/* Icons */}
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

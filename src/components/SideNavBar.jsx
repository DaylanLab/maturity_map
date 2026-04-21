import { scoreColor, fmtRollup } from '../utils/scoring'

const FN_ICONS = {
  GV: 'gavel',
  ID: 'fingerprint',
  PR: 'shield',
  DE: 'radar',
  RS: 'emergency',
  RC: 'settings_backup_restore',
}

export default function SideNavBar({ functions, functionScores, selectedFn, onSelectFn }) {
  return (
    <aside className="side-nav">
      <div className="side-nav__header">
        <div className="side-nav__title">Framework Functions</div>
        <div className="side-nav__subtitle">NIST CSF 2.0</div>
      </div>

      <nav className="side-nav__nav no-scrollbar">
        {functions.map(fn => {
          const isActive = fn.id === selectedFn
          const score = functionScores[fn.id] ?? 1
          const scoreCol = scoreColor(score)
          return (
            <div
              key={fn.id}
              className={`side-nav__item${isActive ? ' side-nav__item--active' : ''}`}
              onClick={() => onSelectFn(fn.id)}
            >
              <span
                className={`material-symbols-outlined side-nav__item-icon${isActive ? ' mat-fill' : ''}`}
              >
                {FN_ICONS[fn.id]}
              </span>
              <span className="side-nav__item-label">{fn.name.charAt(0) + fn.name.slice(1).toLowerCase()}</span>
              <span style={{ marginLeft: 'auto', fontSize: 11, fontWeight: 700, color: scoreCol }}>
                {fmtRollup(score)}
              </span>
            </div>
          )
        })}
      </nav>

      <div className="side-nav__footer">
        <button className="side-nav__generate-btn">Generate Report</button>
        <div className="side-nav__footer-links">
          <div className="side-nav__footer-link">
            <span className="material-symbols-outlined">help_outline</span>
            Help Center
          </div>
          <div className="side-nav__footer-link">
            <span className="material-symbols-outlined">logout</span>
            Log Out
          </div>
        </div>
      </div>
    </aside>
  )
}

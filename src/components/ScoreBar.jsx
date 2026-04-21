import { scoreColor, fmtRollup } from '../utils/scoring'

const FUNCTION_COLORS = {
  GV: '#3B82F6',
  ID: '#8B5CF6',
  PR: '#06B6D4',
  DE: '#F97316',
  RS: '#EC4899',
  RC: '#94A3B8',
}

export default function ScoreBar({ overall, functionScores, functions }) {
  const overallColor = scoreColor(overall)

  return (
    <div className="score-bar">
      <div className="score-bar__overall">
        <span className="score-bar__label">CMMI Maturity Level</span>
        <span className="score-bar__value" style={{ color: overallColor }}>
          {fmtRollup(overall)}
          <span className="score-bar__denom"> / 5</span>
        </span>
      </div>

      <div className="score-bar__functions">
        {functions.map(fn => {
          const accent = FUNCTION_COLORS[fn.id]
          const score = functionScores[fn.id] ?? 1
          return (
            <div key={fn.id} className="fn-pill" style={{ borderColor: accent }}>
              <span className="fn-pill__id" style={{ color: accent }}>{fn.id}</span>
              <span className="fn-pill__score">{fmtRollup(score)}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

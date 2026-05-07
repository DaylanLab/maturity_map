import { useEffect, useRef, useState } from 'react'
import { scoreColor, gapColor, fmtRollup } from '../utils/scoring'

function status(score) {
  if (score >= 4.5) return { text: 'Optimizing', tone: 'good' }
  if (score >= 3.5) return { text: 'On Track',   tone: 'good' }
  if (score >= 2.0) return { text: 'At Risk',    tone: 'warn' }
  return                     { text: 'Critical',  tone: 'bad' }
}

// Hero strip — the workshop's visual anchor. Numbers tween subtly when changed
// so the client visually feels the impact of every edit.
export default function WorkshopHero({ current, goal, simulated, tab }) {
  const gap = Math.max(0, goal - current)
  const lift = simulated != null ? simulated - current : 0
  const stat = status(simulated ?? current)

  return (
    <div className="ws-hero">
      <div className="ws-hero__main">
        <ScoreBlock label="Current Maturity" value={current} color={scoreColor(current)} />
        <span className="material-symbols-outlined ws-hero__arrow">trending_flat</span>
        <ScoreBlock label="Goal Maturity" value={goal} color={scoreColor(goal)} />

        {simulated != null && (
          <>
            <span className="ws-hero__div" />
            <ScoreBlock
              label="Simulated"
              value={simulated}
              color={scoreColor(simulated)}
              accent
              delta={lift > 0 ? `+${lift.toFixed(2)}` : null}
            />
          </>
        )}
      </div>

      <div className="ws-hero__meta">
        <div className="ws-hero__gap">
          <span className="ws-hero__gap-label">Gap to close</span>
          <span className="ws-hero__gap-val" style={{ color: gapColor(current, goal) }}>{gap.toFixed(2)}</span>
        </div>
        <div className={`ws-hero__status ws-hero__status--${stat.tone}`}>
          {stat.text}
        </div>
      </div>
    </div>
  )
}

function ScoreBlock({ label, value, color, accent, delta }) {
  const animatedValue = useTween(value)
  return (
    <div className={`ws-score-block${accent ? ' ws-score-block--accent' : ''}`}>
      <div className="ws-score-block__label">{label}</div>
      <div className="ws-score-block__row">
        <div className="ws-score-block__val" style={{ color }}>
          {fmtRollup(animatedValue)}
          <span className="ws-score-block__denom"> / 5</span>
        </div>
        {delta && <div className="ws-score-block__delta">{delta}</div>}
      </div>
    </div>
  )
}

// Smoothly tween a numeric value over ~250ms when it changes — gives the workshop
// hero a "live ticker" feel that draws the client's eye to deltas.
function useTween(target, durationMs = 280) {
  const [display, setDisplay] = useState(target)
  const startRef = useRef({ value: target, time: performance.now() })

  useEffect(() => {
    if (target === display) return
    const fromValue = display
    const fromTime = performance.now()
    startRef.current = { value: fromValue, time: fromTime }
    let raf
    const tick = (now) => {
      const t = Math.min(1, (now - fromTime) / durationMs)
      const eased = 1 - Math.pow(1 - t, 3) // easeOutCubic
      const v = fromValue + (target - fromValue) * eased
      setDisplay(v)
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target]) // eslint-disable-line react-hooks/exhaustive-deps

  return display
}

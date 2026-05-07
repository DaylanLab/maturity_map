import { useEffect, useRef, useState } from 'react'
import { scoreColor, gapColor, fmtRollup } from '../utils/scoring'
import HelpTip from './HelpTip'

const TIPS = {
  current:   { title: 'Current Maturity', text: 'Weighted average of every subcategory score across all six CSF functions, on the CMMI 1–5 scale. Each function counts equally; categories within a function count equally; subcategories within a category count equally.' },
  goal:      { title: 'Goal Maturity',    text: 'Same calculation as current, but using your target scores. This is where the organization wants to be at the end of the planning horizon.' },
  simulated: { title: 'Simulated',        text: 'Projected overall maturity if the fixes you\'ve applied in the Roadmap tab were completed. Shows the lift you can promise the room.' },
  gap:       { title: 'Gap to close',     text: 'Goal minus current, on the 1–5 scale. The bigger this is, the more transformation work is ahead.' },
  status:    { title: 'Workshop status',  text: 'A one-glance read of where you stand: ≥4.5 Optimizing, ≥3.5 On Track, ≥2.0 At Risk, below 2.0 Critical.' },
}

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
        <ScoreBlock label="Current Maturity" tip={TIPS.current} value={current} color={scoreColor(current)} />
        <span className="material-symbols-outlined ws-hero__arrow">trending_flat</span>
        <ScoreBlock label="Goal Maturity" tip={TIPS.goal} value={goal} color={scoreColor(goal)} />

        {simulated != null && (
          <>
            <span className="ws-hero__div" />
            <ScoreBlock
              label="Simulated"
              tip={TIPS.simulated}
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
          <span className="ws-hero__gap-label">
            Gap to close
            <HelpTip title={TIPS.gap.title} text={TIPS.gap.text} placement="left" size={12} />
          </span>
          <span className="ws-hero__gap-val" style={{ color: gapColor(current, goal) }}>{gap.toFixed(2)}</span>
        </div>
        <div className={`ws-hero__status ws-hero__status--${stat.tone}`} title={`${TIPS.status.title}: ${TIPS.status.text}`}>
          {stat.text}
          <HelpTip title={TIPS.status.title} text={TIPS.status.text} placement="left" size={12} />
        </div>
      </div>
    </div>
  )
}

function ScoreBlock({ label, tip, value, color, accent, delta }) {
  const animatedValue = useTween(value)
  return (
    <div className={`ws-score-block${accent ? ' ws-score-block--accent' : ''}`}>
      <div className="ws-score-block__label">
        {label}
        {tip && <HelpTip title={tip.title} text={tip.text} placement="bottom" size={12} />}
      </div>
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

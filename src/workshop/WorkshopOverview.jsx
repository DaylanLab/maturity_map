import { useMemo } from 'react'
import { computeFocusAreas, scoreColor, gapColor, fmtRollup } from '../utils/scoring'
import { FUNCTION_TIPS, levelInfo } from '../utils/tips'

// Workshop home — a 60-second walkthrough.
// Three sections, top to bottom:
//   1. Function bars (current vs goal) — instant "where are we" read.
//   2. Top 3 highest-impact gaps — the room's attention should go here.
//   3. Three CTAs that route the consultant into the workflow tabs.
export default function WorkshopOverview({
  nistData,
  scores,
  goalScores,
  weights,
  currentRollups,
  goalRollups,
  onGoTo,
}) {
  const focus = useMemo(
    () => computeFocusAreas(nistData, scores, goalScores, weights, 3),
    [nistData, scores, goalScores, weights]
  )

  return (
    <div className="ws-overview">
      <section className="ws-overview__section">
        <header className="ws-overview__section-head">
          <h2>Where are we today?</h2>
          <p>Each bar is one CSF function. Filled portion = current maturity, dashed portion = goal.</p>
        </header>
        <div className="ws-overview__bars">
          {nistData.functions.map(fn => {
            const cur = currentRollups.functionScores[fn.id] ?? 1
            const goal = goalRollups.functionScores[fn.id] ?? cur
            return (
              <FunctionBar
                key={fn.id}
                fn={fn}
                current={cur}
                goal={goal}
                onClick={() => onGoTo('current', fn.id)}
              />
            )
          })}
        </div>
      </section>

      <section className="ws-overview__section">
        <header className="ws-overview__section-head">
          <h2>Highest-impact gaps</h2>
          <p>Closing these three lifts overall maturity the most for the least effort.</p>
        </header>
        {focus.length === 0 ? (
          <div className="ws-overview__no-gaps">
            <span className="material-symbols-outlined">verified</span>
            All goals currently met or exceeded.
          </div>
        ) : (
          <div className="ws-overview__focus-grid">
            {focus.map((item, i) => (
              <button
                key={item.subcatId}
                className="ws-overview__focus-card"
                onClick={() => onGoTo('roadmap', item.functionId)}
              >
                <div className="ws-overview__focus-rank">#{i + 1}</div>
                <div className="ws-overview__focus-id">{item.subcatId}</div>
                <div className="ws-overview__focus-name">{item.categoryName}</div>
                <div className="ws-overview__focus-row">
                  <span className="ws-overview__focus-chip" style={{ background: scoreColor(item.current) }}>
                    {item.current.toFixed(1)}
                  </span>
                  <span className="material-symbols-outlined">arrow_forward</span>
                  <span className="ws-overview__focus-chip" style={{ background: scoreColor(item.goal) }}>
                    {item.goal.toFixed(1)}
                  </span>
                </div>
                <div className="ws-overview__focus-impact">
                  +{item.impactPct.toFixed(2)}% overall lift
                </div>
              </button>
            ))}
          </div>
        )}
      </section>

      <section className="ws-overview__section">
        <header className="ws-overview__section-head">
          <h2>Run the workshop</h2>
          <p>Three flows. Pick where the conversation is today.</p>
        </header>
        <div className="ws-overview__cta-grid">
          <CtaCard
            icon="monitoring"
            title="Assess current state"
            sub="Walk the team through every subcategory. Adjust scores live."
            onClick={() => onGoTo('current')}
          />
          <CtaCard
            icon="flag"
            title="Set goals"
            sub="Decide where you want to be 12–18 months from now."
            onClick={() => onGoTo('goals')}
          />
          <CtaCard
            icon="route"
            title="Build the roadmap"
            sub="Simulate which fixes move the needle — show the lift live."
            onClick={() => onGoTo('roadmap')}
          />
        </div>
      </section>
    </div>
  )
}

function FunctionBar({ fn, current, goal, onClick }) {
  const curPct = ((current - 1) / 4) * 100
  const goalPct = ((goal - 1) / 4) * 100
  return (
    <button className="ws-fn-bar" onClick={onClick} title={fn.name}>
      <div className="ws-fn-bar__head">
        <span className="ws-fn-bar__id">{fn.id}</span>
        <span className="ws-fn-bar__name">{fn.name}</span>
        <span className="ws-fn-bar__score" style={{ color: scoreColor(current) }}>
          {fmtRollup(current)}
        </span>
      </div>
      <div className="ws-fn-bar__track">
        <div
          className="ws-fn-bar__goal"
          style={{ width: `${goalPct}%`, borderColor: scoreColor(goal) }}
          title={`Goal ${goal.toFixed(2)}`}
        />
        <div
          className="ws-fn-bar__current"
          style={{ width: `${curPct}%`, background: scoreColor(current) }}
        />
      </div>
      <div className="ws-fn-bar__sub">
        <span style={{ color: gapColor(current, goal) }}>
          gap {Math.max(0, goal - current).toFixed(2)}
        </span>
        <span className="ws-fn-bar__lvl">{levelInfo(current).name}</span>
      </div>
      <div className="ws-fn-bar__tip">{FUNCTION_TIPS[fn.id]}</div>
    </button>
  )
}

function CtaCard({ icon, title, sub, onClick }) {
  return (
    <button className="ws-cta-card" onClick={onClick}>
      <span className="material-symbols-outlined ws-cta-card__icon">{icon}</span>
      <div className="ws-cta-card__title">{title}</div>
      <div className="ws-cta-card__sub">{sub}</div>
      <span className="material-symbols-outlined ws-cta-card__chev">chevron_right</span>
    </button>
  )
}

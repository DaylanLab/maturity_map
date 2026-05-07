import { useState, useMemo, useCallback } from 'react'
import { NIST_CSF } from '../data/nistData'
import { computeWeights, computeRollups } from '../utils/scoring'
import WorkshopHero from './WorkshopHero'
import WorkshopOverview from './WorkshopOverview'
import WorkshopTreemap from './WorkshopTreemap'
import WorkshopDetail from './WorkshopDetail'
import WorkshopFocus from './WorkshopFocus'
import HelpTip from './HelpTip'

const ALL_SUBCAT_IDS = NIST_CSF.functions.flatMap(fn =>
  fn.categories.flatMap(cat => cat.subcategories.map(s => s.id))
)
const WEIGHTS = computeWeights(NIST_CSF)

// Same baseline as the standard app, so a consultant gets identical numbers either way.
const DEFAULT_SCORES = {
  'GV.OC-01': 3.2, 'GV.OC-02': 2.8, 'GV.OC-03': 3.5, 'GV.OC-04': 2.4, 'GV.OC-05': 2.6,
  'GV.RM-01': 2.9, 'GV.RM-02': 2.3, 'GV.RM-03': 2.1, 'GV.RM-04': 2.5,
  'GV.RM-05': 2.0, 'GV.RM-06': 1.8, 'GV.RM-07': 1.5,
  'GV.RR-01': 3.0, 'GV.RR-02': 3.2, 'GV.RR-03': 2.4, 'GV.RR-04': 2.8,
  'GV.PO-01': 3.1, 'GV.PO-02': 2.6,
  'GV.OV-01': 2.3, 'GV.OV-02': 2.1, 'GV.OV-03': 2.5,
  'GV.SC-01': 1.8, 'GV.SC-02': 2.0, 'GV.SC-03': 1.6, 'GV.SC-04': 2.2, 'GV.SC-05': 1.9,
  'GV.SC-06': 2.1, 'GV.SC-07': 1.7, 'GV.SC-08': 1.5, 'GV.SC-09': 1.6, 'GV.SC-10': 1.4,
  'ID.AM-01': 3.4, 'ID.AM-02': 3.2, 'ID.AM-03': 2.5, 'ID.AM-04': 2.3,
  'ID.AM-05': 2.8, 'ID.AM-07': 2.4, 'ID.AM-08': 2.9,
  'ID.RA-01': 3.0, 'ID.RA-02': 2.7, 'ID.RA-03': 2.8, 'ID.RA-04': 2.5, 'ID.RA-05': 2.3,
  'ID.RA-06': 2.6, 'ID.RA-07': 2.2, 'ID.RA-08': 2.4, 'ID.RA-09': 2.0, 'ID.RA-10': 1.8,
  'ID.IM-01': 2.6, 'ID.IM-02': 2.3, 'ID.IM-03': 2.5, 'ID.IM-04': 2.8,
  'PR.AA-01': 3.6, 'PR.AA-02': 3.0, 'PR.AA-03': 3.8, 'PR.AA-04': 2.9,
  'PR.AA-05': 3.3, 'PR.AA-06': 3.1,
  'PR.AT-01': 3.4, 'PR.AT-02': 2.9,
  'PR.DS-01': 3.2, 'PR.DS-02': 3.5, 'PR.DS-10': 2.6, 'PR.DS-11': 3.0,
  'PR.PS-01': 3.1, 'PR.PS-02': 3.3, 'PR.PS-03': 2.8, 'PR.PS-04': 3.0,
  'PR.PS-05': 2.7, 'PR.PS-06': 2.5,
  'PR.IR-01': 3.2, 'PR.IR-02': 2.8, 'PR.IR-03': 2.6, 'PR.IR-04': 2.9,
  'DE.CM-01': 3.2, 'DE.CM-02': 2.6, 'DE.CM-03': 2.8, 'DE.CM-06': 2.3, 'DE.CM-09': 3.0,
  'DE.AE-02': 2.7, 'DE.AE-03': 2.9, 'DE.AE-04': 2.5, 'DE.AE-06': 2.8,
  'DE.AE-07': 2.3, 'DE.AE-08': 2.6,
  'RS.MA-01': 2.8, 'RS.MA-02': 2.9, 'RS.MA-03': 2.7, 'RS.MA-04': 2.5, 'RS.MA-05': 2.3,
  'RS.AN-03': 2.4, 'RS.AN-06': 2.6, 'RS.AN-07': 2.5, 'RS.AN-08': 2.2,
  'RS.CO-02': 2.9, 'RS.CO-03': 2.6,
  'RS.MI-01': 3.0, 'RS.MI-02': 2.7,
  'RC.RP-01': 2.6, 'RC.RP-02': 2.5, 'RC.RP-03': 2.8, 'RC.RP-04': 2.2,
  'RC.RP-05': 2.7, 'RC.RP-06': 2.3,
  'RC.CO-03': 2.4, 'RC.CO-04': 1.9,
}
const DEFAULT_GOALS = Object.fromEntries(
  ALL_SUBCAT_IDS.map(id => {
    const cur = DEFAULT_SCORES[id] ?? 1
    return [id, Math.min(5, Math.round((cur + 1) * 2) / 2)]
  })
)

const TABS = [
  {
    id: 'overview', label: 'Overview', icon: 'dashboard',
    help: 'A 60-second snapshot of where the organization stands today, the biggest gaps, and three places to take the workshop next.',
  },
  {
    id: 'current', label: 'Current State', icon: 'monitoring',
    help: 'Walk the room through every CSF subcategory and capture today\'s maturity. Click a tile to pin it, then drag the slider to score live.',
  },
  {
    id: 'goals', label: 'Set Goals', icon: 'flag',
    help: 'Decide where the organization wants to be in 12–18 months. Adjusting goals here updates the heatmap so you can show targeted state.',
  },
  {
    id: 'roadmap', label: 'Roadmap', icon: 'route',
    help: 'Heatmap colors switch to "gap" mode (green = met, red = wide gap). Use the simulator on the right to model "what if we fix X?" — the hero updates live.',
  },
]

export default function WorkshopApp() {
  const [scores, setScores] = useState(() => ({ ...DEFAULT_SCORES }))
  const [goalScores, setGoalScores] = useState(() => ({ ...DEFAULT_GOALS }))
  // Independent simulated overlay used in the Roadmap tab to model "what if we did X".
  const [simulated, setSimulated] = useState({})
  const [tab, setTab] = useState('overview')
  const [selectedFn, setSelectedFn] = useState('GV')
  const [hoverId, setHoverId] = useState(null)
  const [pinnedId, setPinnedId] = useState(null)

  const currentRollups = useMemo(() => computeRollups(NIST_CSF, scores), [scores])
  const goalRollups = useMemo(() => computeRollups(NIST_CSF, goalScores), [goalScores])
  // Effective scores when simulating: scores overlaid by any applied simulations.
  const simScores = useMemo(() => ({ ...scores, ...simulated }), [scores, simulated])
  const simRollups = useMemo(() => computeRollups(NIST_CSF, simScores), [simScores])

  const detailId = pinnedId ?? hoverId

  const setScore = useCallback((id, val) => {
    setScores(prev => ({ ...prev, [id]: val }))
  }, [])
  const setGoal = useCallback((id, val) => {
    setGoalScores(prev => ({ ...prev, [id]: val }))
  }, [])
  const applyFix = useCallback((id) => {
    setSimulated(prev => ({ ...prev, [id]: goalScores[id] ?? scores[id] }))
  }, [goalScores, scores])
  const unapplyFix = useCallback((id) => {
    setSimulated(prev => {
      const next = { ...prev }
      delete next[id]
      return next
    })
  }, [])
  const resetSimulation = useCallback(() => setSimulated({}), [])

  const handleSelect = useCallback((id) => {
    setPinnedId(prev => (prev === id ? null : id))
  }, [])
  const handleSelectFn = useCallback((fnId) => {
    setSelectedFn(fnId)
    setPinnedId(null)
  }, [])

  const goTo = useCallback((nextTab, fnId) => {
    setTab(nextTab)
    if (fnId) setSelectedFn(fnId)
  }, [])

  // Map tab → which scores drive the heatmap colors.
  const heatmapMode = tab === 'goals' ? 'goal' : tab === 'roadmap' ? 'gap' : 'current'

  return (
    <div className="ws-app">
      {/* Slim top nav: brand, tabs */}
      <header className="ws-topnav">
        <div className="ws-topnav__brand">
          <span className="material-symbols-outlined">hub</span>
          <span>CMMI Maturity Workshop</span>
        </div>
        <nav className="ws-topnav__tabs">
          {TABS.map(t => (
            <div key={t.id} className="ws-tab-wrap">
              <button
                className={`ws-tab${tab === t.id ? ' ws-tab--active' : ''}`}
                onClick={() => setTab(t.id)}
              >
                <span className="material-symbols-outlined">{t.icon}</span>
                <span>{t.label}</span>
              </button>
              <HelpTip title={t.label} text={t.help} placement="bottom" />
            </div>
          ))}
        </nav>
      </header>

      {/* Workshop hero — the narrative anchor, always visible */}
      <WorkshopHero
        current={currentRollups.overall}
        goal={goalRollups.overall}
        simulated={Object.keys(simulated).length > 0 ? simRollups.overall : null}
        tab={tab}
      />

      {/* Tab body */}
      <main className="ws-main">
        {tab === 'overview' && (
          <WorkshopOverview
            nistData={NIST_CSF}
            scores={scores}
            goalScores={goalScores}
            weights={WEIGHTS}
            currentRollups={currentRollups}
            goalRollups={goalRollups}
            onGoTo={goTo}
          />
        )}

        {(tab === 'current' || tab === 'goals' || tab === 'roadmap') && (
          <div className="ws-canvas">
            <WorkshopSideRail
              functions={NIST_CSF.functions}
              functionScores={(tab === 'goals' ? goalRollups : currentRollups).functionScores}
              selectedFn={selectedFn}
              onSelectFn={handleSelectFn}
            />

            <WorkshopTreemap
              nistData={NIST_CSF}
              scores={tab === 'roadmap' ? simScores : scores}
              goalScores={goalScores}
              weights={WEIGHTS}
              selectedFnId={selectedFn}
              mode={heatmapMode}
              hoverId={hoverId}
              pinnedId={pinnedId}
              onHover={setHoverId}
              onSelect={handleSelect}
            />

            {tab === 'roadmap' ? (
              <WorkshopFocus
                nistData={NIST_CSF}
                scores={scores}
                goalScores={goalScores}
                weights={WEIGHTS}
                simulated={simulated}
                onApply={applyFix}
                onUnapply={unapplyFix}
                onReset={resetSimulation}
                onSelect={(id, fnId) => { setPinnedId(id); if (fnId) setSelectedFn(fnId) }}
                pinnedId={pinnedId}
                overallCurrent={currentRollups.overall}
                overallSimulated={simRollups.overall}
                overallGoal={goalRollups.overall}
              />
            ) : (
              <WorkshopDetail
                nistData={NIST_CSF}
                subcatId={detailId}
                pinned={!!pinnedId}
                scores={scores}
                goalScores={goalScores}
                weights={WEIGHTS}
                editingMode={tab === 'goals' ? 'goal' : 'current'}
                onScoreChange={tab === 'goals' ? setGoal : setScore}
              />
            )}
          </div>
        )}
      </main>
    </div>
  )
}

// Slim left rail showing function letters + scores.
function WorkshopSideRail({ functions, functionScores, selectedFn, onSelectFn }) {
  return (
    <aside className="ws-rail">
      {functions.map(fn => {
        const score = functionScores[fn.id] ?? 1
        const active = fn.id === selectedFn
        return (
          <button
            key={fn.id}
            className={`ws-rail__item${active ? ' ws-rail__item--active' : ''}`}
            onClick={() => onSelectFn(fn.id)}
            title={fn.name}
          >
            <span className="ws-rail__id">{fn.id}</span>
            <span className="ws-rail__score">{score.toFixed(1)}</span>
          </button>
        )
      })}
    </aside>
  )
}

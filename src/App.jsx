import { useState, useMemo } from 'react'
import { NIST_CSF } from './data/nistData'
import { computeWeights, computeRollups, scoreColor, fmtRollup } from './utils/scoring'
import TopNavBar from './components/TopNavBar'
import SideNavBar from './components/SideNavBar'
import Treemap from './components/Treemap'
import SelectionContext from './components/SelectionContext'
import FocusAreas from './components/FocusAreas'

const ALL_SUBCAT_IDS = NIST_CSF.functions.flatMap(fn =>
  fn.categories.flatMap(cat => cat.subcategories.map(s => s.id))
)

const WEIGHTS = computeWeights(NIST_CSF)

// Global shift applied to the baseline scores below. Real client baselines
// tend to land lower than our raw seed values suggested, so we pull the whole
// distribution down ~0.6 (clamped at 1.0). Tweak this single constant to
// rebaseline the whole demo without touching individual values.
const BASELINE_SHIFT = -0.6
const RAW_DEFAULT_SCORES = {
  // GV.OC — Organizational Context
  'GV.OC-01': 3.2, 'GV.OC-02': 2.8, 'GV.OC-03': 3.5, 'GV.OC-04': 2.4, 'GV.OC-05': 2.6,
  // GV.RM — Risk Management Strategy
  'GV.RM-01': 2.9, 'GV.RM-02': 2.3, 'GV.RM-03': 2.1, 'GV.RM-04': 2.5,
  'GV.RM-05': 2.0, 'GV.RM-06': 1.8, 'GV.RM-07': 1.5,
  // GV.RR — Roles, Responsibilities, and Authorities
  'GV.RR-01': 3.0, 'GV.RR-02': 3.2, 'GV.RR-03': 2.4, 'GV.RR-04': 2.8,
  // GV.PO — Policy
  'GV.PO-01': 3.1, 'GV.PO-02': 2.6,
  // GV.OV — Oversight
  'GV.OV-01': 2.3, 'GV.OV-02': 2.1, 'GV.OV-03': 2.5,
  // GV.SC — Supply Chain Risk Management
  'GV.SC-01': 1.8, 'GV.SC-02': 2.0, 'GV.SC-03': 1.6, 'GV.SC-04': 2.2, 'GV.SC-05': 1.9,
  'GV.SC-06': 2.1, 'GV.SC-07': 1.7, 'GV.SC-08': 1.5, 'GV.SC-09': 1.6, 'GV.SC-10': 1.4,
  // ID.AM — Asset Management
  'ID.AM-01': 3.4, 'ID.AM-02': 3.2, 'ID.AM-03': 2.5, 'ID.AM-04': 2.3,
  'ID.AM-05': 2.8, 'ID.AM-07': 2.4, 'ID.AM-08': 2.9,
  // ID.RA — Risk Assessment
  'ID.RA-01': 3.0, 'ID.RA-02': 2.7, 'ID.RA-03': 2.8, 'ID.RA-04': 2.5, 'ID.RA-05': 2.3,
  'ID.RA-06': 2.6, 'ID.RA-07': 2.2, 'ID.RA-08': 2.4, 'ID.RA-09': 2.0, 'ID.RA-10': 1.8,
  // ID.IM — Improvement
  'ID.IM-01': 2.6, 'ID.IM-02': 2.3, 'ID.IM-03': 2.5, 'ID.IM-04': 2.8,
  // PR.AA — Access Control
  'PR.AA-01': 3.6, 'PR.AA-02': 3.0, 'PR.AA-03': 3.8, 'PR.AA-04': 2.9,
  'PR.AA-05': 3.3, 'PR.AA-06': 3.1,
  // PR.AT — Awareness and Training
  'PR.AT-01': 3.4, 'PR.AT-02': 2.9,
  // PR.DS — Data Security
  'PR.DS-01': 3.2, 'PR.DS-02': 3.5, 'PR.DS-10': 2.6, 'PR.DS-11': 3.0,
  // PR.PS — Platform Security
  'PR.PS-01': 3.1, 'PR.PS-02': 3.3, 'PR.PS-03': 2.8, 'PR.PS-04': 3.0,
  'PR.PS-05': 2.7, 'PR.PS-06': 2.5,
  // PR.IR — Infrastructure Resilience
  'PR.IR-01': 3.2, 'PR.IR-02': 2.8, 'PR.IR-03': 2.6, 'PR.IR-04': 2.9,
  // DE.CM — Continuous Monitoring
  'DE.CM-01': 3.2, 'DE.CM-02': 2.6, 'DE.CM-03': 2.8, 'DE.CM-06': 2.3, 'DE.CM-09': 3.0,
  // DE.AE — Adverse Event Analysis
  'DE.AE-02': 2.7, 'DE.AE-03': 2.9, 'DE.AE-04': 2.5, 'DE.AE-06': 2.8,
  'DE.AE-07': 2.3, 'DE.AE-08': 2.6,
  // RS.MA — Incident Management
  'RS.MA-01': 2.8, 'RS.MA-02': 2.9, 'RS.MA-03': 2.7, 'RS.MA-04': 2.5, 'RS.MA-05': 2.3,
  // RS.AN — Incident Analysis
  'RS.AN-03': 2.4, 'RS.AN-06': 2.6, 'RS.AN-07': 2.5, 'RS.AN-08': 2.2,
  // RS.CO — Reporting and Communication
  'RS.CO-02': 2.9, 'RS.CO-03': 2.6,
  // RS.MI — Incident Mitigation
  'RS.MI-01': 3.0, 'RS.MI-02': 2.7,
  // RC.RP — Incident Recovery Plan Execution
  'RC.RP-01': 2.6, 'RC.RP-02': 2.5, 'RC.RP-03': 2.8, 'RC.RP-04': 2.2,
  'RC.RP-05': 2.7, 'RC.RP-06': 2.3,
  // RC.CO — Incident Recovery Communication
  'RC.CO-03': 2.4, 'RC.CO-04': 1.9,
}

// Apply the shift; round to 1 decimal; clamp to the valid 1.0–5.0 range.
const DEFAULT_SCORES = Object.fromEntries(
  Object.entries(RAW_DEFAULT_SCORES).map(([id, v]) => [
    id,
    Math.max(1, Math.min(5, Math.round((v + BASELINE_SHIFT) * 10) / 10)),
  ])
)

// Default goals: every subcategory aims one CMMI level higher (capped at 5),
// rounded to the nearest 0.5 — a sensible workshop starting point.
const DEFAULT_GOALS = Object.fromEntries(
  ALL_SUBCAT_IDS.map(id => {
    const cur = DEFAULT_SCORES[id] ?? 1
    const target = Math.min(5, Math.round((cur + 1) * 2) / 2)
    return [id, target]
  })
)

const FN_DESCRIPTIONS = {
  GV: 'Cybersecurity risk management strategy, expectations, and policy.',
  ID: "Understanding the organization's assets, risks, and cybersecurity posture.",
  PR: 'Safeguards to ensure delivery of critical infrastructure services.',
  DE: 'Activities to identify the occurrence of a cybersecurity event.',
  RS: 'Activities to take action regarding a detected cybersecurity incident.',
  RC: 'Plans for resilience and restoration of capabilities or services.',
}

function statusLabel(score) {
  if (score >= 4.5) return { text: 'Optimizing', color: '#1e5631' }
  if (score >= 3.5) return { text: 'On Track', color: '#1e5631' }
  if (score >= 2.0) return { text: 'At Risk', color: '#a83a00' }
  return { text: 'Critical', color: '#e0301e' }
}

export default function App() {
  const [scores, setScores] = useState(() => ({ ...DEFAULT_SCORES }))
  const [goalScores, setGoalScores] = useState(() => ({ ...DEFAULT_GOALS }))
  const [viewMode, setViewMode] = useState('current') // 'current' | 'goal' | 'gap'
  const [selected, setSelected] = useState(null)
  const [selectedFn, setSelectedFn] = useState('GV')

  const currentRollups = useMemo(() => computeRollups(NIST_CSF, scores), [scores])
  const goalRollups = useMemo(() => computeRollups(NIST_CSF, goalScores), [goalScores])

  // The "active" rollups drive the side nav & function header. Goal mode shows goal rollups.
  const activeRollups = viewMode === 'goal' ? goalRollups : currentRollups

  function handleScore(subcatId, value) {
    if (viewMode === 'goal') {
      setGoalScores(prev => ({ ...prev, [subcatId]: value }))
    } else {
      // In gap and current modes, edits go to current scores.
      setScores(prev => ({ ...prev, [subcatId]: value }))
    }
  }

  function handleSelect(subcatId, optFnId) {
    setSelected(prev => (prev === subcatId ? null : subcatId))
    if (optFnId && optFnId !== selectedFn) setSelectedFn(optFnId)
  }

  function handleSelectFn(fnId) {
    setSelectedFn(fnId)
    setSelected(null)
  }

  function handleChangeView(mode) {
    setViewMode(mode)
    setSelected(null)
  }

  const activeFn = NIST_CSF.functions.find(fn => fn.id === selectedFn)
  const fnScoreCurrent = currentRollups.functionScores[selectedFn] ?? 1
  const fnScoreGoal = goalRollups.functionScores[selectedFn] ?? fnScoreCurrent
  const fnScoreActive = viewMode === 'goal' ? fnScoreGoal : fnScoreCurrent
  const status = statusLabel(fnScoreCurrent)

  // Show focus areas in gap mode; otherwise standard SelectionContext.
  const showFocusAreas = viewMode === 'gap'

  return (
    <div className="app">
      <TopNavBar
        overall={currentRollups.overall}
        overallGoal={goalRollups.overall}
        functionScores={activeRollups.functionScores}
        functions={NIST_CSF.functions}
        viewMode={viewMode}
        onChangeView={handleChangeView}
      />

      <div className="app__body">
        <SideNavBar
          functions={NIST_CSF.functions}
          functionScores={activeRollups.functionScores}
          selectedFn={selectedFn}
          onSelectFn={handleSelectFn}
        />

        <main className="app__main">
          <div className="fn-header">
            <div className="fn-header__left">
              <div className="fn-header__title">
                {activeFn.name.charAt(0) + activeFn.name.slice(1).toLowerCase()} ({activeFn.id})
                <span className={`fn-header__mode-tag fn-header__mode-tag--${viewMode}`}>
                  {viewMode === 'goal' ? 'Goal Setting' : viewMode === 'gap' ? 'Gap Analysis' : 'Current State'}
                </span>
              </div>
              <div className="fn-header__desc">
                {FN_DESCRIPTIONS[activeFn.id]}
              </div>
            </div>
            <div className="fn-header__right">
              <div className="fn-header__score-block">
                <span className="fn-header__score-label">
                  {viewMode === 'goal' ? 'Goal Score' : 'Current Score'}
                </span>
                <span className="fn-header__score-value" style={{ color: scoreColor(fnScoreActive) }}>
                  {fmtRollup(fnScoreActive)} / 5.0
                </span>
              </div>
              {viewMode !== 'current' && (
                <>
                  <div className="fn-header__divider" />
                  <div className="fn-header__score-block">
                    <span className="fn-header__score-label">
                      {viewMode === 'goal' ? 'Current Score' : 'Goal Score'}
                    </span>
                    <span
                      className="fn-header__score-value"
                      style={{ color: scoreColor(viewMode === 'goal' ? fnScoreCurrent : fnScoreGoal) }}
                    >
                      {fmtRollup(viewMode === 'goal' ? fnScoreCurrent : fnScoreGoal)} / 5.0
                    </span>
                  </div>
                </>
              )}
              <div className="fn-header__divider" />
              <div className="fn-header__status-block">
                <span className="fn-header__status-label">Status</span>
                <span className="fn-header__status-badge" style={{ background: status.color }}>
                  {status.text}
                </span>
              </div>
            </div>
          </div>

          <div className={`app__canvas${showFocusAreas ? ' app__canvas--focus-only' : ''}`}>
            {/* Gap Analysis & Roadmap is a pure prioritized-card view —
                the heatmap on the other tabs already shows where things stand,
                so we don't re-render it here. FocusAreas takes the full width. */}
            {!showFocusAreas && (
              <Treemap
                nistData={NIST_CSF}
                scores={scores}
                goalScores={goalScores}
                weights={WEIGHTS}
                selected={selected}
                onSelect={handleSelect}
                selectedFnId={selectedFn}
                viewMode={viewMode}
              />
            )}

            {showFocusAreas ? (
              <FocusAreas
                nistData={NIST_CSF}
                scores={scores}
                goalScores={goalScores}
                weights={WEIGHTS}
                selected={selected}
                onSelect={handleSelect}
                overallCurrent={currentRollups.overall}
                overallGoal={goalRollups.overall}
              />
            ) : selected ? (
              <SelectionContext
                subcatId={selected}
                nistData={NIST_CSF}
                scores={scores}
                goalScores={goalScores}
                categoryScores={activeRollups.categoryScores}
                weights={WEIGHTS}
                onScore={handleScore}
                viewMode={viewMode}
              />
            ) : null}
          </div>
        </main>
      </div>
    </div>
  )
}

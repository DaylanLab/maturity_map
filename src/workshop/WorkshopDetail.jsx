import { useMemo } from 'react'
import { scoreColor, gapColor } from '../utils/scoring'
import { getTransitionTip, levelInfo, CMMI_LEVELS } from '../utils/tips'

// Persistent detail panel — shows whichever subcategory is hovered or pinned.
// Designed for legibility on a Zoom share: large type, generous spacing,
// inline slider so a consultant can adjust the score live without leaving the canvas.
export default function WorkshopDetail({
  nistData,
  subcatId,
  pinned,
  scores,
  goalScores,
  editingMode = 'current', // 'current' | 'goal'
  onScoreChange,
}) {
  const meta = useMemo(() => findSubcat(nistData, subcatId), [nistData, subcatId])

  if (!meta) {
    return (
      <aside className="ws-detail ws-detail--empty">
        <div className="ws-detail__empty">
          <span className="material-symbols-outlined ws-detail__empty-icon">touch_app</span>
          <div className="ws-detail__empty-title">Hover a tile, click to pin</div>
          <div className="ws-detail__empty-sub">
            Pinned tiles stay visible while you talk through them with the room.
          </div>
        </div>
      </aside>
    )
  }

  const cur = scores[subcatId] ?? 1
  const goal = goalScores[subcatId] ?? cur
  const editingValue = editingMode === 'goal' ? goal : cur
  const editingColor = scoreColor(editingValue)
  const tip = getTransitionTip(editingValue, Math.min(5, Math.ceil(editingValue + 0.01)))

  return (
    <aside className={`ws-detail${pinned ? ' ws-detail--pinned' : ''}`}>
      <header className="ws-detail__header">
        <div className="ws-detail__breadcrumb">
          {meta.fnId} · {meta.catId}
          {pinned && <span className="ws-detail__pin"><span className="material-symbols-outlined">push_pin</span> pinned</span>}
        </div>
        <h2 className="ws-detail__id">{subcatId}</h2>
        <div className="ws-detail__name">{meta.cat.name}</div>
      </header>

      <p className="ws-detail__desc">{meta.sub.description}</p>

      <div className="ws-detail__scores">
        <ScorePill label="Current" value={cur} color={scoreColor(cur)} />
        <span className="material-symbols-outlined ws-detail__arrow">arrow_forward</span>
        <ScorePill label="Goal" value={goal} color={scoreColor(goal)} />
        <div className="ws-detail__gap" style={{ color: gapColor(cur, goal) }}>
          gap {Math.max(0, goal - cur).toFixed(1)}
        </div>
      </div>

      <div className="ws-detail__editor">
        <div className="ws-detail__editor-label">
          Adjust {editingMode === 'goal' ? 'goal' : 'current'} maturity
          <span className="ws-detail__editor-val" style={{ color: editingColor }}>
            {editingValue.toFixed(1)} · {levelInfo(editingValue).name}
          </span>
        </div>
        <input
          type="range"
          min={1}
          max={5}
          step={0.1}
          value={editingValue}
          onChange={e => onScoreChange(subcatId, parseFloat(e.target.value))}
          className="ws-detail__slider"
          style={{ accentColor: editingColor }}
        />
        <div className="ws-detail__ticks">
          {[1, 2, 3, 4, 5].map(n => (
            <button
              key={n}
              className={`ws-detail__tick${Math.round(editingValue) === n ? ' ws-detail__tick--active' : ''}`}
              onClick={() => onScoreChange(subcatId, n)}
              title={CMMI_LEVELS[n].name}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      {tip && (
        <div className="ws-detail__tip">
          <div className="ws-detail__tip-headline">
            <span className="material-symbols-outlined">tips_and_updates</span>
            {tip.headline}
          </div>
          <ul className="ws-detail__tip-list">
            {tip.actions.slice(0, 3).map((a, i) => <li key={i}>{a}</li>)}
          </ul>
        </div>
      )}
    </aside>
  )
}

function ScorePill({ label, value, color }) {
  return (
    <div className="ws-score-pill">
      <div className="ws-score-pill__label">{label}</div>
      <div className="ws-score-pill__val" style={{ color }}>{value.toFixed(1)}</div>
    </div>
  )
}

function findSubcat(nistData, id) {
  if (!id) return null
  for (const fn of nistData.functions) {
    for (const cat of fn.categories) {
      const sub = cat.subcategories.find(s => s.id === id)
      if (sub) return { fnId: fn.id, fn, catId: cat.id, cat, sub }
    }
  }
  return null
}

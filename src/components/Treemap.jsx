import { useRef, useEffect, useState } from 'react'
import { hierarchy, treemap, treemapSquarify } from 'd3-hierarchy'
import { scoreColor, gapColor } from '../utils/scoring'
import { levelInfo } from '../utils/tips'

// Per-mode legends
const SCORE_LEGEND = [
  { score: 1.0, label: '1 — Initial' },
  { score: 2.0, label: '2 — Managed' },
  { score: 3.0, label: '3 — Defined' },
  { score: 4.0, label: '4 — Quantitatively Managed' },
  { score: 5.0, label: '5 — Optimizing' },
]

const GAP_LEGEND_STOPS = [
  { gap: 0.0, label: 'Goal met' },
  { gap: 1.0, label: 'Close' },
  { gap: 2.0, label: 'Significant gap' },
]

const CAT_LABEL_H = 18

export default function Treemap({
  nistData,
  scores,
  goalScores,
  weights,
  selected,
  onSelect,
  selectedFnId,
  viewMode = 'current', // 'current' | 'goal' | 'gap'
}) {
  const containerRef = useRef(null)
  const tooltipRef = useRef(null)
  const [dims, setDims] = useState({ width: 0, height: 0 })
  const [hover, setHover] = useState(null) // { subcatId, catId, fnId }

  useEffect(() => {
    if (!containerRef.current) return
    const ro = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect
      setDims({ width, height })
    })
    ro.observe(containerRef.current)
    return () => ro.disconnect()
  }, [])

  const filteredData = {
    ...nistData,
    functions: nistData.functions.filter(fn => fn.id === selectedFnId),
  }

  const catNames = {}
  const subDescriptions = {}
  for (const fn of nistData.functions) {
    for (const cat of fn.categories) {
      catNames[cat.id] = cat.name
      for (const sub of cat.subcategories) {
        subDescriptions[sub.id] = { description: sub.description, categoryName: cat.name, categoryId: cat.id, functionId: fn.id, functionName: fn.name }
      }
    }
  }

  const nodes = buildLayout(filteredData, scores, weights, dims.width, dims.height)

  const cellFill = (subId) => {
    const cur = scores[subId] ?? 1
    const goal = goalScores?.[subId] ?? cur
    if (viewMode === 'goal') return scoreColor(goal)
    if (viewMode === 'gap') return gapColor(cur, goal)
    return scoreColor(cur)
  }

  // Hover handlers — position the tooltip via ref to avoid re-rendering on every mousemove.
  const handleCellMove = (e, subId) => {
    if (hover?.subcatId !== subId) {
      setHover({ subcatId: subId })
    }
    if (!tooltipRef.current || !containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    let x = e.clientX - rect.left + 14
    let y = e.clientY - rect.top + 14
    const ttRect = tooltipRef.current.getBoundingClientRect()
    if (x + ttRect.width > rect.width - 8) x = e.clientX - rect.left - ttRect.width - 14
    if (y + ttRect.height > rect.height - 8) y = e.clientY - rect.top - ttRect.height - 14
    tooltipRef.current.style.left = `${x}px`
    tooltipRef.current.style.top = `${y}px`
  }

  const hoverInfo = hover ? subDescriptions[hover.subcatId] : null
  const hoverCurrent = hover ? scores[hover.subcatId] ?? 1 : null
  const hoverGoal = hover && goalScores ? (goalScores[hover.subcatId] ?? hoverCurrent) : null

  return (
    <div className="treemap-area">
      <div className="treemap-area__header">
        <span className="treemap-area__title">
          {viewMode === 'gap' ? 'Gap Analysis · Function Breakdown' : viewMode === 'goal' ? 'Goal State · Function Breakdown' : 'Current State · Function Breakdown'}
        </span>
        <div className="treemap-area__legend">
          {viewMode === 'gap'
            ? GAP_LEGEND_STOPS.map(({ gap, label }) => (
                <div key={gap} className="treemap-legend-item">
                  <div className="treemap-legend-swatch" style={{ background: gapColor(0, gap) }} />
                  <span>{label}</span>
                </div>
              ))
            : SCORE_LEGEND.map(({ score, label }) => (
                <div key={score} className="treemap-legend-item">
                  <div className="treemap-legend-swatch" style={{ background: scoreColor(score) }} />
                  <span>{label}</span>
                </div>
              ))}
        </div>
      </div>

      <div ref={containerRef} className="treemap-container">
        {dims.width > 0 && (
          <svg width={dims.width} height={dims.height} className="treemap-svg">
            {nodes.subcategories.map(sub => {
              const w = sub.x1 - sub.x0
              const h = sub.y1 - sub.y0
              const fill = cellFill(sub.id)
              const isSelected = selected === sub.id
              const isHovered = hover?.subcatId === sub.id
              // Pick text color based on perceived luminance of the fill
              const textColor = needsDarkText(fill) ? 'rgba(0,0,0,0.78)' : 'rgba(255,255,255,0.92)'
              return (
                <g
                  key={sub.id}
                  onClick={() => onSelect(sub.id)}
                  onMouseMove={(e) => handleCellMove(e, sub.id)}
                  onMouseLeave={() => setHover(null)}
                  style={{ cursor: 'pointer' }}
                >
                  <rect
                    x={sub.x0}
                    y={sub.y0}
                    width={w}
                    height={h}
                    fill={fill}
                    stroke={isSelected ? '#bb1004' : isHovered ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.08)'}
                    strokeWidth={isSelected ? 2.5 : isHovered ? 1.5 : 0.5}
                  />
                  {w > 30 && h > 16 && (
                    <text
                      x={sub.x0 + w / 2}
                      y={sub.y0 + h / 2 + 4}
                      textAnchor="middle"
                      fontSize={Math.min(10, w / 5)}
                      fontWeight={700}
                      fill={textColor}
                      style={{ pointerEvents: 'none', userSelect: 'none', fontFamily: 'Inter, sans-serif' }}
                    >
                      {sub.id}
                    </text>
                  )}
                </g>
              )
            })}

            {nodes.categories.map(cat => {
              const w = cat.x1 - cat.x0
              const h = cat.y1 - cat.y0
              if (w < 40 || h < CAT_LABEL_H + 4) return null
              const name = catNames[cat.id] ?? cat.id
              return (
                <g key={cat.id} style={{ pointerEvents: 'none' }}>
                  <rect x={cat.x0} y={cat.y0} width={w} height={CAT_LABEL_H} fill="rgba(0,0,0,0.45)" />
                  <text
                    x={cat.x0 + 6}
                    y={cat.y0 + CAT_LABEL_H - 5}
                    fontSize={9}
                    fontWeight={800}
                    fill="rgba(255,255,255,0.95)"
                    style={{ userSelect: 'none', fontFamily: 'Inter, sans-serif', letterSpacing: '0.06em' }}
                  >
                    {cat.id}
                  </text>
                  {w > 120 && (
                    <text
                      x={cat.x0 + 6 + cat.id.length * 6.5}
                      y={cat.y0 + CAT_LABEL_H - 5}
                      fontSize={9}
                      fontWeight={400}
                      fill="rgba(255,255,255,0.65)"
                      style={{ userSelect: 'none', fontFamily: 'Inter, sans-serif' }}
                    >
                      {name.length > 22 ? name.slice(0, 22) + '…' : name}
                    </text>
                  )}
                </g>
              )
            })}
          </svg>
        )}

        {/* Hover tooltip */}
        {hover && hoverInfo && (
          <div ref={tooltipRef} className="treemap-tooltip">
            <div className="treemap-tooltip__head">
              <span className="treemap-tooltip__id">{hover.subcatId}</span>
              <span className="treemap-tooltip__cat">{hoverInfo.categoryName}</span>
            </div>
            <div className="treemap-tooltip__desc">{hoverInfo.description}</div>
            <div className="treemap-tooltip__scores">
              <div className="treemap-tooltip__score-block">
                <span className="treemap-tooltip__score-label">Current</span>
                <span className="treemap-tooltip__score-val" style={{ color: scoreColor(hoverCurrent) }}>
                  {hoverCurrent.toFixed(1)} · {levelInfo(hoverCurrent).name}
                </span>
              </div>
              {goalScores && (
                <div className="treemap-tooltip__score-block">
                  <span className="treemap-tooltip__score-label">Goal</span>
                  <span className="treemap-tooltip__score-val" style={{ color: scoreColor(hoverGoal) }}>
                    {hoverGoal.toFixed(1)} · {levelInfo(hoverGoal).name}
                  </span>
                </div>
              )}
            </div>
            <div className="treemap-tooltip__hint">Click to {viewMode === 'goal' ? 'set goal' : viewMode === 'gap' ? 'inspect' : 'edit'}</div>
          </div>
        )}
      </div>
    </div>
  )
}

// Determine if a fill color is light enough that dark text is more readable.
function needsDarkText(hex) {
  if (!hex || hex.length < 7) return false
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  // Perceived luminance (rec. 601)
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return lum > 0.6
}

function buildLayout(nistData, scores, weights, width, height) {
  if (width === 0 || height === 0) return { categories: [], subcategories: [] }
  const root = {
    id: 'root',
    children: nistData.functions.map(fn => ({
      id: fn.id,
      children: fn.categories.map(cat => ({
        id: cat.id,
        children: cat.subcategories.map(sub => ({
          id: sub.id,
          value: weights[sub.id] ?? 0,
        })),
      })),
    })),
  }
  const h = hierarchy(root).sum(d => d.value ?? 0).sort((a, b) => b.value - a.value)
  const layout = treemap().size([width, height]).tile(treemapSquarify).paddingOuter(4).paddingTop(0).paddingInner(2)
  layout(h)
  const categories = []
  const subcategories = []
  h.each(node => {
    if (!node.data.id || node.data.id === 'root') return
    if (node.depth === 2) {
      categories.push({ id: node.data.id, x0: node.x0, y0: node.y0, x1: node.x1, y1: node.y1 })
    } else if (node.depth === 3) {
      subcategories.push({ id: node.data.id, x0: node.x0, y0: node.y0, x1: node.x1, y1: node.y1 })
    }
  })
  return { categories, subcategories }
}

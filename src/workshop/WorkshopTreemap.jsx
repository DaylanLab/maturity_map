import { useRef, useEffect, useState } from 'react'
import { hierarchy, treemap, treemapSquarify } from 'd3-hierarchy'
import { scoreColor, gapColor } from '../utils/scoring'

// Workshop-tuned heatmap.
// Differences vs the standard Treemap:
//   • Larger labels (readable on Zoom screen-share)
//   • Hover/select state lifted to parent via callbacks (drives persistent detail panel)
//   • No internal tooltip — the parent's WorkshopDetail/WorkshopFocus panel is the persistent view

const CAT_LABEL_H = 22

export default function WorkshopTreemap({
  nistData,
  scores,
  goalScores,
  weights,
  selectedFnId,
  mode = 'current', // 'current' | 'goal' | 'gap'
  hoverId,
  pinnedId,
  onHover,
  onSelect,
}) {
  const containerRef = useRef(null)
  const [dims, setDims] = useState({ width: 0, height: 0 })

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
  for (const fn of nistData.functions) {
    for (const cat of fn.categories) catNames[cat.id] = cat.name
  }

  const layout = buildLayout(filteredData, weights, dims.width, dims.height)

  const cellFill = (subId) => {
    const cur = scores[subId] ?? 1
    const goal = goalScores?.[subId] ?? cur
    if (mode === 'goal') return scoreColor(goal)
    if (mode === 'gap') return gapColor(cur, goal)
    return scoreColor(cur)
  }

  return (
    <div className="ws-treemap" ref={containerRef}>
      {dims.width > 0 && (
        <svg
          width={dims.width}
          height={dims.height}
          className="ws-treemap__svg"
          onMouseLeave={() => onHover(null)}
        >
          {layout.subcategories.map(sub => {
            const w = sub.x1 - sub.x0
            const h = sub.y1 - sub.y0
            const fill = cellFill(sub.id)
            const isPinned = pinnedId === sub.id
            const isHover = hoverId === sub.id && !isPinned
            const textColor = needsDarkText(fill) ? 'rgba(0,0,0,0.82)' : 'rgba(255,255,255,0.96)'
            const fontSize = Math.min(16, Math.max(10, w / 5))
            return (
              <g
                key={sub.id}
                onClick={() => onSelect(sub.id)}
                onMouseEnter={() => onHover(sub.id)}
                style={{ cursor: 'pointer' }}
              >
                <rect
                  x={sub.x0}
                  y={sub.y0}
                  width={w}
                  height={h}
                  fill={fill}
                  stroke={isPinned ? '#bb1004' : isHover ? 'rgba(255,255,255,0.92)' : 'rgba(0,0,0,0.08)'}
                  strokeWidth={isPinned ? 3 : isHover ? 2 : 0.5}
                />
                {w > 36 && h > 22 && (
                  <text
                    x={sub.x0 + w / 2}
                    y={sub.y0 + h / 2 + fontSize / 3}
                    textAnchor="middle"
                    fontSize={fontSize}
                    fontWeight={700}
                    fill={textColor}
                    style={{ pointerEvents: 'none', userSelect: 'none', fontFamily: 'Inter, sans-serif', letterSpacing: '0.02em' }}
                  >
                    {sub.id}
                  </text>
                )}
              </g>
            )
          })}

          {layout.categories.map(cat => {
            const w = cat.x1 - cat.x0
            const h = cat.y1 - cat.y0
            if (w < 60 || h < CAT_LABEL_H + 4) return null
            const name = catNames[cat.id] ?? cat.id
            return (
              <g key={cat.id} style={{ pointerEvents: 'none' }}>
                <rect x={cat.x0} y={cat.y0} width={w} height={CAT_LABEL_H} fill="rgba(0,0,0,0.55)" />
                <text
                  x={cat.x0 + 8}
                  y={cat.y0 + CAT_LABEL_H - 6}
                  fontSize={11}
                  fontWeight={800}
                  fill="rgba(255,255,255,0.96)"
                  style={{ userSelect: 'none', fontFamily: 'Inter, sans-serif', letterSpacing: '0.06em' }}
                >
                  {cat.id}
                </text>
                {w > 150 && (
                  <text
                    x={cat.x0 + 8 + cat.id.length * 7.5}
                    y={cat.y0 + CAT_LABEL_H - 6}
                    fontSize={11}
                    fontWeight={400}
                    fill="rgba(255,255,255,0.78)"
                    style={{ userSelect: 'none', fontFamily: 'Inter, sans-serif' }}
                  >
                    {name.length > 28 ? name.slice(0, 28) + '…' : name}
                  </text>
                )}
              </g>
            )
          })}
        </svg>
      )}

      {/* Inline legend, bottom-right, low-key */}
      <div className="ws-treemap__legend">
        {mode === 'gap' ? (
          <>
            <LegendChip color={gapColor(0, 0)} label="Goal met" />
            <LegendChip color={gapColor(0, 1)} label="Close" />
            <LegendChip color={gapColor(0, 2)} label="Gap" />
          </>
        ) : (
          <>
            <LegendChip color={scoreColor(1)} label="1 Initial" />
            <LegendChip color={scoreColor(2)} label="2 Managed" />
            <LegendChip color={scoreColor(3)} label="3 Defined" />
            <LegendChip color={scoreColor(4)} label="4 Quantified" />
            <LegendChip color={scoreColor(5)} label="5 Optimizing" />
          </>
        )}
      </div>
    </div>
  )
}

function LegendChip({ color, label }) {
  return (
    <div className="ws-treemap__legend-chip">
      <span className="ws-treemap__legend-swatch" style={{ background: color }} />
      <span>{label}</span>
    </div>
  )
}

function needsDarkText(hex) {
  if (!hex || hex.length < 7) return false
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return lum > 0.6
}

function buildLayout(nistData, weights, width, height) {
  if (width === 0 || height === 0) return { categories: [], subcategories: [] }
  const root = {
    id: 'root',
    children: nistData.functions.map(fn => ({
      id: fn.id,
      children: fn.categories.map(cat => ({
        id: cat.id,
        children: cat.subcategories.map(sub => ({ id: sub.id, value: weights[sub.id] ?? 0 })),
      })),
    })),
  }
  const h = hierarchy(root).sum(d => d.value ?? 0).sort((a, b) => b.value - a.value)
  treemap().size([width, height]).tile(treemapSquarify).paddingOuter(6).paddingTop(0).paddingInner(3)(h)

  const categories = [], subcategories = []
  h.each(node => {
    if (!node.data.id || node.data.id === 'root') return
    if (node.depth === 2) categories.push({ id: node.data.id, x0: node.x0, y0: node.y0, x1: node.x1, y1: node.y1 })
    else if (node.depth === 3) subcategories.push({ id: node.data.id, x0: node.x0, y0: node.y0, x1: node.x1, y1: node.y1 })
  })
  return { categories, subcategories }
}

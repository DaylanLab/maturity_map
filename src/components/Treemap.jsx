import { useRef, useEffect, useState } from 'react'
import { hierarchy, treemap, treemapSquarify } from 'd3-hierarchy'
import { scoreColor } from '../utils/scoring'

const TIER_LEGEND = [
  { score: 1.0, label: '1 — Initial' },
  { score: 2.0, label: '2 — Managed' },
  { score: 3.0, label: '3 — Defined' },
  { score: 4.0, label: '4 — Quantitatively Managed' },
  { score: 5.0, label: '5 — Optimizing' },
]

const CAT_LABEL_H = 18  // height of the category header strip

export default function Treemap({ nistData, scores, weights, selected, onSelect, selectedFnId }) {
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

  // Filter to selected function only
  const filteredData = {
    ...nistData,
    functions: nistData.functions.filter(fn => fn.id === selectedFnId),
  }

  // Build a name lookup: category id → full name
  const catNames = {}
  for (const fn of nistData.functions) {
    for (const cat of fn.categories) {
      catNames[cat.id] = cat.name
    }
  }

  const nodes = buildLayout(filteredData, scores, weights, dims.width, dims.height)

  return (
    <div className="treemap-area">
      <div className="treemap-area__header">
        <span className="treemap-area__title">Function Breakdown</span>
        <div className="treemap-area__legend">
          {TIER_LEGEND.map(({ score, label }) => (
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
            {/* Subcategory cells — drawn first so category labels sit on top */}
            {nodes.subcategories.map(sub => {
              const w = sub.x1 - sub.x0
              const h = sub.y1 - sub.y0
              const score = scores[sub.id] ?? 1
              const fill = scoreColor(score)
              const isSelected = selected === sub.id
              const textColor = score >= 2.5 && score <= 3.5 ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.9)'
              return (
                <g key={sub.id} onClick={() => onSelect(sub.id)} style={{ cursor: 'pointer' }}>
                  <rect
                    x={sub.x0}
                    y={sub.y0}
                    width={w}
                    height={h}
                    fill={fill}
                    stroke={isSelected ? '#bb1004' : 'rgba(0,0,0,0.08)'}
                    strokeWidth={isSelected ? 2.5 : 0.5}
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

            {/* Category label strips — drawn on top of cells */}
            {nodes.categories.map(cat => {
              const w = cat.x1 - cat.x0
              const h = cat.y1 - cat.y0
              if (w < 40 || h < CAT_LABEL_H + 4) return null
              const name = catNames[cat.id] ?? cat.id
              const stripH = CAT_LABEL_H
              return (
                <g key={cat.id} style={{ pointerEvents: 'none' }}>
                  {/* Frosted header strip */}
                  <rect
                    x={cat.x0}
                    y={cat.y0}
                    width={w}
                    height={stripH}
                    fill="rgba(0,0,0,0.45)"
                  />
                  {/* Category ID — left, bold */}
                  <text
                    x={cat.x0 + 6}
                    y={cat.y0 + stripH - 5}
                    fontSize={9}
                    fontWeight={800}
                    fill="rgba(255,255,255,0.95)"
                    style={{ userSelect: 'none', fontFamily: 'Inter, sans-serif', letterSpacing: '0.06em' }}
                  >
                    {cat.id}
                  </text>
                  {/* Category name — only if wide enough */}
                  {w > 120 && (
                    <text
                      x={cat.x0 + 6 + cat.id.length * 6.5}
                      y={cat.y0 + stripH - 5}
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
      </div>
    </div>
  )
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

  const h = hierarchy(root)
    .sum(d => d.value ?? 0)
    .sort((a, b) => b.value - a.value)

  const layout = treemap()
    .size([width, height])
    .tile(treemapSquarify)
    .paddingOuter(4)
    .paddingTop(0)
    .paddingInner(2)

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

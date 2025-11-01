import React, { useRef, useEffect, useState } from 'react'
import OpticalComponent from './OpticalComponent'

const COLS = 12
const ROWS = 8

function uid() {
  return Math.random().toString(36).slice(2, 9)
}

export default function Grid({ items, addItem, moveItem, selectedId, setSelectedId, simulationResult, updateItem }) {
  function handleDrop(e, cellX, cellY) {
    e.preventDefault()
    const compType = e.dataTransfer.getData('application/x-optical-component')
    const existingId = e.dataTransfer.getData('application/x-optical-instance')

    if (existingId) {
      // move existing
      moveItem(existingId, cellX, cellY)
      setSelectedId(existingId)
      return
    }

    if (compType) {
      // type-specific defaults
      let defaults = {}
      switch (compType) {
        case 'lens':
          defaults = { focalLength: 50, aperture: 25 }
          break
        case 'mirror':
          defaults = { angle: 0, reflectivity: 0.95 }
          break
        case 'beamsplitter':
          defaults = { splitRatio: 0.5 }
          break
        case 'fiber':
          defaults = { length: 100, coreDiameter: 9 }
          break
        case 'detector':
          defaults = { sensitivity: 1.0, noise: 0.01 }
          break
        default:
          defaults = {}
      }

      const newItem = {
        id: uid(),
        type: compType,
        x: cellX,
        y: cellY,
        rotation: 0,
        label: compType,
        color: '#ffcc00',
        ...defaults
      }
      addItem(newItem)
      setSelectedId(newItem.id)
    }
  }

  function onDragOver(e) {
    e.preventDefault()
  }

  const cells = []
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const cellX = c
      const cellY = r
      const cellItems = items.filter((it) => it.x === cellX && it.y === cellY)
      const key = `cell-${cellX}-${cellY}`
      cells.push(
        <div
          key={key}
          className="grid-cell"
          onDrop={(e) => handleDrop(e, cellX, cellY)}
          onDragOver={onDragOver}
        >
          {cellItems.map((it) => (
            <OpticalComponent
              key={it.id}
              item={it}
              isSelected={selectedId === it.id}
              setSelectedId={setSelectedId}
              updateItem={updateItem}
            />
          ))}
        </div>
      )
    }
  }

  // overlay handling for rays
  const containerRef = useRef(null)
  const [cellSize, setCellSize] = useState({ w: 0, h: 0 })

  useEffect(() => {
    function measure() {
      const el = containerRef.current
      if (!el) return
      // find one cell and measure
      const cell = el.querySelector('.grid-cell')
      if (!cell) return
      const rect = cell.getBoundingClientRect()
      setCellSize({ w: rect.width, h: rect.height })
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [])

  function renderRays() {
    if (!simulationResult || !simulationResult.rays) return null
    const rays = simulationResult.rays
    const scale = Math.max(1, Math.min(cellSize.w, cellSize.h) / 10)
    return (
      <svg className="grid-overlay" viewBox={`0 0 ${COLS * cellSize.w} ${ROWS * cellSize.h}`} preserveAspectRatio="none">
        <defs>
          <marker id="arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto" markerUnits="strokeWidth">
            <path d="M0,0 L6,3 L0,6 L2,3 z" fill="#ffcc00" />
          </marker>
        </defs>
        {rays.map((r, idx) => {
          const ox = (r.origin?.x ?? 0) * cellSize.w + cellSize.w / 2
          const oy = (r.origin?.y ?? 0) * cellSize.h + cellSize.h / 2
          const angle = ((r.directionDeg ?? 0) - 90) * (Math.PI / 180) // rotate so 0deg points right
          const len = (r.length ?? 50) * scale
          const ex = ox + Math.cos(angle) * len
          const ey = oy + Math.sin(angle) * len
          const color = `hsl(${(idx * 73) % 360} 90% 60%)`
          const pixelLen = Math.hypot(ex-ox, ey-oy)
          const duration = Math.max(0.6, Math.min(5, pixelLen / 200))
          return (
            <line
              key={`ray-${idx}`}
              x1={ox}
              y1={oy}
              x2={ex}
              y2={ey}
              stroke={color}
              strokeWidth={2}
              markerEnd="url(#arrow)"
              opacity={0.95}
              className="ray-anim"
              style={{ strokeDasharray: `${pixelLen}`, animationDuration: `${duration}s` }}
            />
          )
        })}
      </svg>
    )
  }

  return (
    <main className="grid-area" ref={containerRef}>
      <div className="grid" style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)` }}>
        {cells}
      </div>
      {renderRays()}
    </main>
  )
}

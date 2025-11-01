import React from 'react'

const COMPONENTS = [
  { type: 'lens', label: 'Lens' },
  { type: 'mirror', label: 'Mirror' },
  { type: 'beamsplitter', label: 'Beam Splitter' },
  { type: 'fiber', label: 'Optical Fiber' },
  { type: 'detector', label: 'Detector' }
]

export default function Toolbox() {
  function onDragStart(e, compType) {
    e.dataTransfer.setData('application/x-optical-component', compType)
    e.dataTransfer.effectAllowed = 'copy'
  }

  return (
    <aside className="toolbox">
      <h3>Toolbox</h3>
      <div className="toolbox-list">
        {COMPONENTS.map((c) => (
          <div
            key={c.type}
            className={`toolbox-item toolbox-item-${c.type}`}
            draggable
            onDragStart={(e) => onDragStart(e, c.type)}
            title={`Drag ${c.label} onto the grid`}
          >
            {c.label}
          </div>
        ))}
      </div>
      <p className="toolbox-hint">Drag an item into the grid to add it.</p>
    </aside>
  )
}

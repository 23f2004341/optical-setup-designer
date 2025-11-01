import React, { useState, useEffect } from 'react'
import Grid from './components/Grid'
import Toolbox from './components/Toolbox'
import SettingsPanel from './components/SettingsPanel'
import SimulationPanel from './components/SimulationPanel'

export default function App() {
  const [items, setItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('optical-items') || '[]')
    } catch (e) {
      return []
    }
  })
  const [selectedId, setSelectedId] = useState(null)
  const [simulationResult, setSimulationResult] = useState(null)

  useEffect(() => {
    localStorage.setItem('optical-items', JSON.stringify(items))
  }, [items])

  const addItem = (item) => setItems((s) => [...s, item])
  const updateItem = (id, patch) =>
    setItems((s) => s.map((it) => (it.id === id ? { ...it, ...patch } : it)))
  const moveItem = (id, x, y) => updateItem(id, { x, y })
  const removeItem = (id) => setItems((s) => s.filter((it) => it.id !== id))

  // wire up import handler
  useEffect(() => {
    const input = document.getElementById('import-json-input')
    if (!input) return
    function onFile(e) {
      const f = e.target.files && e.target.files[0]
      if (!f) return
      const reader = new FileReader()
      reader.onload = (ev) => {
        try {
          const parsed = JSON.parse(String(ev.target.result))
          const comps = parsed.components || parsed
          if (!Array.isArray(comps)) throw new Error('Invalid file format: components array missing')
          // basic normalization: ensure ids and defaults
          const normalized = comps.map((c, idx) => ({
            id: c.id || `imp-${Date.now()}-${idx}`,
            type: c.type || 'unknown',
            x: typeof c.x === 'number' ? c.x : 0,
            y: typeof c.y === 'number' ? c.y : 0,
            rotation: typeof c.rotation === 'number' ? c.rotation : 0,
            label: c.label || c.type || 'component',
            color: c.color || '#ffcc00',
            ...(c.properties || {}),
            ...c
          }))
          setItems(normalized)
          // clear file input
          input.value = ''
        } catch (err) {
          // eslint-disable-next-line no-console
          console.error('Import failed', err)
          alert('Failed to import JSON: ' + (err.message || err))
        }
      }
      reader.readAsText(f)
    }
    input.addEventListener('change', onFile)
    return () => input.removeEventListener('change', onFile)
  }, [setItems])

  return (
    <div className="app-root">
      <header className="app-header">
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <div>Optical Design — Drag & Drop Grid</div>
          <div style={{display:'flex',gap:8,alignItems:'center'}}>
            <input id="import-json-input" type="file" accept="application/json" style={{display:'none'}} />
            <button
              onClick={() => {
                const fileInput = document.getElementById('import-json-input')
                if (fileInput) fileInput.click()
              }}
              className="btn-primary"
            >
              Import JSON
            </button>
            <button
              onClick={() => {
                const payload = {
                  meta: { exportedAt: new Date().toISOString(), contact: { phone: '7906641128', email: 'prakhar.maheshwari@example.com' } },
                  components: items
                }
                const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = `optical-setup-${new Date().toISOString()}.json`
                document.body.appendChild(a)
                a.click()
                a.remove()
                URL.revokeObjectURL(url)
              }}
              className="btn-primary"
            >
              Download JSON
            </button>
          </div>
        </div>
      </header>
      <div className="app-body">
        <Toolbox />
        <Grid
          items={items}
          addItem={addItem}
          moveItem={moveItem}
          selectedId={selectedId}
          setSelectedId={setSelectedId}
          simulationResult={simulationResult}
        />
        <SimulationPanel items={items} setSimulationResult={setSimulationResult} />
        <SettingsPanel
          items={items}
          selectedId={selectedId}
          updateItem={updateItem}
          removeItem={removeItem}
        />
      </div>
    </div>
  )
}

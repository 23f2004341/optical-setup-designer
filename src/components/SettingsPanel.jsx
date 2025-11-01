import React from 'react'

export default function SettingsPanel({ items, selectedId, updateItem, removeItem }) {
  const item = items.find((it) => it.id === selectedId)

  if (!item) {
    return (
      <aside className="settings-panel">
        <h3>Settings</h3>
        <p className="muted">Select a component on the grid to configure it.</p>
      </aside>
    )
  }

  function onChange(e) {
    const { name, value, type } = e.target

    // fields that should be parsed as numbers
    const numericFields = new Set([
      'rotation',
      'focalLength',
      'aperture',
      'angle',
      'reflectivity',
      'splitRatio',
      'length',
      'coreDiameter',
      'sensitivity',
      'noise'
    ])

    let parsedValue = value
    if (numericFields.has(name)) {
      // use integer for rotation, float for others
      parsedValue = name === 'rotation' ? parseInt(value || '0', 10) : parseFloat(value || '0')
      if (Number.isNaN(parsedValue)) parsedValue = 0
    }

    updateItem(item.id, { [name]: parsedValue })
  }

  return (
    <aside className="settings-panel">
      <h3>Settings</h3>
      <div className="setting-row">
        <label>Type</label>
        <div>{item.type}</div>
      </div>
      <div className="setting-row">
        <label>Label</label>
        <input name="label" value={item.label || ''} onChange={onChange} />
      </div>
      <div className="setting-row">
        <label>Rotation</label>
        <input type="number" name="rotation" value={item.rotation ?? 0} onChange={onChange} />
      </div>
      <div className="setting-row">
        <label>Color</label>
        <input type="color" name="color" value={item.color || '#ffcc00'} onChange={onChange} />
      </div>

      {/* Type-specific settings */}
      {item.type === 'lens' && (
        <>
          <div className="setting-row">
            <label>Focal length (mm)</label>
            <input type="number" name="focalLength" value={item.focalLength ?? 0} onChange={onChange} />
          </div>
          <div className="setting-row">
            <label>Aperture (mm)</label>
            <input type="number" name="aperture" value={item.aperture ?? 0} onChange={onChange} />
          </div>
        </>
      )}

      {item.type === 'mirror' && (
        <>
          <div className="setting-row">
            <label>Angle (deg)</label>
            <input type="number" name="angle" value={item.angle ?? 0} onChange={onChange} />
          </div>
          <div className="setting-row">
            <label>Reflectivity (0-1)</label>
            <input type="number" step="0.01" min="0" max="1" name="reflectivity" value={item.reflectivity ?? 1} onChange={onChange} />
          </div>
        </>
      )}

      {item.type === 'beamsplitter' && (
        <div className="setting-row">
          <label>Split ratio (0-1 — fraction to first output)</label>
          <input type="number" step="0.01" min="0" max="1" name="splitRatio" value={item.splitRatio ?? 0.5} onChange={onChange} />
        </div>
      )}

      {item.type === 'fiber' && (
        <>
          <div className="setting-row">
            <label>Length (mm)</label>
            <input type="number" name="length" value={item.length ?? 0} onChange={onChange} />
          </div>
          <div className="setting-row">
            <label>Core diameter (µm)</label>
            <input type="number" name="coreDiameter" value={item.coreDiameter ?? 0} onChange={onChange} />
          </div>
        </>
      )}

      {item.type === 'detector' && (
        <>
          <div className="setting-row">
            <label>Sensitivity</label>
            <input type="number" step="0.01" name="sensitivity" value={item.sensitivity ?? 0} onChange={onChange} />
          </div>
          <div className="setting-row">
            <label>Noise</label>
            <input type="number" step="0.0001" name="noise" value={item.noise ?? 0} onChange={onChange} />
          </div>
        </>
      )}
      <div className="setting-actions">
        <button onClick={() => removeItem(item.id)} className="btn-danger">Remove</button>
      </div>
    </aside>
  )
}

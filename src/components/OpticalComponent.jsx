import React from 'react'

export default function OpticalComponent({ item, isSelected, setSelectedId, updateItem }) {
  function onDragStart(e) {
    e.stopPropagation()
    e.dataTransfer.setData('application/x-optical-instance', item.id)
    // also set type so receiver can differentiate; effectAllowed for move
    e.dataTransfer.setData('application/x-optical-component', item.type)
    e.dataTransfer.effectAllowed = 'move'
  }

  function onClick(e) {
    e.stopPropagation()
    setSelectedId(item.id)
  }

  const style = {
    transform: `rotate(${item.rotation ?? 0}deg)`,
    background: item.color
  }

  // rotation handle logic
  function startRotate(e) {
    e.stopPropagation()
    e.preventDefault()
    const el = e.currentTarget.parentElement
    if (!el) return
    const rect = el.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2

    function onMove(ev) {
      const mx = ev.clientX
      const my = ev.clientY
      const angle = Math.atan2(my - cy, mx - cx) * (180 / Math.PI)
      // normalize angle to 0-360
      let newRot = Math.round(angle + 90)
      newRot = ((newRot % 360) + 360) % 360
      updateItem && updateItem(item.id, { rotation: newRot })
    }

    function onUp() {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  return (
    <div
      className={`optical-item ${item.type} ${isSelected ? 'selected' : ''}`}
      draggable
      onDragStart={onDragStart}
      onClick={onClick}
      title={`${item.type}: ${item.label}`}
      style={style}
    >
      {isSelected && <div className="rotate-handle" onMouseDown={startRotate} title="Rotate" />}
      <span className="opt-label">{item.label}</span>
    </div>
  )
}

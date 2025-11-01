import React, { useRef, useEffect, useState } from 'react'
import { Chart, LineController, LineElement, PointElement, LinearScale, CategoryScale, Title, Tooltip, Legend } from 'chart.js'

Chart.register(LineController, LineElement, PointElement, LinearScale, CategoryScale, Title, Tooltip, Legend)

export default function SimulationPanel({ items, setSimulationResult }) {
  const canvasRef = useRef(null)
  const chartRef = useRef(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [angle, setAngle] = useState(0)
  const [freqStart, setFreqStart] = useState(100)
  const [freqStop, setFreqStop] = useState(10000)
  const [freqPoints, setFreqPoints] = useState(5)

  useEffect(() => {
    if (!canvasRef.current) return
    const ctx = canvasRef.current.getContext('2d')
    chartRef.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: [],
        datasets: []
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'top' }
        },
        scales: {
          x: { title: { display: true, text: 'Frequency (Hz)' } },
          y: { title: { display: true, text: 'Amplitude' } }
        }
      }
    })

    return () => {
      chartRef.current?.destroy()
      chartRef.current = null
    }
  }, [])

  function buildChart(freqData) {
    if (!chartRef.current) return
    const chart = chartRef.current
    const labels = [...new Set(freqData.map((d) => d.frequencyHz))].sort((a, b) => a - b)
    // group by componentId
    const groups = {}
    for (const d of freqData) {
      const key = d.componentId || d.type || 'unknown'
      if (!groups[key]) groups[key] = []
      groups[key].push(d)
    }

    chart.data.labels = labels
    chart.data.datasets = Object.keys(groups).map((key, idx) => {
      const g = groups[key]
      // map amplitudes in order of labels
      const data = labels.map((f) => {
        const found = g.find((x) => x.frequencyHz === f)
        return found ? found.amplitude : 0
      })
      const color = `hsl(${(idx * 73) % 360} 70% 50%)`
      return {
        label: String(key),
        data,
        borderColor: color,
        backgroundColor: color,
        tension: 0.2
      }
    })
    chart.update()
  }

  async function runSimulation() {
    setLoading(true)
    try {
      setError(null)
      const body = {
        components: items,
        options: {
          angleOfIncidence: Number(angle || 0),
          freqSweep: { start: Number(freqStart || 0), stop: Number(freqStop || 0), points: Number(freqPoints || 0) }
        }
      }

      const resp = await fetch('https://optical-setup-designer-s4y8.onrender.com/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      if (!resp.ok) throw new Error(`Server returned ${resp.status}`)
      const data = await resp.json()
      setSimulationResult && setSimulationResult(data)
      buildChart(data.frequencyAnalysis || [])
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Simulation error', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <aside className="simulation-panel">
      <h3>Simulation</h3>
      <div className="sim-actions">
        <div style={{display:'flex',gap:8,alignItems:'center',flexWrap:'wrap'}}>
          <label style={{fontSize:12,color:'#cbd5e1'}}>Angle (deg)</label>
          <input type="number" value={angle} onChange={(e)=>setAngle(e.target.value)} style={{width:80,padding:6,borderRadius:6}} />
          <label style={{fontSize:12,color:'#cbd5e1'}}>Freq start</label>
          <input type="number" value={freqStart} onChange={(e)=>setFreqStart(e.target.value)} style={{width:100,padding:6,borderRadius:6}} />
          <label style={{fontSize:12,color:'#cbd5e1'}}>Freq stop</label>
          <input type="number" value={freqStop} onChange={(e)=>setFreqStop(e.target.value)} style={{width:100,padding:6,borderRadius:6}} />
          <label style={{fontSize:12,color:'#cbd5e1'}}>Points</label>
          <input type="number" value={freqPoints} onChange={(e)=>setFreqPoints(e.target.value)} style={{width:80,padding:6,borderRadius:6}} />
          <button onClick={runSimulation} disabled={loading} className="btn-primary">
            {loading ? 'Running…' : 'Run Simulation'}
          </button>
        </div>
      </div>
      <div className="sim-chart">
        <canvas ref={canvasRef} />
      </div>
      {error && <div className="sim-error">Error: {error}</div>}
    </aside>
  )
}

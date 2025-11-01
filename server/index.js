import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import { config } from 'dotenv'

// Load environment variables
config()

const app = express()

// Security middleware
app.use(helmet())
app.use(compression())
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL || 'https://optical-setup-frontend.onrender.com'
    : 'http://localhost:5173'
}))
app.use(express.json({ limit: '1mb' }))

const PORT = process.env.PORT || 4000

// Basic health check
app.get('/health', (req, res) => res.json({ status: 'ok' }))

// POST /simulate
// Accepts JSON payload: { components: [ { id, type, x, y, rotation, ... } ] }
// Returns simulated rays + frequency analysis (dummy data)
app.post('/simulate', (req, res) => {
  const payload = req.body
  const components = Array.isArray(payload) ? payload : payload.components || []
  const options = payload.options || {}

  // read options
  const angleOfIncidence = Number(options.angleOfIncidence || 0)
  const freqSweep = options.freqSweep || null

  // Basic validation
  if (!Array.isArray(components)) {
    return res.status(400).json({ error: 'components must be an array' })
  }

  // Dummy simulation: for each component produce a few rays and a simple frequency response
  let frequencies = [100, 500, 1000, 5000, 10000]
  if (freqSweep && typeof freqSweep.start === 'number' && typeof freqSweep.stop === 'number' && typeof freqSweep.points === 'number' && freqSweep.points > 1) {
    const start = Math.max(0, Number(freqSweep.start))
    const stop = Math.max(0, Number(freqSweep.stop))
    const pts = Math.max(2, Math.floor(Number(freqSweep.points)))
    frequencies = []
    for (let i = 0; i < pts; i++) {
      const t = i / (pts - 1)
      frequencies.push(Math.round(start + (stop - start) * t))
    }
  }

  const rays = []
  const frequencyAnalysis = []

  for (const comp of components) {
    const baseIntensity = (comp.reflectivity ?? 1) * (comp.sensitivity ?? 1)

    // produce 3 dummy rays per component
    for (let i = 0; i < 3; i++) {
      const dir = ((comp.rotation ?? 0) + angleOfIncidence + i * 10) % 360
      rays.push({
        componentId: comp.id || null,
        type: comp.type || 'unknown',
        origin: { x: comp.x ?? 0, y: comp.y ?? 0 },
        directionDeg: dir,
        length: Math.round((comp.focalLength ?? 100) * (1 + i * 0.1)),
        intensity: parseFloat((baseIntensity * (1 - i * 0.1)).toFixed(3))
      })
    }

    // frequency response sample
    for (const f of frequencies) {
      // amplitude is a simple function of component properties and frequency
      const amplitude = Math.max(
        0,
        (baseIntensity * (1 - Math.log10(1 + f / 1000))) / (1 + (comp.noise || 0))
      )
      frequencyAnalysis.push({
        componentId: comp.id || null,
        type: comp.type || 'unknown',
        frequencyHz: f,
        amplitude: parseFloat(amplitude.toFixed(4))
      })
    }
  }

  // Support CSV output when query ?format=csv or Accept: text/csv
  const wantCsv = String(req.query.format || '').toLowerCase() === 'csv' || (req.headers.accept || '').includes('text/csv')
  if (wantCsv) {
    // produce CSV for frequencyAnalysis: componentId,type,frequencyHz,amplitude
    const header = ['componentId', 'type', 'frequencyHz', 'amplitude']
    const rows = [header.join(',')]
    for (const r of frequencyAnalysis) {
      const row = [
        JSON.stringify(r.componentId),
        JSON.stringify(r.type),
        String(r.frequencyHz),
        String(r.amplitude)
      ]
      rows.push(row.join(','))
    }
    const csv = rows.join('\r\n')
    res.setHeader('Content-Type', 'text/csv')
    res.setHeader('Content-Disposition', 'attachment; filename="frequency_analysis.csv"')
    return res.send(csv)
  }

  // default JSON response
  return res.json({ rays, frequencyAnalysis })
})

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Simulation API listening on http://localhost:${PORT}`)
})

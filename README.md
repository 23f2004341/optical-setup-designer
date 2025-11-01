# Optical Design Drag & Drop

This is a small React + Vite demo that implements a drag-and-drop grid for optical components (Lens, Mirror, Beam Splitter, Optical Fiber, Detector).

Features

- Drag components from the toolbox into the grid to add them.
- Drag placed components to reposition them on the grid using the HTML5 Drag & Drop API.
- Click a placed component to open the settings panel where you can change label, rotation, color, or remove the component.
- State is persisted to localStorage.

Quick start

1. Open a terminal in the project folder (Windows PowerShell recommended).
2. Install dependencies:

```powershell
npm install
```

3. Start the dev server:

```powershell
npm run dev
```

Open the URL shown by Vite (usually http://localhost:5173).

Notes

- This project uses the HTML5 Drag and Drop API — it's intentionally minimal and framework-agnostic. You can replace it with a library like react-dnd if you need more features.
- Grid size and visuals are controlled in `src/components/Grid.jsx` and `src/styles.css`.

Running the simulation API

1. Start the Express simulation API (in a separate terminal):

```powershell
npm run start-server
```

2. The API listens on port 4000 by default. Example requests:

- POST JSON and get JSON back:

```powershell
curl -X POST http://localhost:4000/simulate -H "Content-Type: application/json" -d "{ \"components\": [{ \"id\": \"c1\", \"type\": \"lens\", \"x\": 1, \"y\": 2, \"focalLength\": 50 } ] }"
```

- Request CSV output (frequency analysis):

```powershell
curl -X POST "http://localhost:4000/simulate?format=csv" -H "Content-Type: application/json" -d "{ \"components\": [{ \"id\": \"c1\", \"type\": \"lens\", \"x\": 1, \"y\": 2, \"focalLength\": 50 } ] }"
```

The simulation endpoint currently returns dummy ray and frequency data and is intended as a placeholder for more advanced ray-tracing and signal-processing logic.

Front-end: running simulations from the UI

After starting both the dev server (Vite) and the simulation API (Express), open the app in the browser. The right-side "Simulation" panel contains a "Run Simulation" button.

- Clicking "Run Simulation" sends the current components (from the grid) to the API at `http://localhost:4000/simulate` and updates the frequency-response chart.
- The chart shows amplitude vs frequency per component (dummy data from the server). Use this as a hook to replace the server logic later with a real ray tracer.

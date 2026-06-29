# AllCoast

AllCoast is a surf forecasting web app. It shows a clean surf report with spot search, surf rating, swell, wind, best window, tide predictions, spot rules, and hourly forecast rows. Surf height is adjusted by local spot exposure so places like Pipeline do not show offshore swell as breaking surf when the direction is blocked.

## Data Sources

- Wave and swell forecast: Open-Meteo Marine API
- Wind forecast: Open-Meteo Weather API
- Tide predictions: NOAA CO-OPS Tides and Currents

No API keys are required for the forecast app.

## Setup

1. Install dependencies with `npm install`.
2. Run the app locally with `npm run dev`.
3. Open `http://localhost:3000`.

For a production-style local run:

```bash
npm run build
npm start
```

`npm run build` is intentionally a no-op for this version. The app is served directly by Node, which avoids Vite/esbuild deployment failures.

## Render Deploy

Use these settings if you create a Render Web Service manually:

- Build command: `npm install && npm run build`
- Start command: `npm start`
- Health check path: `/api/status`

The repo also includes `render.yaml` with the same settings.

## Checks

```bash
npm run lint
npm run build
```

## Notes

Spot profiles live in `lib/forecast.ts`. Add or tune breaks there with coordinates, ideal swell direction, ideal wind direction, tide station, ideal wave size, and local surf-height exposure rules. Users choose named spots in the app.

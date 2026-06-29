# AllCoast

AllCoast is a clean surf forecasting web app for swell, wind, tides, and spot quality. It is built as a simple React + Vite frontend with a small Node/Express forecast server.

## What It Does

- Shows surf height, swell direction, swell period, wind, tide, best window, and spot notes
- Includes saved spot search and favorites
- Supports custom latitude/longitude forecasts
- Uses free forecast sources with no API keys required

## Forecast Sources

- Wave and swell forecast: Open-Meteo Marine API
- Wind forecast: Open-Meteo Weather API
- Tide predictions: NOAA CO-OPS Tides and Currents

## Local Setup

```bash
npm install
npm run dev
```

Then open:

```text
http://localhost:3000
```

## Render Setup

Create a new Render Web Service from the GitHub repo and use:

```text
Build Command: npm install && npm run build
Start Command: npm start
Health Check Path: /api/status
```

Node is pinned to version 20 through `package.json` and `.node-version`.

## Add Or Tune Surf Spots

Edit `lib/forecast.ts`. Each spot has coordinates, ideal wave height, tide station, best swell directions, best wind directions, break type, and local notes.

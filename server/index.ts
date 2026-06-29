import express from "express";
import path from "node:path";
import { existsSync } from "node:fs";
import { buildForecast, forecastInputSchema, resolveSpot, SPOTS, type RawHourly } from "../lib/forecast";

const app = express();
const port = Number(process.env.PORT || 3000);

app.disable("x-powered-by");
app.use(express.json({ limit: "256kb" }));

app.get("/api/status", (_request, response) => {
  response.json({
    app: "AllCoast",
    service: "forecast",
    sources: ["Open-Meteo Marine", "Open-Meteo Weather", "NOAA CO-OPS"],
  });
});

app.get("/api/spots", (_request, response) => response.json({ spots: SPOTS }));

app.get("/api/forecast", async (request, response) => {
  const parsed = forecastInputSchema.safeParse(request.query);
  if (!parsed.success) return response.status(400).json({ error: "Choose a valid surf spot." });

  const spot = resolveSpot(parsed.data);

  try {
    const [marine, weather, tide] = await Promise.all([
      fetchMarineForecast(spot),
      fetchWeatherForecast(spot),
      fetchTideSummary(spot.tideStationId),
    ]);
    response.json({ forecast: buildForecast(spot, (marine.hourly ?? {}) as RawHourly, (weather.hourly ?? {}) as RawHourly, new Date(), tide) });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Forecast data could not be loaded.";
    response.status(502).json({ error: message });
  }
});

async function fetchMarineForecast(spot: { latitude: number; longitude: number }) {
  const attempts = [
    { cellSelection: "sea", imperial: true },
    { cellSelection: "nearest", imperial: true },
    { cellSelection: "nearest", imperial: false },
  ];
  const errors: string[] = [];

  for (const attempt of attempts) {
    try {
      const params = new URLSearchParams({
        latitude: String(spot.latitude),
        longitude: String(spot.longitude),
        hourly: [
          "wave_height",
          "wave_direction",
          "wave_period",
          "swell_wave_height",
          "swell_wave_direction",
          "swell_wave_period",
        ].join(","),
        timezone: "auto",
        forecast_days: "3",
        cell_selection: attempt.cellSelection,
      });
      if (attempt.imperial) params.set("length_unit", "imperial");

      const data = await fetchJson(`https://marine-api.open-meteo.com/v1/marine?${params.toString()}`);
      return attempt.imperial ? data : convertMarineMetersToFeet(data);
    } catch (error) {
      errors.push(error instanceof Error ? error.message : "Marine source failed.");
    }
  }

  throw new Error(`Live wave data is not available for this spot right now. ${errors[errors.length - 1] ?? "Try refreshing or choosing another spot."}`);
}

async function fetchWeatherForecast(spot: { latitude: number; longitude: number }) {
  const params = new URLSearchParams({
    latitude: String(spot.latitude),
    longitude: String(spot.longitude),
    hourly: ["wind_speed_10m", "wind_direction_10m"].join(","),
    timezone: "auto",
    forecast_days: "3",
    wind_speed_unit: "mph",
  });

  try {
    return await fetchJson(`https://api.open-meteo.com/v1/forecast?${params.toString()}`);
  } catch {
    return { hourly: {} };
  }
}

async function fetchJson(url: string) {
  const response = await fetch(url);
  let data: Record<string, unknown> = {};
  try {
    data = await response.json();
  } catch {
    data = {};
  }

  if (!response.ok || data.error === true) {
    const reason = typeof data.reason === "string" ? data.reason : typeof data.error === "string" ? data.error : response.statusText;
    throw new Error(reason || "Forecast source did not return usable data.");
  }

  return data as { hourly?: Record<string, unknown> };
}

function convertMarineMetersToFeet(data: { hourly?: Record<string, unknown> }) {
  const hourly = data.hourly ?? {};
  return {
    ...data,
    hourly: {
      ...hourly,
      wave_height: convertArrayMetersToFeet(hourly.wave_height),
      swell_wave_height: convertArrayMetersToFeet(hourly.swell_wave_height),
    },
  };
}

function convertArrayMetersToFeet(value: unknown) {
  if (!Array.isArray(value)) return value;
  return value.map((item) => (typeof item === "number" ? item * 3.28084 : item));
}

async function fetchTideSummary(stationId: string | null) {
  if (!stationId) return null;
  const today = new Date();
  const end = new Date(today);
  end.setDate(today.getDate() + 3);
  const params = new URLSearchParams({
    begin_date: formatNoaaDate(today),
    end_date: formatNoaaDate(end),
    station: stationId,
    product: "predictions",
    datum: "MLLW",
    time_zone: "lst_ldt",
    interval: "hilo",
    units: "english",
    application: "AllCoast",
    format: "json",
  });
  try {
    const response = await fetch(`https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?${params.toString()}`);
    if (!response.ok) return null;
    const data = await response.json();
    const predictions = Array.isArray(data.predictions) ? data.predictions : [];
    return predictions.slice(0, 6).map((prediction: Record<string, unknown>) => ({
      time: typeof prediction.t === "string" ? prediction.t : "",
      heightFeet: Number.isFinite(Number(prediction.v)) ? Number(prediction.v) : null,
      type: prediction.type === "H" ? "High" : prediction.type === "L" ? "Low" : "Tide",
    }));
  } catch {
    return null;
  }
}

function formatNoaaDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}${month}${day}`;
}

const distPath = path.join(process.cwd(), "dist");
const publicPath = path.join(process.cwd(), "public");
if (existsSync(distPath)) {
  app.use(express.static(distPath));
  app.use((request, response, next) => {
    if (request.path.startsWith("/api/")) return next();
    response.sendFile(path.join(distPath, "index.html"));
  });
} else if (existsSync(publicPath)) {
  app.use(express.static(publicPath));
  app.use((request, response, next) => {
    if (request.path.startsWith("/api/")) return next();
    response.sendFile(path.join(publicPath, "index.html"));
  });
}

app.use((error: unknown, _request: express.Request, response: express.Response, _next: express.NextFunction) => {
  console.error(error);
  response.status(500).json({ error: "AllCoast could not complete that request." });
});

app.listen(port, () => console.log(`AllCoast forecast running at http://localhost:${port}`));

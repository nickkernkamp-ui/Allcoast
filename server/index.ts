import express from "express";
import path from "node:path";
import { existsSync } from "node:fs";
import { buildForecast, forecastInputSchema, resolveSpot, SPOTS } from "../lib/forecast";

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
  const marineParams = new URLSearchParams({
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
    length_unit: "imperial",
  });
  const weatherParams = new URLSearchParams({
    latitude: String(spot.latitude),
    longitude: String(spot.longitude),
    hourly: ["wind_speed_10m", "wind_direction_10m", "wind_gusts_10m"].join(","),
    timezone: "auto",
    forecast_days: "3",
    wind_speed_unit: "mph",
  });

  try {
    const [marineResponse, weatherResponse, tide] = await Promise.all([
      fetch(`https://marine-api.open-meteo.com/v1/marine?${marineParams.toString()}`),
      fetch(`https://api.open-meteo.com/v1/forecast?${weatherParams.toString()}`),
      fetchTideSummary(spot.tideStationId),
    ]);
    if (!marineResponse.ok || !weatherResponse.ok) throw new Error("Forecast source did not return usable data.");
    const [marine, weather] = await Promise.all([marineResponse.json(), weatherResponse.json()]);
    response.json({ forecast: buildForecast(spot, marine.hourly ?? {}, weather.hourly ?? {}, new Date(), tide) });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Forecast data could not be loaded.";
    response.status(502).json({ error: message });
  }
});

async function fetchTideSummary(stationId: string | null) {
  if (!stationId) return null;
  const params = new URLSearchParams({
    date: "today",
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

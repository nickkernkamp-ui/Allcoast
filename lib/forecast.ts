import { z } from "zod";

export interface SurfSpot {
  id: string;
  name: string;
  region: string;
  latitude: number;
  longitude: number;
  idealWaveHeightFeet: [number, number];
  idealTideFeet: [number, number] | null;
  tideStationId: string | null;
  tideNote: string;
  bestSwellDirections: number[];
  bestWindDirections: number[];
  breakType: string;
  note: string;
}

export interface TideSummary {
  status: "planned" | "available";
  stationId: string | null;
  idealRangeFeet: [number, number] | null;
  note: string;
  predictions: TidePrediction[];
}

export interface TidePrediction {
  time: string;
  heightFeet: number | null;
  type: string;
}

export interface ForecastHour {
  time: string;
  score: number;
  waveHeightFeet: number | null;
  swellHeightFeet: number | null;
  swellPeriodSeconds: number | null;
  swellDirectionDegrees: number | null;
  windSpeedMph: number | null;
  windGustMph: number | null;
  windDirectionDegrees: number | null;
  rating: string;
  summary: string;
}

export interface SurfForecast {
  spot: SurfSpot;
  generatedAt: string;
  overallScore: number;
  bestWindow: string;
  current: ForecastHour | null;
  hours: ForecastHour[];
  tide: TideSummary;
  source: string;
  recommendation: string;
}

export const SPOTS: SurfSpot[] = [
  {
    id: "malibu",
    name: "Malibu",
    region: "CA",
    latitude: 34.0329,
    longitude: -118.6784,
    idealWaveHeightFeet: [2, 5],
    idealTideFeet: [1.5, 4.5],
    tideStationId: "9410840",
    tideNote: "Generally best around low to mid tide with a clean push.",
    bestSwellDirections: [180, 200, 220],
    bestWindDirections: [20, 45, 70],
    breakType: "right point",
    note: "Best on clean south to southwest swell with light offshore or calm wind.",
  },
  {
    id: "lowers",
    name: "Lower Trestles",
    region: "CA",
    latitude: 33.3839,
    longitude: -117.5939,
    idealWaveHeightFeet: [3, 6],
    idealTideFeet: [1, 4],
    tideStationId: "9410230",
    tideNote: "Often best with enough water over the cobblestones, then improving through the push.",
    bestSwellDirections: [190, 210, 230],
    bestWindDirections: [45, 70, 90],
    breakType: "cobblestone peak",
    note: "Likes longer-period south and southwest swell with light morning wind.",
  },
  {
    id: "huntington",
    name: "Huntington Beach",
    region: "CA",
    latitude: 33.6553,
    longitude: -118.0034,
    idealWaveHeightFeet: [2, 6],
    idealTideFeet: [0.5, 4.5],
    tideStationId: "9410660",
    tideNote: "Tide can shift sandbar quality quickly; mid tide is the starting read.",
    bestSwellDirections: [180, 210, 260],
    bestWindDirections: [35, 60, 80],
    breakType: "beach break",
    note: "Can handle mixed swell, but wind texture changes the score quickly.",
  },
  {
    id: "ocean-beach-sf",
    name: "Ocean Beach",
    region: "SF",
    latitude: 37.7594,
    longitude: -122.5107,
    idealWaveHeightFeet: [3, 8],
    idealTideFeet: [1, 5],
    tideStationId: "9414290",
    tideNote: "Tide window depends on sandbar, size, and current; avoid maxed-out water movement.",
    bestSwellDirections: [270, 290, 310],
    bestWindDirections: [70, 90, 110],
    breakType: "powerful beach break",
    note: "Needs manageable size, organized period, and clean wind to really line up.",
  },
  {
    id: "pipeline",
    name: "Pipeline",
    region: "HI",
    latitude: 21.6649,
    longitude: -158.0521,
    idealWaveHeightFeet: [4, 10],
    idealTideFeet: [0.5, 2.5],
    tideStationId: "1612340",
    tideNote: "Lower tide can make the reef more critical; tide read should be paired with size and experience.",
    bestSwellDirections: [300, 315, 330],
    bestWindDirections: [90, 110, 130],
    breakType: "reef break",
    note: "Rewards northwest energy and clean easterly trade wind.",
  },
];

export const forecastInputSchema = z.object({
  spotId: z.string().optional(),
  latitude: z.coerce.number().min(-90).max(90).optional(),
  longitude: z.coerce.number().min(-180).max(180).optional(),
  name: z.string().trim().max(80).optional(),
});

export type ForecastInput = z.infer<typeof forecastInputSchema>;

interface RawHourly {
  time?: string[];
  wave_height?: Array<number | null>;
  wave_direction?: Array<number | null>;
  wave_period?: Array<number | null>;
  swell_wave_height?: Array<number | null>;
  swell_wave_direction?: Array<number | null>;
  swell_wave_period?: Array<number | null>;
  wind_speed_10m?: Array<number | null>;
  wind_direction_10m?: Array<number | null>;
  wind_gusts_10m?: Array<number | null>;
}

export function resolveSpot(input: ForecastInput): SurfSpot {
  const preset = SPOTS.find((spot) => spot.id === input.spotId) ?? SPOTS[0];
  if (input.latitude == null || input.longitude == null) return preset;
  return {
    ...preset,
    id: "custom",
    name: input.name?.trim() || "Custom spot",
    region: "Custom",
    latitude: input.latitude,
    longitude: input.longitude,
  };
}

export function buildForecast(spot: SurfSpot, marine: RawHourly, weather: RawHourly, now = new Date(), tidePredictions: TidePrediction[] | null = null): SurfForecast {
  const marineHours = marine.time ?? [];
  const weatherByTime = new Map((weather.time ?? []).map((time, index) => [time, index]));
  const hours = marineHours
    .map((time, index) => {
      const weatherIndex = weatherByTime.get(time);
      return scoreHour(spot, {
        time,
        waveHeightFeet: readNumber(marine.wave_height, index),
        swellHeightFeet: readNumber(marine.swell_wave_height, index),
        swellPeriodSeconds: readNumber(marine.swell_wave_period, index) ?? readNumber(marine.wave_period, index),
        swellDirectionDegrees: readNumber(marine.swell_wave_direction, index) ?? readNumber(marine.wave_direction, index),
        windSpeedMph: weatherIndex == null ? null : readNumber(weather.wind_speed_10m, weatherIndex),
        windGustMph: weatherIndex == null ? null : readNumber(weather.wind_gusts_10m, weatherIndex),
        windDirectionDegrees: weatherIndex == null ? null : readNumber(weather.wind_direction_10m, weatherIndex),
      });
    })
    .filter((hour) => new Date(hour.time).getTime() >= now.getTime() - 60 * 60 * 1000)
    .slice(0, 48);

  const current = hours[0] ?? null;
  const best = [...hours].sort((a, b) => b.score - a.score)[0] ?? null;
  const overallScore = best?.score ?? current?.score ?? 0;

  return {
    spot,
    generatedAt: now.toISOString(),
    overallScore,
    bestWindow: best ? getBestWindow(hours, best) : "No forecast window available",
    current,
    hours,
    tide: {
      status: tidePredictions?.length ? "available" : "planned",
      stationId: spot.tideStationId,
      idealRangeFeet: spot.idealTideFeet,
      note: spot.tideNote,
      predictions: tidePredictions ?? [],
    },
    source: "Open-Meteo marine and weather forecasts",
    recommendation: buildRecommendation(spot, best ?? current),
  };
}

function scoreHour(spot: SurfSpot, hour: Omit<ForecastHour, "score" | "rating" | "summary">): ForecastHour {
  const height = scoreWaveHeight(hour.waveHeightFeet, spot.idealWaveHeightFeet);
  const swell = scoreDirection(hour.swellDirectionDegrees, spot.bestSwellDirections);
  const wind = scoreWind(hour.windDirectionDegrees, hour.windSpeedMph, spot.bestWindDirections);
  const period = scorePeriod(hour.swellPeriodSeconds);
  const score = round((height * 0.35 + wind * 0.3 + swell * 0.2 + period * 0.15) * 10, 1);

  return {
    ...hour,
    score,
    rating: ratingForScore(score),
    summary: summarizeHour(score, hour),
  };
}

function scoreWaveHeight(height: number | null, ideal: [number, number]) {
  if (height == null) return 0.4;
  const [min, max] = ideal;
  if (height >= min && height <= max) return 1;
  if (height < min) return clamp(height / min, 0.15, 0.85);
  return clamp(1 - (height - max) / Math.max(max, 1), 0.2, 0.9);
}

function scoreDirection(direction: number | null, bestDirections: number[]) {
  if (direction == null) return 0.55;
  const bestDiff = Math.min(...bestDirections.map((best) => angleDiff(direction, best)));
  if (bestDiff <= 25) return 1;
  if (bestDiff <= 50) return 0.82;
  if (bestDiff <= 80) return 0.62;
  if (bestDiff <= 115) return 0.42;
  return 0.22;
}

function scoreWind(direction: number | null, speed: number | null, bestDirections: number[]) {
  const speedScore = speed == null ? 0.65 : speed <= 5 ? 1 : speed <= 10 ? 0.86 : speed <= 15 ? 0.62 : speed <= 22 ? 0.38 : 0.18;
  const directionScore = scoreDirection(direction, bestDirections);
  return speedScore * 0.62 + directionScore * 0.38;
}

function scorePeriod(period: number | null) {
  if (period == null) return 0.55;
  if (period >= 13) return 1;
  if (period >= 10) return 0.82;
  if (period >= 8) return 0.62;
  if (period >= 6) return 0.42;
  return 0.25;
}

function getBestWindow(hours: ForecastHour[], best: ForecastHour) {
  const bestIndex = hours.findIndex((hour) => hour.time === best.time);
  let start = bestIndex;
  let end = bestIndex;
  while (start > 0 && hours[start - 1].score >= best.score - 0.8) start -= 1;
  while (end < hours.length - 1 && hours[end + 1].score >= best.score - 0.8) end += 1;
  return `${formatTime(hours[start].time)} - ${formatTime(hours[end].time)}`;
}

function buildRecommendation(spot: SurfSpot, best: ForecastHour | null) {
  if (!best) return "Forecast data is not available yet.";
  const height = formatFeet(best.waveHeightFeet);
  const wind = best.windSpeedMph == null ? "wind is unknown" : `${Math.round(best.windSpeedMph)} mph wind`;
  return `${best.rating} window for ${spot.name}: ${height} surf, ${formatDirection(best.swellDirectionDegrees)} swell, ${best.swellPeriodSeconds?.toFixed(0) ?? "unknown"} sec period, and ${wind}.`;
}

function summarizeHour(score: number, hour: Omit<ForecastHour, "score" | "rating" | "summary">) {
  const wind = hour.windSpeedMph == null ? "wind unknown" : `${Math.round(hour.windSpeedMph)} mph ${formatDirection(hour.windDirectionDegrees)} wind`;
  return `${formatFeet(hour.waveHeightFeet)}, ${hour.swellPeriodSeconds?.toFixed(0) ?? "?"} sec ${formatDirection(hour.swellDirectionDegrees)} swell, ${wind}. Score ${score.toFixed(1)}.`;
}

function ratingForScore(score: number) {
  if (score >= 8.5) return "Excellent";
  if (score >= 7) return "Good";
  if (score >= 5.5) return "Surfable";
  if (score >= 4) return "Marginal";
  return "Poor";
}

function readNumber(values: Array<number | null> | undefined, index: number) {
  const value = values?.[index];
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function angleDiff(a: number, b: number) {
  return Math.abs((((a - b) % 360) + 540) % 360 - 180);
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function round(value: number, places: number) {
  const factor = 10 ** places;
  return Math.round(value * factor) / factor;
}

function formatTime(value: string) {
  return new Date(value).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

function formatFeet(value: number | null) {
  return value == null ? "unknown size" : `${value.toFixed(1)} ft`;
}

function formatDirection(value: number | null) {
  if (value == null) return "unknown";
  const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  return directions[Math.round(value / 45) % 8];
}

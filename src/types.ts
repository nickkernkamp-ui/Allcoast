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

export interface TidePrediction {
  time: string;
  heightFeet: number | null;
  type: string;
}

export interface TideSummary {
  status: "planned" | "available";
  stationId: string | null;
  idealRangeFeet: [number, number] | null;
  note: string;
  predictions: TidePrediction[];
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

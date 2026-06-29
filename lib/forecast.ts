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
  surfHeightCalibration?: SurfHeightCalibration;
}

export interface SurfHeightCalibration {
  exposedSwellDirections: [number, number];
  breakingWaveMultiplier: number;
  offAngleMultiplier: number;
  partialAngleMultiplier: number;
  maxOffAngleFeet?: number;
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

const southFacing: SurfHeightCalibration = {
  exposedSwellDirections: [160, 245],
  breakingWaveMultiplier: 0.9,
  offAngleMultiplier: 0.35,
  partialAngleMultiplier: 0.65,
};

const westFacing: SurfHeightCalibration = {
  exposedSwellDirections: [230, 310],
  breakingWaveMultiplier: 0.95,
  offAngleMultiplier: 0.35,
  partialAngleMultiplier: 0.65,
};

const northwestFacing: SurfHeightCalibration = {
  exposedSwellDirections: [270, 335],
  breakingWaveMultiplier: 0.95,
  offAngleMultiplier: 0.3,
  partialAngleMultiplier: 0.6,
};

const openBeach: SurfHeightCalibration = {
  exposedSwellDirections: [175, 310],
  breakingWaveMultiplier: 0.9,
  offAngleMultiplier: 0.5,
  partialAngleMultiplier: 0.75,
};

function caSpot(
  id: string,
  name: string,
  region: string,
  latitude: number,
  longitude: number,
  breakType: string,
  idealWaveHeightFeet: [number, number],
  bestSwellDirections: number[],
  bestWindDirections: number[],
  tideStationId: string,
  idealTideFeet: [number, number] | null,
  tideNote: string,
  note: string,
  surfHeightCalibration: SurfHeightCalibration,
): SurfSpot {
  return {
    id,
    name,
    region,
    latitude,
    longitude,
    idealWaveHeightFeet,
    idealTideFeet,
    tideStationId,
    tideNote,
    bestSwellDirections,
    bestWindDirections,
    breakType,
    note,
    surfHeightCalibration,
  };
}

export const SPOTS: SurfSpot[] = [
  caSpot("imperial-beach", "Imperial Beach", "San Diego", 32.5783, -117.1350, "beach break", [2, 6], [190, 220, 270], [45, 70, 90], "9410170", [0.5, 4.5], "Sandbars shift; start with mid tide and adjust by shape.", "Open beach break that can pick up south and west swell.", openBeach),
  caSpot("coronado", "Coronado", "San Diego", 32.6859, -117.1890, "beach break", [2, 5], [190, 220, 270], [45, 70, 90], "9410170", [0.5, 4.5], "Often cleaner around mid tide.", "Mellower beach break with shape on clean combo swell.", openBeach),
  caSpot("sunset-cliffs", "Sunset Cliffs", "San Diego", 32.7206, -117.2569, "reef and point", [3, 8], [230, 270, 290], [45, 70, 90], "9410170", [1, 5], "Needs enough water over reef ledges.", "West-facing reefs that respond to organized west and northwest swell.", westFacing),
  caSpot("ocean-beach-sd", "Ocean Beach Pier", "San Diego", 32.7495, -117.2540, "beach break", [2, 6], [210, 240, 280], [45, 70, 90], "9410170", [0.5, 4.5], "Pier sandbars can change quickly.", "Reliable beach break with mixed swell windows.", openBeach),
  caSpot("mission-beach", "Mission Beach", "San Diego", 32.7706, -117.2528, "beach break", [2, 6], [200, 230, 280], [45, 70, 90], "9410170", [0.5, 4.5], "Mid tide is usually the first read.", "Open beach peaks with south and west exposure.", openBeach),
  caSpot("pacific-beach", "Pacific Beach", "San Diego", 32.7978, -117.2573, "beach break", [2, 6], [200, 230, 280], [45, 70, 90], "9410170", [0.5, 4.5], "Sandbars and tide push drive quality.", "Beach peaks that like clean morning wind.", openBeach),
  caSpot("windansea", "Windansea", "San Diego", 32.8312, -117.2814, "reef break", [3, 8], [220, 260, 290], [45, 70, 90], "9410230", [1, 4.5], "Reef is tide sensitive; too low can get ledgy.", "Powerful reef with better shape on west energy.", westFacing),
  caSpot("la-jolla-shores", "La Jolla Shores", "San Diego", 32.8507, -117.2728, "beach break", [1, 5], [190, 220, 260], [45, 70, 90], "9410230", [0.5, 5], "Generally user friendly around mid tide.", "Protected beach that reads smaller than open-water swell.", southFacing),
  caSpot("blacks", "Blacks Beach", "San Diego", 32.8895, -117.2532, "powerful beach break", [3, 10], [210, 250, 285], [45, 70, 90], "9410230", [0.5, 4.5], "Can handle size; currents increase quickly.", "One of San Diego's stronger beach breaks, best with organized swell.", openBeach),
  caSpot("del-mar", "Del Mar", "San Diego", 32.9595, -117.2689, "beach break", [2, 6], [200, 230, 280], [45, 70, 90], "9410230", [0.5, 4.5], "Sandbars and tide shape the window.", "Beach break with reliable south and west exposure.", openBeach),
  caSpot("swamis", "Swamis", "San Diego", 33.0358, -117.2926, "right point reef", [3, 8], [220, 260, 290], [45, 70, 90], "9410230", [1, 5], "Likes enough water over the reef and a clean shoulder.", "Classic Encinitas right with stronger west swell response.", westFacing),
  caSpot("cardiff-reef", "Cardiff Reef", "San Diego", 33.0219, -117.2842, "reef break", [2, 7], [210, 240, 280], [45, 70, 90], "9410230", [1, 5], "Mid tide is a useful baseline.", "User-friendly reef with good shape on clean west and southwest swell.", westFacing),
  caSpot("beacons", "Beacons", "San Diego", 33.0812, -117.3113, "reef and beach", [2, 6], [210, 240, 280], [45, 70, 90], "9410230", [1, 5], "Often better with some water over the reef.", "Encinitas reef/peak with mixed swell windows.", westFacing),
  caSpot("oceanside", "Oceanside Harbor", "San Diego", 33.2046, -117.3914, "jetty beach break", [2, 8], [190, 230, 280], [45, 70, 90], "9410230", [0.5, 4.5], "Harbor sandbars change fast.", "Punchy beach break that catches south and west swell.", openBeach),

  caSpot("cottons", "Cottons", "Orange County", 33.3715, -117.5725, "point/reef", [3, 8], [185, 210, 240], [45, 70, 90], "9410230", [1, 4], "Needs a clean push and enough water.", "Upper Trestles zone with south swell exposure.", southFacing),
  caSpot("uppers", "Upper Trestles", "Orange County", 33.3803, -117.5864, "cobblestone peak", [3, 8], [185, 210, 240], [45, 70, 90], "9410230", [1, 4], "Tide push can help the cobblestone setup.", "Performance wave that likes south to southwest swell.", southFacing),
  caSpot("lowers", "Lower Trestles", "Orange County", 33.3839, -117.5939, "cobblestone peak", [3, 6], [190, 210, 230], [45, 70, 90], "9410230", [1, 4], "Often best with enough water over the cobblestones, then improving through the push.", "Likes longer-period south and southwest swell with light morning wind.", southFacing),
  caSpot("church", "Church", "Orange County", 33.3924, -117.5971, "cobblestone point", [2, 6], [190, 215, 245], [45, 70, 90], "9410230", [1, 4.5], "Usually more forgiving with a little water.", "Longer right with south and southwest exposure.", southFacing),
  caSpot("san-onofre", "San Onofre", "Orange County", 33.3763, -117.5682, "soft point", [1, 5], [180, 210, 240], [45, 70, 90], "9410230", [1, 5], "Generally forgiving through mid tide.", "Mellow longboard-friendly point waves.", southFacing),
  caSpot("doheny", "Doheny", "Orange County", 33.4626, -117.6887, "soft point", [1, 4], [170, 195, 220], [45, 70, 90], "9410230", [1, 5], "Works better with tide push and clean south swell.", "Protected, smaller point-style wave.", southFacing),
  caSpot("salt-creek", "Salt Creek", "Orange County", 33.4735, -117.7237, "beach/reef peak", [2, 7], [180, 220, 270], [45, 70, 90], "9410230", [0.5, 4.5], "Tide can move the peak around.", "Punchy peak that catches south and west energy.", openBeach),
  caSpot("t-street", "T-Street", "Orange County", 33.4196, -117.6223, "beach break", [2, 6], [185, 220, 270], [45, 70, 90], "9410230", [0.5, 4.5], "Mid tide often gives the cleanest line.", "San Clemente beach break with south and west exposure.", openBeach),
  caSpot("newport-56th", "Newport 56th Street", "Orange County", 33.6284, -117.9542, "jetty beach break", [2, 8], [180, 210, 270], [35, 60, 80], "9410660", [0.5, 4], "Tide and sandbars can make or break it.", "Powerful Newport peak with strong south swell response.", openBeach),
  caSpot("newport-point", "Newport Point", "Orange County", 33.6008, -117.9006, "wedge/shorebreak", [3, 10], [165, 190, 210], [35, 60, 80], "9410660", [1, 4], "Highly tide and direction sensitive.", "South swell magnet with heavy shorebreak behavior.", southFacing),
  caSpot("huntington", "Huntington Beach Pier", "Orange County", 33.6553, -118.0034, "beach break", [2, 6], [180, 210, 260], [35, 60, 80], "9410660", [0.5, 4.5], "Tide can shift sandbar quality quickly; mid tide is the starting read.", "Can handle mixed swell, but wind texture changes the score quickly.", openBeach),
  caSpot("bolsa-chica", "Bolsa Chica", "Orange County", 33.6958, -118.0487, "beach break", [2, 6], [185, 220, 280], [35, 60, 80], "9410660", [0.5, 4.5], "Sandbars favor different tides.", "Open beach with reliable west and south exposure.", openBeach),
  caSpot("seal-beach", "Seal Beach", "Orange County", 33.7384, -118.1073, "jetty beach break", [2, 6], [180, 220, 280], [35, 60, 80], "9410660", [0.5, 4.5], "Jetty influence makes sandbar quality important.", "Can get shaped up on combo swell and light wind.", openBeach),

  caSpot("el-porto", "El Porto", "Los Angeles", 33.9022, -118.4237, "beach break", [2, 7], [220, 260, 290], [20, 45, 70], "9410660", [0.5, 4.5], "Usually best before wind texture fills in.", "South Bay beach break that responds to west energy.", westFacing),
  caSpot("manhattan-beach", "Manhattan Beach", "Los Angeles", 33.8847, -118.4138, "beach break", [2, 6], [220, 260, 290], [20, 45, 70], "9410660", [0.5, 4.5], "Sandbar quality changes by tide.", "Peaky South Bay beach break.", westFacing),
  caSpot("venice-breakwater", "Venice Breakwater", "Los Angeles", 33.9850, -118.4746, "jetty beach break", [2, 6], [190, 230, 270], [20, 45, 70], "9410660", [0.5, 4.5], "Jetty peaks depend on sand and tide.", "Urban beach break with mixed swell exposure.", openBeach),
  caSpot("santa-monica", "Santa Monica", "Los Angeles", 34.0094, -118.4973, "beach break", [1, 5], [190, 220, 270], [20, 45, 70], "9410840", [0.5, 4.5], "Often smaller and softer than exposed beaches.", "Protected beach break; best with clean combo swell.", southFacing),
  caSpot("topanga", "Topanga", "Los Angeles", 34.0381, -118.5825, "right point", [2, 6], [180, 205, 230], [20, 45, 70], "9410840", [1.5, 4.5], "Point likes the right tide push.", "Right point that rewards clean south swell.", southFacing),
  caSpot("malibu", "Malibu", "Los Angeles", 34.0329, -118.6784, "right point", [2, 5], [180, 200, 220], [20, 45, 70], "9410840", [1.5, 4.5], "Generally best around low to mid tide with a clean push.", "Best on clean south to southwest swell with light offshore or calm wind.", southFacing),
  caSpot("zuma", "Zuma", "Los Angeles", 34.0187, -118.8232, "beach break", [2, 7], [200, 240, 285], [20, 45, 70], "9410840", [0.5, 4.5], "Beach break quality changes fast with tide.", "Open beach with more west exposure than Malibu.", openBeach),
  caSpot("county-line", "County Line", "Ventura", 34.0520, -118.9647, "point/beach", [2, 7], [200, 240, 285], [20, 45, 70], "9410840", [1, 5], "Can improve through tide push.", "Mix of pointy rights and beach break sections.", openBeach),
  caSpot("c-street", "C Street", "Ventura", 34.2747, -119.3016, "right point", [3, 8], [240, 275, 300], [35, 60, 80], "9411189", [1, 5], "Handles size and likes organized west swell.", "Long right point with strong winter west exposure.", westFacing),
  caSpot("ventura-harbor", "Ventura Harbor", "Ventura", 34.2472, -119.2675, "jetty beach break", [2, 8], [220, 260, 295], [35, 60, 80], "9411189", [0.5, 4.5], "Sandbars near the harbor can change quickly.", "Punchy beach break on west and combo swell.", openBeach),

  caSpot("rincon", "Rincon", "Santa Barbara", 34.3735, -119.4785, "right point", [3, 8], [250, 280, 305], [35, 60, 80], "9411340", [1, 5], "Needs enough west angle and a clean tide window.", "Classic right point that shines on west/northwest swell.", westFacing),
  caSpot("sands", "Sands", "Santa Barbara", 34.4129, -119.8804, "beach break", [2, 6], [240, 275, 300], [35, 60, 80], "9411340", [0.5, 4.5], "Sand and tide drive quality.", "Campus-area beach break with winter swell exposure.", westFacing),
  caSpot("leadbetter", "Leadbetter", "Santa Barbara", 34.4031, -119.7001, "soft point", [1, 5], [240, 275, 300], [35, 60, 80], "9411340", [1, 5], "Often needs more swell than exposed spots.", "Protected point-style wave near the harbor.", westFacing),
  caSpot("jalama", "Jalama", "Santa Barbara", 34.5092, -120.5006, "beach break", [3, 10], [250, 285, 315], [35, 60, 80], "9411340", [0.5, 4.5], "Wind can be a major factor.", "Exposed beach break that picks up west and northwest swell.", northwestFacing),
  caSpot("pismo", "Pismo Beach", "Central Coast", 35.1380, -120.6438, "beach break", [2, 7], [240, 280, 310], [45, 70, 90], "9412110", [0.5, 5], "Sandbars and wind are the main reads.", "Open Central Coast beach break.", northwestFacing),
  caSpot("morro-bay", "Morro Bay", "Central Coast", 35.3710, -120.8677, "beach break", [3, 10], [250, 285, 315], [45, 70, 90], "9412110", [0.5, 5], "Can get powerful with current and size.", "Exposed beach with strong northwest swell response.", northwestFacing),
  caSpot("cayucos", "Cayucos", "Central Coast", 35.4497, -120.9068, "beach/pier break", [2, 7], [245, 280, 310], [45, 70, 90], "9412110", [0.5, 5], "Pier sandbars vary with tide.", "Central Coast beach break with good winter exposure.", northwestFacing),
  caSpot("san-simeon", "San Simeon", "Central Coast", 35.6439, -121.1895, "point/reef", [2, 7], [250, 285, 315], [45, 70, 90], "9412110", [1, 5], "Protected spots can read smaller than exposed swell.", "Reef and point setups with northwest swell exposure.", northwestFacing),
  caSpot("moss-landing", "Moss Landing", "Monterey Bay", 36.8046, -121.7905, "powerful beach break", [3, 10], [250, 285, 315], [70, 90, 110], "9413450", [0.5, 5], "Currents and size can be serious.", "Heavy beach break that catches strong northwest swell.", northwestFacing),
  caSpot("pleasure-point", "Pleasure Point", "Santa Cruz", 36.9580, -121.9708, "right point reef", [2, 8], [250, 285, 310], [70, 90, 110], "9413450", [1, 5], "Reef sections shift by tide.", "Classic Santa Cruz right with northwest swell exposure.", northwestFacing),
  caSpot("steamer-lane", "Steamer Lane", "Santa Cruz", 36.9515, -122.0261, "reef point", [3, 10], [260, 290, 315], [70, 90, 110], "9413450", [1, 5], "Handles size but tide changes sections.", "Premier reef/point that likes organized northwest swell.", northwestFacing),
  caSpot("cowells", "Cowells", "Santa Cruz", 36.9612, -122.0244, "soft point", [1, 5], [250, 285, 310], [70, 90, 110], "9413450", [1, 5], "Protected and usually smaller than exposed reefs.", "Mellow longboard wave near the wharf.", westFacing),
  caSpot("waddell-creek", "Waddell Creek", "Santa Cruz", 37.0945, -122.2800, "beach break", [3, 10], [250, 285, 315], [70, 90, 110], "9413450", [0.5, 5], "Wind is often the limiting factor.", "Exposed beach break with strong northwest swell exposure.", northwestFacing),

  caSpot("mavericks", "Mavericks", "San Mateo", 37.4917, -122.5019, "big-wave reef", [8, 25], [275, 300, 325], [70, 90, 110], "9414290", [1, 5], "Only advanced big-wave conditions; local expertise required.", "Deep-water reef that needs long-period northwest swell.", northwestFacing),
  caSpot("pacifica-linda-mar", "Pacifica Linda Mar", "San Mateo", 37.5945, -122.5051, "beach break", [2, 7], [250, 285, 315], [70, 90, 110], "9414290", [0.5, 5], "More protected than Ocean Beach; tide matters.", "User-friendly beach break south of San Francisco.", northwestFacing),
  caSpot("ocean-beach-sf", "Ocean Beach", "San Francisco", 37.7594, -122.5107, "powerful beach break", [3, 8], [270, 290, 310], [70, 90, 110], "9414290", [1, 5], "Tide window depends on sandbar, size, and current; avoid maxed-out water movement.", "Needs manageable size, organized period, and clean wind to really line up.", northwestFacing),
  caSpot("bolinas", "Bolinas", "Marin", 37.9094, -122.6864, "beach/lagoon mouth", [1, 5], [240, 275, 300], [70, 90, 110], "9414290", [1, 5], "Protected and often smaller than exposed beaches.", "Mellow Marin spot with softer northwest swell response.", westFacing),
  caSpot("stinson-beach", "Stinson Beach", "Marin", 37.8990, -122.6455, "beach break", [2, 6], [250, 285, 315], [70, 90, 110], "9414290", [0.5, 5], "Tide and wind are important.", "Beach break with northwest exposure but some protection.", northwestFacing),
  caSpot("salmon-creek", "Salmon Creek", "Sonoma", 38.3514, -123.0698, "beach break", [3, 10], [260, 290, 320], [70, 90, 110], "9415020", [0.5, 5], "Can be powerful and current-prone.", "Exposed North Coast beach break.", northwestFacing),
  caSpot("point-arena", "Point Arena", "Mendocino", 38.9148, -123.7094, "reef/point", [3, 10], [260, 290, 320], [70, 90, 110], "9416841", [1, 5], "Rugged coast; local knowledge matters.", "North Coast reef/point exposure to northwest swell.", northwestFacing),
  caSpot("shelter-cove", "Shelter Cove", "Humboldt", 40.0292, -124.0739, "reef/point", [3, 10], [260, 290, 320], [70, 90, 110], "9418024", [1, 5], "Remote and condition-sensitive.", "Lost Coast zone with northwest exposure.", northwestFacing),
  caSpot("humboldt-harbor", "Humboldt Harbor", "Humboldt", 40.7667, -124.2362, "jetty beach break", [3, 10], [260, 290, 320], [70, 90, 110], "9418767", [0.5, 5], "Harbor currents and wind can be serious.", "Exposed North Coast beach/jetty setup.", northwestFacing),
  caSpot("south-beach-crescent-city", "South Beach", "Crescent City", 41.7416, -124.1844, "beach break", [2, 8], [260, 290, 320], [70, 90, 110], "9419750", [0.5, 5], "Protected corners can read smaller than swell.", "Northern California beach break with northwest exposure.", northwestFacing),
];

export const forecastInputSchema = z.object({
  spotId: z.string().optional(),
});

export type ForecastInput = z.infer<typeof forecastInputSchema>;

export interface RawHourly {
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
  return SPOTS.find((spot) => spot.id === input.spotId) ?? SPOTS[0];
}

export function buildForecast(spot: SurfSpot, marine: RawHourly, weather: RawHourly, now = new Date(), tidePredictions: TidePrediction[] | null = null): SurfForecast {
  const marineHours = marine.time ?? [];
  const weatherTimes = weather.time ?? [];
  const hours = marineHours
    .map((time, index) => {
      const weatherIndex = findNearestWeatherIndex(time, weatherTimes);
      const offshoreWaveHeightFeet = readNumber(marine.wave_height, index);
      const swellDirectionDegrees = readNumber(marine.swell_wave_direction, index) ?? readNumber(marine.wave_direction, index);
      return scoreHour(spot, {
        time,
        waveHeightFeet: estimateBreakingSurfHeight(spot, offshoreWaveHeightFeet, swellDirectionDegrees),
        swellHeightFeet: readNumber(marine.swell_wave_height, index),
        swellPeriodSeconds: readNumber(marine.swell_wave_period, index) ?? readNumber(marine.wave_period, index),
        swellDirectionDegrees,
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
    source: "Open-Meteo marine and weather forecasts with spot exposure adjustment",
    recommendation: buildRecommendation(spot, best ?? current),
  };
}

function findNearestWeatherIndex(marineTime: string, weatherTimes: string[]) {
  if (!weatherTimes.length) return undefined;
  const exactIndex = weatherTimes.indexOf(marineTime);
  if (exactIndex >= 0) return exactIndex;

  const marineMs = new Date(marineTime).getTime();
  if (!Number.isFinite(marineMs)) return undefined;

  let nearestIndex = -1;
  let nearestDiff = Number.POSITIVE_INFINITY;
  weatherTimes.forEach((weatherTime, index) => {
    const weatherMs = new Date(weatherTime).getTime();
    if (!Number.isFinite(weatherMs)) return;
    const diff = Math.abs(weatherMs - marineMs);
    if (diff < nearestDiff) {
      nearestDiff = diff;
      nearestIndex = index;
    }
  });

  return nearestDiff <= 90 * 60 * 1000 ? nearestIndex : undefined;
}

function estimateBreakingSurfHeight(spot: SurfSpot, offshoreHeight: number | null, swellDirection: number | null) {
  if (offshoreHeight == null) return null;
  const calibration = spot.surfHeightCalibration;
  if (!calibration || swellDirection == null) return round(offshoreHeight, 1);

  const exposure = directionExposure(swellDirection, calibration.exposedSwellDirections);
  const multiplier =
    exposure === "exposed"
      ? calibration.breakingWaveMultiplier
      : exposure === "partial"
        ? calibration.partialAngleMultiplier
        : calibration.offAngleMultiplier;
  const capped = exposure === "blocked" && calibration.maxOffAngleFeet != null
    ? Math.min(offshoreHeight * multiplier, calibration.maxOffAngleFeet)
    : offshoreHeight * multiplier;

  return round(capped, 1);
}

function directionExposure(direction: number, range: [number, number]) {
  if (directionInRange(direction, range)) return "exposed";
  const distanceToWindow = Math.min(angleDiff(direction, range[0]), angleDiff(direction, range[1]));
  if (distanceToWindow <= 35) return "partial";
  return "blocked";
}

function directionInRange(direction: number, [start, end]: [number, number]) {
  const normalized = ((direction % 360) + 360) % 360;
  if (start <= end) return normalized >= start && normalized <= end;
  return normalized >= start || normalized <= end;
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

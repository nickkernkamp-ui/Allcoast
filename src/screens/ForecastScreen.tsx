import { CalendarDays, Compass, Heart, MapPin, RefreshCw, Search, Star, Waves, Wind } from "lucide-react";
import type { FormEvent, ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import type { ForecastHour, SurfForecast, SurfSpot } from "../types";

const dayFormatter = new Intl.DateTimeFormat([], { weekday: "short", month: "short", day: "numeric" });
const hourFormatter = new Intl.DateTimeFormat([], { hour: "numeric" });

export function ForecastScreen() {
  const [spots, setSpots] = useState<SurfSpot[]>([]);
  const [spotId, setSpotId] = useState("malibu");
  const [forecast, setForecast] = useState<SurfForecast | null>(null);
  const [activeDay, setActiveDay] = useState("");
  const [query, setQuery] = useState("");
  const [customName, setCustomName] = useState("");
  const [customLatitude, setCustomLatitude] = useState("");
  const [customLongitude, setCustomLongitude] = useState("");
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("allcoast-favorite-spots") ?? "[]") as string[];
    } catch {
      return [];
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/spots")
      .then((response) => response.json())
      .then((data) => setSpots(data.spots ?? []))
      .catch(() => setError("Spots could not be loaded."));
  }, []);

  useEffect(() => {
    void loadForecast(spotId);
  }, [spotId]);

  async function loadForecast(nextSpotId = spotId) {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/forecast?spotId=${encodeURIComponent(nextSpotId)}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Forecast could not be loaded.");
      const nextForecast = data.forecast as SurfForecast;
      setForecast(nextForecast);
      setActiveDay(dayKey(nextForecast.hours[0]?.time ?? new Date().toISOString()));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Forecast could not be loaded.");
    } finally {
      setLoading(false);
    }
  }

  async function loadCustomForecast(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const latitude = Number(customLatitude);
    const longitude = Number(customLongitude);
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      setError("Enter a valid latitude and longitude.");
      return;
    }
    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      setError("Latitude must be -90 to 90. Longitude must be -180 to 180.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({
        latitude: String(latitude),
        longitude: String(longitude),
        name: customName.trim() || "Custom spot",
      });
      const response = await fetch(`/api/forecast?${params.toString()}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Forecast could not be loaded.");
      const nextForecast = data.forecast as SurfForecast;
      setForecast(nextForecast);
      setActiveDay(dayKey(nextForecast.hours[0]?.time ?? new Date().toISOString()));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Forecast could not be loaded.");
    } finally {
      setLoading(false);
    }
  }

  function toggleFavorite(id: string) {
    setFavorites((current) => {
      const next = current.includes(id) ? current.filter((item) => item !== id) : [id, ...current];
      localStorage.setItem("allcoast-favorite-spots", JSON.stringify(next));
      return next;
    });
  }

  const filteredSpots = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const matching = normalized ? spots.filter((spot) => `${spot.name} ${spot.region}`.toLowerCase().includes(normalized)) : spots;
    return [...matching].sort((a, b) => Number(favorites.includes(b.id)) - Number(favorites.includes(a.id)) || a.name.localeCompare(b.name));
  }, [spots, query, favorites]);

  const days = useMemo(() => {
    const seen = new Set<string>();
    return (forecast?.hours ?? []).filter((hour) => {
      const key = dayKey(hour.time);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    }).slice(0, 3);
  }, [forecast]);

  const dayHours = useMemo(() => (forecast?.hours ?? []).filter((hour) => dayKey(hour.time) === activeDay), [forecast, activeDay]);
  const best = useMemo(() => [...dayHours].sort((a, b) => b.score - a.score)[0] ?? forecast?.current ?? null, [dayHours, forecast]);
  const surfRange = useMemo(() => getSurfRange(dayHours.length ? dayHours : forecast?.hours ?? []), [dayHours, forecast]);

  return (
    <div className="space-y-5">
      <section className="overflow-hidden rounded-[28px] border border-[var(--line)] bg-white shadow-[0_18px_45px_rgba(24,58,91,0.08)]">
        <div className="grid gap-5 border-b border-[var(--line)] bg-[#fafdff] p-4 md:grid-cols-[1fr_360px] md:p-6">
          <div>
            <p className="eyebrow mb-2">AllCoast surf report</p>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-black leading-tight sm:text-5xl">{forecast?.spot.name ?? "Surf forecast"}</h1>
              {forecast && (
                <button className={`icon-button rounded-full ${favorites.includes(forecast.spot.id) ? "border-[#b7dfff] bg-[#e8f5ff] text-[var(--accent)]" : ""}`} onClick={() => toggleFavorite(forecast.spot.id)} title={favorites.includes(forecast.spot.id) ? "Remove favorite" : "Save favorite"}>
                  <Heart size={17} fill={favorites.includes(forecast.spot.id) ? "currentColor" : "none"} />
                </button>
              )}
            </div>
            <p className="mt-2 text-sm font-bold text-[var(--muted)]">{forecast?.spot.region ?? "Choose a break"} · {forecast?.spot.breakType ?? "wave, swell, wind"}</p>
            {favorites.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {spots.filter((spot) => favorites.includes(spot.id)).map((spot) => (
                  <button key={spot.id} className="rounded-full border border-[#d8e4ed] bg-white px-3 py-1.5 text-xs font-black text-[var(--accent)]" onClick={() => setSpotId(spot.id)}>
                    {spot.name}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="space-y-3">
            <label className="relative block">
              <span className="label">Find a spot</span>
              <Search className="pointer-events-none absolute bottom-3 left-3 text-[#8da0b1]" size={17} />
              <input className="field pl-10" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search breaks" />
            </label>
            <div className="grid max-h-32 grid-cols-2 gap-2 overflow-auto pr-1">
              {filteredSpots.map((spot) => (
                <button key={spot.id} className={`rounded-full border px-3 py-2 text-left text-xs font-black ${spot.id === spotId ? "border-[var(--accent)] bg-[var(--accent)] text-white" : "border-[#d8e4ed] bg-white text-[#5f7182]"}`} onClick={() => setSpotId(spot.id)}>
                  <span className="flex items-center justify-between gap-2">
                    {spot.name}
                    {favorites.includes(spot.id) && <Heart size={12} fill="currentColor" />}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-3 p-4 md:grid-cols-[1fr_1fr_1fr_auto] md:p-6">
          <HeroStat icon={Waves} label="Surf" value={surfRange} />
          <HeroStat icon={Star} label="Rating" value={best ? `${starCount(best.score)}/5` : "-/5"} />
          <HeroStat icon={Wind} label="Wind" value={best?.windSpeedMph == null ? "Wind ?" : `${Math.round(best.windSpeedMph)} mph ${direction(best.windDirectionDegrees)}`} />
          <button className="secondary-button md:self-end" onClick={() => loadForecast()} disabled={loading}>
            <RefreshCw size={17} className={loading ? "animate-spin" : ""} />Refresh
          </button>
        </div>

        {forecast && (
          <div className="border-t border-[var(--line)] p-4 md:p-6">
            <div className="flex flex-wrap items-center gap-2">
              {days.map((hour) => {
                const key = dayKey(hour.time);
                const selected = key === activeDay;
                return (
                  <button key={key} className={`rounded-full border px-3 py-2 text-sm font-black ${selected ? "border-[var(--accent)] bg-[var(--accent)] text-white" : "border-[#d8e4ed] bg-white text-[#5f7182]"}`} onClick={() => setActiveDay(key)}>
                    {dayFormatter.format(new Date(hour.time))}
                  </button>
                );
              })}
            </div>
            <p className="mt-4 max-w-3xl text-sm leading-6 text-[var(--muted)]">{forecast.recommendation}</p>
          </div>
        )}
      </section>

      <section className="panel p-4 md:p-5">
        <div className="grid gap-4 lg:grid-cols-[280px_1fr] lg:items-end">
          <div>
            <div className="flex items-center gap-2">
              <MapPin size={17} className="text-[var(--accent)]" />
              <p className="eyebrow">Custom coast</p>
            </div>
            <h2 className="mt-2 text-xl font-black">Forecast any break</h2>
            <p className="mt-1 text-sm font-bold leading-6 text-[var(--muted)]">Drop in coordinates when the spot is not in the saved list.</p>
          </div>
          <form className="grid gap-3 sm:grid-cols-[1.2fr_1fr_1fr_auto]" onSubmit={loadCustomForecast}>
            <label>
              <span className="label">Spot name</span>
              <input className="field" value={customName} onChange={(event) => setCustomName(event.target.value)} placeholder="Local break" />
            </label>
            <label>
              <span className="label">Latitude</span>
              <input className="field" inputMode="decimal" value={customLatitude} onChange={(event) => setCustomLatitude(event.target.value)} placeholder="34.03" />
            </label>
            <label>
              <span className="label">Longitude</span>
              <input className="field" inputMode="decimal" value={customLongitude} onChange={(event) => setCustomLongitude(event.target.value)} placeholder="-118.68" />
            </label>
            <button className="primary-button sm:self-end" disabled={loading}>
              Forecast
            </button>
          </form>
        </div>
      </section>

      {error && <div className="rounded-2xl border border-[#ffd2c8] bg-[#fff0ed] px-4 py-3 text-sm font-bold text-[#d84b32]">{error}</div>}

      {forecast && (
        <section className="grid gap-5 lg:grid-cols-[1fr_340px]">
          <div className="panel overflow-hidden">
            <div className="overflow-x-auto">
              <div className="min-w-[680px]">
                <div className="grid grid-cols-[82px_92px_1fr_86px_96px] gap-3 border-b border-[var(--line)] bg-[#f4f8fb] px-4 py-3 text-[11px] font-black uppercase text-[var(--muted)]">
                  <span>Time</span>
                  <span>Rating</span>
                  <span>Swell</span>
                  <span>Period</span>
                  <span>Wind</span>
                </div>
                <div className="divide-y divide-[var(--line)]">
                  {(dayHours.length ? dayHours : forecast.hours.slice(0, 12)).map((hour) => <ForecastRow key={hour.time} hour={hour} />)}
                </div>
              </div>
            </div>
          </div>

          <aside className="space-y-3">
            <SideCard title="Best Window" icon={CalendarDays}>
              <div className="text-3xl font-black">{forecast.bestWindow}</div>
              <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{best?.summary ?? "No forecast window available."}</p>
            </SideCard>
            <SideCard title="Spot Notes" icon={Compass}>
              <dl className="space-y-3 text-sm">
                <Info label="Break" value={forecast.spot.breakType} />
                <Info label="Ideal size" value={`${forecast.spot.idealWaveHeightFeet[0]}-${forecast.spot.idealWaveHeightFeet[1]} ft`} />
                <Info label="Swell" value={forecast.spot.bestSwellDirections.map(direction).join(", ")} />
                <Info label="Wind" value={forecast.spot.bestWindDirections.map(direction).join(", ")} />
              </dl>
              <p className="mt-4 text-sm leading-6 text-[var(--muted)]">{forecast.spot.note}</p>
            </SideCard>
            <SideCard title="Tide" icon={Waves}>
              <dl className="space-y-3 text-sm">
                <Info label="Ideal tide" value={forecast.tide.idealRangeFeet ? `${forecast.tide.idealRangeFeet[0]}-${forecast.tide.idealRangeFeet[1]} ft` : "Spot dependent"} />
                <Info label="Station" value={forecast.tide.stationId ?? "Pending"} />
              </dl>
              {forecast.tide.predictions.length > 0 && (
                <div className="mt-4 space-y-2">
                  {forecast.tide.predictions.slice(0, 4).map((prediction) => (
                    <div key={`${prediction.time}-${prediction.type}`} className="flex items-center justify-between rounded-2xl bg-[#f4f8fb] px-3 py-2 text-sm">
                      <span className="font-black">{prediction.type}</span>
                      <span className="font-bold text-[var(--muted)]">{formatTideTime(prediction.time)}</span>
                      <span className="tabular font-black">{prediction.heightFeet == null ? "-" : `${prediction.heightFeet.toFixed(1)} ft`}</span>
                    </div>
                  ))}
                </div>
              )}
              <p className="mt-4 text-sm leading-6 text-[var(--muted)]">{forecast.tide.note}</p>
              {forecast.tide.predictions.length === 0 && <p className="mt-3 rounded-2xl bg-[#f4f8fb] px-3 py-2 text-xs font-bold text-[#6c7d8d]">NOAA tide predictions will appear here when the station responds.</p>}
            </SideCard>
            <SideCard title="Data" icon={RefreshCw}>
              <dl className="space-y-3 text-sm">
                <Info label="Forecast" value={forecast.source} />
                <Info label="Updated" value={new Date(forecast.generatedAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })} />
              </dl>
            </SideCard>
          </aside>
        </section>
      )}
    </div>
  );
}

function HeroStat({ icon: Icon, label, value }: { icon: typeof Waves; label: string; value: string }) {
  return (
    <div className="rounded-[22px] border border-[#d8e4ed] bg-[#fafdff] p-4">
      <Icon size={18} className="text-[var(--accent)]" />
      <div className="mt-4 text-3xl font-black">{value}</div>
      <div className="mt-1 text-xs font-black uppercase text-[var(--muted)]">{label}</div>
    </div>
  );
}

function ForecastRow({ hour }: { hour: ForecastHour }) {
  return (
    <div className="grid grid-cols-[82px_92px_1fr_86px_96px] items-center gap-3 px-4 py-4 text-sm">
      <div>
        <div className="font-black">{hourFormatter.format(new Date(hour.time))}</div>
        <div className="mt-1 text-[11px] font-bold text-[var(--muted)]">{hour.rating}</div>
      </div>
      <Rating score={hour.score} />
      <div className="min-w-0">
        <div className="font-black">{feet(hour.waveHeightFeet)} at {direction(hour.swellDirectionDegrees)}</div>
        <div className="mt-1 truncate text-xs font-semibold text-[var(--muted)]">Primary swell {feet(hour.swellHeightFeet)}</div>
      </div>
      <div className="tabular font-black">{hour.swellPeriodSeconds?.toFixed(0) ?? "?"} sec</div>
      <div>
        <div className="font-black">{hour.windSpeedMph == null ? "?" : Math.round(hour.windSpeedMph)} mph</div>
        <div className="mt-1 text-xs font-semibold text-[var(--muted)]">{direction(hour.windDirectionDegrees)}</div>
      </div>
    </div>
  );
}

function Rating({ score }: { score: number }) {
  const count = starCount(score);
  return (
    <div className="flex gap-1" aria-label={`${count} star surf rating`}>
      {[0, 1, 2, 3, 4].map((index) => (
        <span key={index} className={`h-5 w-3 rounded-full ${index < count ? "bg-[var(--accent)]" : "bg-[#d8e4ed]"}`} />
      ))}
    </div>
  );
}

function SideCard({ title, icon: Icon, children }: { title: string; icon: typeof Waves; children: ReactNode }) {
  return (
    <div className="panel p-5">
      <div className="mb-4 flex items-center gap-2">
        <Icon size={17} className="text-[var(--cyan)]" />
        <p className="eyebrow">{title}</p>
      </div>
      {children}
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return <div className="flex items-start justify-between gap-4"><dt className="font-bold text-[var(--muted)]">{label}</dt><dd className="text-right font-black capitalize">{value}</dd></div>;
}

function getSurfRange(hours: ForecastHour[]) {
  const values = hours.map((hour) => hour.waveHeightFeet).filter((value): value is number => typeof value === "number");
  if (!values.length) return "- ft";
  const min = Math.floor(Math.min(...values));
  const max = Math.ceil(Math.max(...values));
  return min === max ? `${max} ft` : `${min}-${max} ft`;
}

function starCount(score: number) {
  return Math.max(1, Math.min(5, Math.round(score / 2)));
}

function dayKey(value: string) {
  return new Date(value).toISOString().slice(0, 10);
}

function feet(value: number | null) {
  return value == null ? "? ft" : `${value.toFixed(1)} ft`;
}

function direction(value: number | null) {
  if (value == null) return "?";
  const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  return directions[Math.round(value / 45) % 8];
}

function formatTideTime(value: string) {
  if (!value) return "-";
  const normalized = value.includes("T") ? value : value.replace(" ", "T");
  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

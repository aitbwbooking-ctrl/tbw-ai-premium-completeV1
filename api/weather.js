export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-tbw-device');
if (req.method === 'OPTIONS') { res.status(200).end(); return; }

  const lat = Number(req.query.lat);
  const lon = Number(req.query.lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    res.status(400).json({ error: "lat/lon required" });
    return;
  }

  // Open-Meteo (no key)
  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", String(lat));
  url.searchParams.set("longitude", String(lon));
  url.searchParams.set("current_weather", "true");
  url.searchParams.set("timezone", "auto");

  const r = await fetch(url.toString(), {
    headers: { "User-Agent": "TBW-AI-PREMIUM/1.0 (vercel)" }
  });
  const j = await r.json();

  const cw = j.current_weather || {};
  const temperature = cw.temperature ?? null;
  const wind_kph = cw.windspeed ?? null;

  // lightweight "summary"
  const code = cw.weathercode;
  const summary = (code === 0) ? "Clear" :
                  (code >= 1 && code <= 3) ? "Partly cloudy" :
                  (code >= 45 && code <= 48) ? "Fog" :
                  (code >= 51 && code <= 67) ? "Drizzle/Rain" :
                  (code >= 71 && code <= 77) ? "Snow" :
                  (code >= 80 && code <= 82) ? "Rain showers" :
                  (code >= 95) ? "Thunderstorm" : "Mixed";

  res.status(200).json({
    current: {
      temperature,
      wind_kph,
      summary,
      source: "open-meteo",
      raw: cw
    }
  });
}

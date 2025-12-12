export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-tbw-device');
if (req.method === 'OPTIONS') { res.status(200).end(); return; }

  const fromLat = Number(req.query.fromLat);
  const fromLon = Number(req.query.fromLon);
  const toLat = Number(req.query.toLat);
  const toLon = Number(req.query.toLon);

  if (![fromLat,fromLon,toLat,toLon].every(Number.isFinite)) {
    res.status(400).json({ error: "fromLat/fromLon/toLat/toLon required" });
    return;
  }

  // OSRM public demo server
  const url = `https://router.project-osrm.org/route/v1/driving/${fromLon},${fromLat};${toLon},${toLat}?overview=false`;
  const r = await fetch(url, {
    headers: { "User-Agent": "TBW-AI-PREMIUM/1.0" }
  });
  const j = await r.json();
  const route = j.routes && j.routes[0];
  if (!route) {
    res.status(502).json({ error: "routing failed", raw:j });
    return;
  }
  const distance_km = (route.distance || 0) / 1000;
  const duration_min = (route.duration || 0) / 60;
  const gmaps_url = `https://www.google.com/maps/dir/?api=1&origin=${fromLat},${fromLon}&destination=${toLat},${toLon}&travelmode=driving`;

  res.status(200).json({ distance_km, duration_min, gmaps_url });
}

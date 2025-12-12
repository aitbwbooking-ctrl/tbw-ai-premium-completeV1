export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-tbw-device');
if (req.method === 'OPTIONS') { res.status(200).end(); return; }

  const q = (req.query.q || "").toString().trim();
  if (!q) {
    res.status(400).json({ error: "q required" });
    return;
  }
  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("q", q);
  url.searchParams.set("format", "json");
  url.searchParams.set("limit", "1");

  const r = await fetch(url.toString(), {
    headers: {
      "User-Agent": "TBW-AI-PREMIUM/1.0 (contact: demo@tbw.ai)",
      "Accept-Language": "en"
    }
  });
  const arr = await r.json();
  const first = arr && arr[0];
  if (!first) {
    res.status(404).json({ error: "not found" });
    return;
  }
  res.status(200).json({
    lat: Number(first.lat),
    lon: Number(first.lon),
    display_name: first.display_name
  });
}

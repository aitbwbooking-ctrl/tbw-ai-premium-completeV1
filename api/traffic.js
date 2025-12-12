export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-tbw-device');
if (req.method === 'OPTIONS') { res.status(200).end(); return; }

  const city = (req.query.city || "City").toString();
  // Demo feed (free) - replace with paid APIs in Premium
  const items = [
    { type: "Traffic", text: `${city}: Demo incidents feed active (free).` },
    { type: "Roadworks", text: "Example: lane closures possible — check official sources." },
    { type: "Safety", text: "Always follow police instructions and road signs." },
  ];
  res.status(200).json({ city, items });
}

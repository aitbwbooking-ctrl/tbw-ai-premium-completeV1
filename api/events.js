export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-tbw-device');
if (req.method === 'OPTIONS') { res.status(200).end(); return; }

  const city = (req.query.city || "City").toString();
  const items = [
    { when: "Tonight", title: `${city} Live music (demo)`, venue: "City center" },
    { when: "Weekend", title: "Local festival (demo)", venue: "Main square" },
    { when: "All week", title: "Museum & galleries", venue: "Various venues" },
  ];
  res.status(200).json({ city, items });
}

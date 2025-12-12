# TBW AI PREMIUM Navigator (Fullstack ZIP)

This ZIP is **one Vercel project**:
- `/public` = frontend (index.html, style.css, app.js)
- `/api/*` = backend serverless functions (free APIs: Open-Meteo, Nominatim, OSRM)

## Run locally
Use any static server that supports /api via node? (Vercel dev is easiest)
- Install Vercel CLI: `npm i -g vercel`
- In this folder: `vercel dev`

## Deploy
- Import to Vercel as a project (framework: "Other")
- Build command: none
- Output: public
Vercel will automatically deploy static + serverless functions.

## Notes
- Tier system: TRIAL (3 days) -> DEMO -> PREMIUM (simulated purchase in Menu).
- Disclaimer is always English (as requested).
- Language switch changes ONLY titles/labels.


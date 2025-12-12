/* TBW AI PREMIUM Navigator - single-file app (frontend + /api backend on Vercel) */
const $ = (q) => document.querySelector(q);
const $$ = (q) => Array.from(document.querySelectorAll(q));

const STATE = {
  city: "Paris",
  coords: { lat: 48.85837, lon: 2.294481 },
  tier: "TRIAL", // TRIAL -> DEMO -> PREMIUM
  lang: "en",
  saved: [],
};

const CITY_META = {
  Paris:   { heroDesktop: "/hero-paris-desktop.jpg", heroMobile: "/hero-paris-mobile.jpg", lat:48.85837, lon:2.294481, place:"Eiffel Tower • Champ de Mars" },
  Split:   { heroDesktop: "/hero-split.jpg", heroMobile: "/hero-split.jpg", lat:43.5081, lon:16.4402, place:"Split • Croatia" },
  Zadar:   { heroDesktop: "/hero-zadar.jpg", heroMobile: "/hero-zadar.jpg", lat:44.1194, lon:15.2314, place:"Zadar • Croatia" },
  Zagreb:  { heroDesktop: "/hero-zagreb.jpg", heroMobile: "/hero-zagreb.jpg", lat:45.8150, lon:15.9819, place:"Zagreb • Croatia" },
  Karlovac:{ heroDesktop: "/hero-karlovac.jpg", heroMobile: "/hero-karlovac.jpg", lat:45.4875, lon:15.5478, place:"Karlovac • Croatia" },
};

// 24 languages (Serbian/Bosnian replaced with Chinese/Japanese)
const LANGS = [
  ["en","English"],["hr","Hrvatski"],["de","Deutsch"],["it","Italiano"],["fr","Français"],["es","Español"],
  ["pt","Português"],["nl","Nederlands"],["pl","Polski"],["cs","Čeština"],["sk","Slovenčina"],["hu","Magyar"],
  ["ro","Română"],["bg","Български"],["el","Ελληνικά"],["tr","Türkçe"],["ru","Русский"],["uk","Українська"],
  ["sv","Svenska"],["no","Norsk"],["da","Dansk"],["fi","Suomi"],["zh","中文"],["ja","日本語"]
];

// UI translations ONLY for titles/labels (disclaimer stays English)
const I18N = {
  en:{navTitle:"Navigation", navSub:"AI guided routing", bookTitle:"Booking", bookSub:"Hotels • Apartments", weatherTitle:"Weather", weatherSub:"Live conditions",
      trafficTitle:"Traffic", trafficSub:"Incidents & alerts", eventsTitle:"Events", eventsSub:"Concerts & nightlife", safetyTitle:"Safety", safetySub:"Alerts & guidance", cityLabel:"CITY"},
  hr:{navTitle:"Navigacija", navSub:"AI ruta", bookTitle:"Smještaj", bookSub:"Hoteli • Apartmani", weatherTitle:"Vrijeme", weatherSub:"Uvjeti uživo",
      trafficTitle:"Promet", trafficSub:"Incidenti & upozorenja", eventsTitle:"Eventi", eventsSub:"Koncerti & noćni život", safetyTitle:"Sigurnost", safetySub:"Upozorenja & savjeti", cityLabel:"GRAD"},
  de:{navTitle:"Navigation", navSub:"KI‑Routenführung", bookTitle:"Buchung", bookSub:"Hotels • Apartments", weatherTitle:"Wetter", weatherSub:"Live‑Daten",
      trafficTitle:"Verkehr", trafficSub:"Meldungen & Warnungen", eventsTitle:"Events", eventsSub:"Konzerte & Nachtleben", safetyTitle:"Sicherheit", safetySub:"Warnungen & Hinweise", cityLabel:"STADT"},
  it:{navTitle:"Navigazione", navSub:"Percorsi AI", bookTitle:"Prenotazioni", bookSub:"Hotel • Appartamenti", weatherTitle:"Meteo", weatherSub:"Dati live",
      trafficTitle:"Traffico", trafficSub:"Incidenti & avvisi", eventsTitle:"Eventi", eventsSub:"Concerti & nightlife", safetyTitle:"Sicurezza", safetySub:"Avvisi & guida", cityLabel:"CITTÀ"},
  fr:{navTitle:"Navigation", navSub:"Itinéraires IA", bookTitle:"Réservation", bookSub:"Hôtels • Appartements", weatherTitle:"Météo", weatherSub:"Conditions en direct",
      trafficTitle:"Trafic", trafficSub:"Incidents & alertes", eventsTitle:"Événements", eventsSub:"Concerts & sorties", safetyTitle:"Sécurité", safetySub:"Alertes & conseils", cityLabel:"VILLE"},
  es:{navTitle:"Navegación", navSub:"Rutas con IA", bookTitle:"Reservas", bookSub:"Hoteles • Apartamentos", weatherTitle:"Tiempo", weatherSub:"En vivo",
      trafficTitle:"Tráfico", trafficSub:"Incidentes & alertas", eventsTitle:"Eventos", eventsSub:"Conciertos & noche", safetyTitle:"Seguridad", safetySub:"Alertas & guía", cityLabel:"CIUDAD"},
};

function t(key){
  const m = I18N[STATE.lang] || I18N.en;
  return m[key] || (I18N.en[key] || key);
}

function applyI18N(){
  $$("[data-i18n]").forEach(el => { el.textContent = t(el.getAttribute("data-i18n")); });
}

function nowISO(){
  return new Date().toISOString();
}

function getDeviceKey(){
  let k = localStorage.getItem("tbw_device_key");
  if(!k){
    k = crypto?.randomUUID?.() || ("tbw_"+Math.random().toString(16).slice(2)+Date.now());
    localStorage.setItem("tbw_device_key", k);
  }
  return k;
}

function computeTier(){
  // Trial: 3 days from first open, then Demo until premium "purchase"
  const purchased = localStorage.getItem("tbw_premium") === "1";
  if(purchased) return "PREMIUM";

  const first = localStorage.getItem("tbw_first_open");
  if(!first){
    localStorage.setItem("tbw_first_open", nowISO());
    return "TRIAL";
  }
  const t0 = new Date(first).getTime();
  const days = (Date.now() - t0) / (1000*60*60*24);
  return days <= 3 ? "TRIAL" : "DEMO";
}

function applyTierUI(){
  STATE.tier = computeTier();
  const badge = $("#tierBadge");
  const pill = $("#livePill");
  const dot = $("#liveDot");
  const liveText = $("#liveText");

  if(STATE.tier === "PREMIUM"){
    badge.textContent = "PREMIUM";
    badge.style.borderColor = "rgba(20,242,154,.55)";
    badge.style.color = "rgba(20,242,154,.95)";
    dot.style.background = "var(--accent)";
    dot.style.boxShadow = "0 0 16px rgba(20,242,154,.95)";
    liveText.textContent = "LIVE";
    pill.classList.add("premium");
    // blinking
    pill.style.animation = "tbwBlink 1s infinite";
  } else {
    badge.textContent = STATE.tier;
    badge.style.borderColor = "rgba(255,210,74,.45)";
    badge.style.color = "rgba(255,210,74,.95)";
    dot.style.background = "var(--warn)";
    dot.style.boxShadow = "0 0 16px rgba(255,210,74,.95)";
    liveText.textContent = (STATE.tier === "TRIAL") ? "TRIAL" : "DEMO";
    pill.style.animation = "none";
  }

  // inject keyframes once
  if(!document.getElementById("tbwBlinkStyle")){
    const st = document.createElement("style");
    st.id = "tbwBlinkStyle";
    st.textContent = "@keyframes tbwBlink{0%,100%{filter:brightness(1)}50%{filter:brightness(1.6)}}";
    document.head.appendChild(st);
  }
}

function heroForViewport(){
  const meta = CITY_META[STATE.city];
  const isMobile = window.matchMedia("(max-width: 640px)").matches;
  return isMobile ? meta.heroMobile : meta.heroDesktop;
}

function applyCity(city){
  STATE.city = city;
  const meta = CITY_META[city];
  STATE.coords = { lat: meta.lat, lon: meta.lon };

  $("#heroCity").textContent = city;
  $("#heroPlace").textContent = meta.place;

  const heroImg = $("#heroImg");
  heroImg.style.backgroundImage = `url('${heroForViewport()}')`;

  $$(".chip").forEach(c => c.classList.toggle("active", c.dataset.city === city));
  refreshWeatherBadge();
  pushTicker();
}

async function api(path, params){
  const url = new URL(path, location.origin);
  if(params){
    Object.entries(params).forEach(([k,v]) => url.searchParams.set(k, String(v)));
  }
  const r = await fetch(url.toString(), { headers: { "x-tbw-device": getDeviceKey() } });
  if(!r.ok) throw new Error(`API ${path} ${r.status}`);
  return r.json();
}

async function refreshWeatherBadge(){
  try{
    const w = await api("/api/weather", { lat: STATE.coords.lat, lon: STATE.coords.lon });
    const temp = Math.round(w.current?.temperature ?? w.current?.temp ?? 0);
    $("#tempBadge").textContent = `${temp >= 0 ? "+" : ""}${temp}°C`;
  }catch(e){
    $("#tempBadge").textContent = "+--°C";
  }
}

function makeTickerItems(){
  const tier = STATE.tier;
  const city = STATE.city;

  const items = [
    { t: `TBW AI ${tier} • ${city}`, strong:true },
    { t: "Traffic • Weather • Safety • Events • Airports", strong:false },
    { t: "Informational only • always follow official sources", strong:false },
    { t: tier === "PREMIUM" ? "LIVE Engine: ON • Full APIs" : "Demo/Trial: limited • basic free APIs", strong: tier==="PREMIUM" },
    { t: "Emergency: 112 • Road: 192 • Fire: 193 • Sea rescue: 195", strong:false },
  ];

  // Duplicate to ensure seamless scroll
  return items.concat(items).concat(items);
}

let tickerX = 0;
let tickerRAF = null;

function pushTicker(){
  const track = $("#tickerTrack");
  track.innerHTML = "";
  makeTickerItems().forEach(it => {
    const span = document.createElement("span");
    span.className = "tickerItem" + (it.strong ? " tickerStrong" : "");
    span.textContent = it.t;
    track.appendChild(span);
  });

  // set speed
  if(tickerRAF) cancelAnimationFrame(tickerRAF);
  tickerX = 0;
  const speed = (STATE.tier === "PREMIUM") ? 0.7 : 0.55;

  const step = () => {
    tickerX -= speed;
    // reset when too far
    const w = track.scrollWidth;
    if(Math.abs(tickerX) > w/3) tickerX = 0;
    track.style.transform = `translateX(${tickerX}px)`;
    tickerRAF = requestAnimationFrame(step);
  };
  tickerRAF = requestAnimationFrame(step);
}

function modalShow(title, html){
  $("#modalTitle").textContent = title;
  $("#modalBody").innerHTML = html;
  $("#modal").classList.add("show");
  $("#modal").setAttribute("aria-hidden","false");
}
function modalHide(){
  $("#modal").classList.remove("show");
  $("#modal").setAttribute("aria-hidden","true");
}

function kv(k,v){
  return `<div class="kv"><div class="k">${k}</div><div class="v">${v}</div></div>`;
}

async function openWindow(kind){
  applyTierUI();

  // Gate paid-only in trial/demo (but keep usable with free sources)
  const isPremium = STATE.tier === "PREMIUM";

  if(kind === "nav"){
    modalShow(t("navTitle"), `<div>${STATE.city} → choose destination below.</div>
      ${kv("From", `${STATE.coords.lat.toFixed(5)}, ${STATE.coords.lon.toFixed(5)}`)}
      <div style="margin:12px 0; display:flex; gap:10px; flex-wrap:wrap;">
        <input id="destInput" class="searchInput" style="flex:1; min-width:220px;" placeholder="Destination (e.g., airport, street, city)"/>
        <button id="goRoute" class="btn primary">START ROUTE</button>
      </div>
      <div id="routeOut"></div>
      <div style="margin-top:12px; color:rgba(234,247,242,.7); font-size:12px;">
        Uses free OSRM routing + Nominatim geocoding (demo-friendly).
      </div>
    `);

    setTimeout(() => {
      $("#goRoute")?.addEventListener("click", async () => {
        const q = ($("#destInput")?.value || "").trim();
        if(!q) return;
        const out = $("#routeOut");
        out.innerHTML = "Loading...";
        try{
          const g = await api("/api/geocode", { q });
          if(!g?.lat) throw new Error("No results");
          const r = await api("/api/route", { fromLat: STATE.coords.lat, fromLon: STATE.coords.lon, toLat: g.lat, toLon: g.lon });
          out.innerHTML = [
            kv("To", `${g.display_name}`),
            kv("Distance", `${(r.distance_km).toFixed(1)} km`),
            kv("ETA", `${Math.round(r.duration_min)} min`),
            `<div style="margin-top:10px"><a href="${r.gmaps_url}" target="_blank" rel="noreferrer" style="color:var(--accent); font-weight:900;">Open in Google Maps</a></div>`
          ].join("");
        }catch(e){
          out.innerHTML = `<div style="color:#ffb3b3; font-weight:900;">Route failed.</div>`;
        }
      });
    }, 50);

    return;
  }

  if(kind === "book"){
    modalShow(t("bookTitle"), `
      <div style="display:flex; gap:10px; flex-wrap:wrap;">
        <span class="badge">Demo</span>
        <span class="badge">${STATE.city}</span>
      </div>
      <div style="margin-top:12px;">
        Booking in this build opens demo search links (no paid APIs).
      </div>
      <div style="margin-top:14px; display:flex; gap:10px; flex-wrap:wrap;">
        <a class="btn primary" style="text-decoration:none; display:inline-flex; align-items:center; justify-content:center;"
           href="https://www.booking.com/searchresults.html?ss=${encodeURIComponent(STATE.city)}" target="_blank" rel="noreferrer">Open Booking</a>
        <a class="btn" style="text-decoration:none; display:inline-flex; align-items:center; justify-content:center;"
           href="https://www.airbnb.com/s/${encodeURIComponent(STATE.city)}/homes" target="_blank" rel="noreferrer">Open Airbnb</a>
      </div>
    `);
    return;
  }

  if(kind === "weather"){
    modalShow(t("weatherTitle"), "Loading...");
    try{
      const w = await api("/api/weather", { lat: STATE.coords.lat, lon: STATE.coords.lon });
      const c = w.current;
      const lines = [
        kv("City", STATE.city),
        kv("Temperature", `${c.temperature} °C`),
        kv("Wind", `${c.wind_kph} km/h`),
        kv("Condition", `${c.summary}`),
        kv("Source", "Open‑Meteo (free)"),
      ];
      modalShow(t("weatherTitle"), lines.join(""));
    }catch(e){
      modalShow(t("weatherTitle"), `<div style="color:#ffb3b3; font-weight:900;">Weather fetch failed.</div>`);
    }
    return;
  }

  if(kind === "traffic"){
    modalShow(t("trafficTitle"), "Loading...");
    try{
      const x = await api("/api/traffic", { city: STATE.city });
      const items = (x.items||[]).map(i => `<div class="kv"><div class="k">${i.type}</div><div class="v">${i.text}</div></div>`).join("");
      modalShow(t("trafficTitle"), items + `<div style="margin-top:12px; color:rgba(234,247,242,.65); font-size:12px;">Demo feed (free). Premium mode can swap to paid traffic APIs.</div>`);
    }catch(e){
      modalShow(t("trafficTitle"), `<div style="color:#ffb3b3; font-weight:900;">Traffic feed failed.</div>`);
    }
    return;
  }

  if(kind === "events"){
    modalShow(t("eventsTitle"), "Loading...");
    try{
      const x = await api("/api/events", { city: STATE.city });
      const items = (x.items||[]).map(i => `<div class="kv"><div class="k">${i.when}</div><div class="v"><b>${i.title}</b><div style="opacity:.8">${i.venue}</div></div></div>`).join("");
      modalShow(t("eventsTitle"), items);
    }catch(e){
      modalShow(t("eventsTitle"), `<div style="color:#ffb3b3; font-weight:900;">Events feed failed.</div>`);
    }
    return;
  }

  if(kind === "safety"){
    modalShow(t("safetyTitle"), `
      ${kv("Emergency", "112")}
      ${kv("Road police", "192")}
      ${kv("Fire", "193")}
      ${kv("Sea rescue", "195")}
      <div style="margin-top:12px; color:rgba(234,247,242,.75);">
        This window is always available. In Premium it can be connected to live alerts.
      </div>
    `);
    return;
  }

  if(kind === "menu"){
    const purchased = localStorage.getItem("tbw_premium")==="1";
    modalShow("Menu", `
      ${kv("Tier", STATE.tier)}
      ${kv("Device", getDeviceKey().slice(0,8) + "…")}
      <div style="display:flex; gap:10px; flex-wrap:wrap; margin-top:12px;">
        <button class="btn primary" id="btnPremium">${purchased?"PREMIUM ACTIVE":"SIMULATE PURCHASE (Premium)"}</button>
        <button class="btn" id="btnReset">RESET TRIAL/DEMO</button>
      </div>
      <div style="margin-top:10px; color:rgba(234,247,242,.65); font-size:12px;">
        Purchase simulation is for testing. Replace with real payments later.
      </div>
    `);

    setTimeout(() => {
      $("#btnPremium")?.addEventListener("click", () => {
        localStorage.setItem("tbw_premium","1");
        applyTierUI(); pushTicker();
        modalHide();
      });
      $("#btnReset")?.addEventListener("click", () => {
        localStorage.removeItem("tbw_premium");
        localStorage.removeItem("tbw_first_open");
        applyTierUI(); pushTicker();
        modalHide();
      });
    }, 50);

    return;
  }

  if(kind === "search"){
    modalShow("Search", `
      <div style="margin-bottom:10px; color:rgba(234,247,242,.8);">Search places with free geocoding.</div>
      <div style="display:flex; gap:10px; flex-wrap:wrap;">
        <input id="qInput" class="searchInput" style="flex:1; min-width:220px;" placeholder="e.g., 'Eiffel Tower' or 'Split airport'"/>
        <button id="qGo" class="btn primary">SEARCH</button>
      </div>
      <div id="qOut" style="margin-top:12px;"></div>
    `);

    setTimeout(() => {
      $("#qGo")?.addEventListener("click", async () => {
        const q = ($("#qInput")?.value || "").trim();
        if(!q) return;
        const out = $("#qOut");
        out.innerHTML = "Loading...";
        try{
          const g = await api("/api/geocode", { q });
          out.innerHTML = [
            kv("Result", g.display_name),
            kv("Lat/Lon", `${g.lat}, ${g.lon}`),
            `<div style="margin-top:10px"><a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(g.lat+","+g.lon)}" target="_blank" rel="noreferrer" style="color:var(--accent); font-weight:900;">Open in Google Maps</a></div>`
          ].join("");
        }catch(e){
          out.innerHTML = `<div style="color:#ffb3b3; font-weight:900;">No result.</div>`;
        }
      });
    }, 50);

    return;
  }

  if(kind === "fav"){
    modalShow("Favourite", `
      <div style="color:rgba(234,247,242,.75);">Saved places (local only).</div>
      <div id="favOut" style="margin-top:12px;"></div>
    `);
    const list = JSON.parse(localStorage.getItem("tbw_saved")||"[]");
    $("#favOut").innerHTML = list.length ? list.map(s => kv("Saved", s)).join("") : "<div style='opacity:.7'>Empty.</div>";
    return;
  }
}

function initEvents(){
  $("#modalClose").addEventListener("click", modalHide);
  $("#modal").addEventListener("click", (e) => { if(e.target.id === "modal") modalHide(); });

  $$(".card").forEach(btn => btn.addEventListener("click", () => openWindow(btn.dataset.open)));
  $$(".navBtn").forEach(btn => btn.addEventListener("click", () => openWindow(btn.dataset.open)));

  $("#btnNavigate").addEventListener("click", () => openWindow("nav"));
  $("#btnStreet").addEventListener("click", () => {
    const url = `https://www.google.com/maps?q=${STATE.coords.lat},${STATE.coords.lon}&layer=c&cbll=${STATE.coords.lat},${STATE.coords.lon}`;
    modalShow("Street View", `<div style="margin-bottom:10px;">Open Street View in Google Maps.</div><a class="btn primary" style="text-decoration:none; display:inline-flex; justify-content:center; width:100%;" target="_blank" rel="noreferrer" href="${url}">OPEN</a>`);
  });
  $("#btnSave").addEventListener("click", () => {
    const s = `${STATE.city} (${STATE.coords.lat.toFixed(4)},${STATE.coords.lon.toFixed(4)})`;
    const list = JSON.parse(localStorage.getItem("tbw_saved")||"[]");
    if(!list.includes(s)) list.unshift(s);
    localStorage.setItem("tbw_saved", JSON.stringify(list.slice(0,20)));
    modalShow("Saved", `<div style="font-weight:900;">Saved!</div>${kv("Item", s)}`);
  });

  $("#btnSearch").addEventListener("click", () => openWindow("search"));
  $("#mainSearch").addEventListener("keydown", (e) => {
    if(e.key === "Enter"){ openWindow("search"); setTimeout(()=>{$("#qInput").value=$("#mainSearch").value; $("#qGo").click();},60); }
  });

  $$(".chip").forEach(ch => ch.addEventListener("click", () => applyCity(ch.dataset.city)));

  // responsive hero on resize
  window.addEventListener("resize", () => {
    const meta = CITY_META[STATE.city];
    $("#heroImg").style.backgroundImage = `url('${heroForViewport()}')`;
  });
}

function initLang(){
  const sel = $("#langSel");
  sel.innerHTML = LANGS.map(([code,label]) => `<option value="${code}">${label}</option>`).join("");
  // default: hr if browser is hr
  const pref = (navigator.language||"en").slice(0,2);
  STATE.lang = LANGS.some(([c])=>c===pref) ? pref : "en";
  sel.value = STATE.lang;
  sel.addEventListener("change", () => {
    STATE.lang = sel.value;
    applyI18N();
  });
  applyI18N();
}

function introSound(){
  // Small WebAudio whoosh + "eagle cry" (synth), no external file.
  try{
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    const ctx = new AudioCtx();

    const now = ctx.currentTime;

    // whoosh noise
    const bufferSize = ctx.sampleRate * 0.35 | 0;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for(let i=0;i<bufferSize;i++){
      data[i] = (Math.random()*2-1) * (1 - i/bufferSize);
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(1200, now);
    filter.frequency.exponentialRampToValueAtTime(300, now+0.35);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.18, now+0.05);
    gain.gain.exponentialRampToValueAtTime(0.0001, now+0.35);

    noise.connect(filter).connect(gain).connect(ctx.destination);
    noise.start(now);
    noise.stop(now+0.36);

    // "cry" oscillator
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = "sawtooth";
    o.frequency.setValueAtTime(900, now+0.08);
    o.frequency.exponentialRampToValueAtTime(420, now+0.38);
    g.gain.setValueAtTime(0.0001, now+0.08);
    g.gain.exponentialRampToValueAtTime(0.12, now+0.16);
    g.gain.exponentialRampToValueAtTime(0.0001, now+0.42);
    o.connect(g).connect(ctx.destination);
    o.start(now+0.08);
    o.stop(now+0.45);

    setTimeout(()=>ctx.close(), 900);
  }catch(e){}
}

function initIntro(){
  const intro = $("#intro");
  const skip = $("#skipIntro");

  // show intro once per session
  const seen = sessionStorage.getItem("tbw_intro_seen") === "1";
  if(seen){
    intro.classList.remove("show");
    return;
  }
  intro.classList.add("show");
  intro.setAttribute("aria-hidden","false");

  // user gesture unlock for audio: play only after first tap OR skip button
  const unlock = () => { introSound(); window.removeEventListener("pointerdown", unlock); };
  window.addEventListener("pointerdown", unlock, { once:true });

  const close = () => {
    intro.classList.remove("show");
    intro.setAttribute("aria-hidden","true");
    sessionStorage.setItem("tbw_intro_seen","1");
  };

  skip.addEventListener("click", close);

  // auto-close after 2.2s
  setTimeout(close, 2200);
}

async function boot(){
  applyTierUI();
  initLang();
  initEvents();
  applyCity(STATE.city);
  pushTicker();
  initIntro();

  // register SW
  if("serviceWorker" in navigator){
    try{
      await navigator.serviceWorker.register("/sw.js");
    }catch(e){}
  }
}

boot();

/**
 * HEATWAVE COMMAND (SIH-26083) - Obsidian Command
 * Seamless Multilingual Voice Advisory, Leaflet GIS, and Responsive Navigation
 */

// Application State
let map = null;
let wardLayers = [];
let shelterMarkers = [];
let currentDayOffset = 2; // Default: Day 3 (Peak)
let currentLayer = 'wbgt';
let selectedWardId = 'W-01';
let currentCityKey = 'delhi';
let currentLanguage = 'hi';
let wardsData = [];
let trendChart = null;
let isPlayingForecast = false;
let forecastInterval = null;
let isSpeakingAudio = false;

// 7 Indian Regional Languages Voice Advisory Scripts & Synthesizer Codes
const LOCAL_LANGUAGE_ADVISORIES = {
  hi: {
    name: "हिन्दी (Hindi)",
    langCode: "hi-IN",
    template: (wardName, wbgt) => 
      `सावधान! ${wardName} में अत्यंत गंभीर हीटवेव चेतावनी है। वेट-बल्ब ग्लोब तापमान ${wbgt} डिग्री सेल्सियस पहुंच गया है। दोपहर 11:30 से 4:30 बजे तक खुले में काम करना सख्त वर्जित है। कृपया नजदीकी वातानुकूलित शीतलन केंद्र जाएं और ओआरएस का सेवन करें।`
  },
  en: {
    name: "English",
    langCode: "en-IN",
    template: (wardName, wbgt) => 
      `Emergency Heat Warning for ${wardName}. The Wet-Bulb Globe Temperature has reached ${wbgt} degrees Celsius. All outdoor physical labor and courier deliveries are strictly suspended between 11:30 AM and 4:30 PM. Free municipal cooling shelters and hydration points are active.`
  },
  ta: {
    name: "தமிழ் (Tamil)",
    langCode: "ta-IN",
    template: (wardName, wbgt) => 
      `எச்சரிக்கை! ${wardName} பகுதியில் கடுமையான வெப்ப அலை நிலவுகிறது. வெப்பநிலை ${wbgt} டிகிரி செல்சியஸை எட்டியுள்ளது. மதியம் 11:30 முதல் 4:30 வரை வெளியில் வேலை செய்வதைத் தவிர்க்கவும். அருகிலுள்ள குளிர்ச்சி மையங்களைப் பயன்படுத்தவும்.`
  },
  te: {
    name: "తెలుగు (Telugu)",
    langCode: "te-IN",
    template: (wardName, wbgt) => 
      `హెచ్చరిక! ${wardName} పరిధిలో తీవ్రమైన వడగాల్పులు ఉన్నాయి. ఉష్ణోగ్రత ${wbgt} డిగ్రీల సెల్సియస్ దాటింది. మధ్యాహ్నం 11:30 నుండి 4:30 వరకు బయట పని చేయవద్దు. మున్సిపల్ కూలింగ్ సెంటర్లను సందర్శించండి.`
  },
  mr: {
    name: "मराठी (Marathi)",
    langCode: "mr-IN",
    template: (wardName, wbgt) => 
      `सावधान! ${wardName} मध्ये तीव्र उष्णतेची लाट घोषित करण्यात आली आहे. तापमान ${wbgt} अंश सेल्सिअस आहे. सकाळी ११:३० ते दुपारी ४:३० दरम्यान उन्हात काम करणे पूर्णपणे बंद ठेवा. जवळच्या शासकीय शीतकरण केंद्रात जा.`
  },
  gu: {
    name: "ગુજરાતી (Gujarati)",
    langCode: "gu-IN",
    template: (wardName, wbgt) => 
      `સાવધાન! ${wardName} વિસ્તારમાં ગંભીર હીટવેવ છે. તાપમાન ${wbgt} ડિગ્રી સેલ્સિયસ છે. બપોરે ૧૧:૩૦ થી ૪:૩૦ દરમિયાન તડકામાં કામ ન કરો. નજીકના ઠંડક કેન્દ્રમાં આશરો લો અને ઓઆરએસ પીવો.`
  },
  bn: {
    name: "বাংলা (Bengali)",
    langCode: "bn-IN",
    template: (wardName, wbgt) => 
      `সতর্কতা! ${wardName} এলাকায় তীব্র তাপপ্রবাহ চলছে। তাপমাত্রা ${wbgt} ডিগ্রি সেলসিয়াস। দুপুর ১১:৩০ থেকে বিকেল ৪:৩০ পর্যন্ত রোদে কাজ বন্ধ রাখুন। নিকটস্থ কুলিং সেন্টারে আশ্রয় নিন।`
  }
};

// Multi-City Geospatial Datasets
const CITIES_DATA = {
  delhi: {
    name: "Delhi NCT",
    center: [28.6320, 77.2200],
    zoom: 11.5,
    wards: [
      {
        id: "W-01",
        name: "Old City / Chawri Bazaar",
        zone: "Central Zone",
        coords: [28.6506, 77.2303],
        polygon: [
          [28.6620, 77.2180], [28.6620, 77.2430], [28.6380, 77.2460], [28.6360, 77.2200]
        ],
        demographics: { elderly_pct: 14.2, outdoor_worker_pct: 42.0, slum_density_pct: 52.0, green_cover_pct: 4.5, hospital_dist: 1.2 },
        population: 185000,
        uhi_offset: 2.4
      },
      {
        id: "W-02",
        name: "Industrial Hub & Logistics",
        zone: "North-West Zone",
        coords: [28.7150, 77.1350],
        polygon: [
          [28.7350, 77.1150], [28.7350, 77.1580], [28.6950, 77.1580], [28.6950, 77.1150]
        ],
        demographics: { elderly_pct: 8.0, outdoor_worker_pct: 55.0, slum_density_pct: 38.0, green_cover_pct: 6.2, hospital_dist: 3.8 },
        population: 140000,
        uhi_offset: 1.8
      },
      {
        id: "W-03",
        name: "Civil Lines & Institutional",
        zone: "North Zone",
        coords: [28.6812, 77.2228],
        polygon: [
          [28.6980, 77.2080], [28.6980, 77.2380], [28.6620, 77.2380], [28.6620, 77.2080]
        ],
        demographics: { elderly_pct: 16.5, outdoor_worker_pct: 12.0, slum_density_pct: 5.0, green_cover_pct: 38.0, hospital_dist: 0.8 },
        population: 95000,
        uhi_offset: -1.5
      },
      {
        id: "W-04",
        name: "Informal Settlement & Basti",
        zone: "East Zone",
        coords: [28.6320, 77.2800],
        polygon: [
          [28.6480, 77.2620], [28.6480, 77.2980], [28.6150, 77.2980], [28.6150, 77.2620]
        ],
        demographics: { elderly_pct: 11.5, outdoor_worker_pct: 48.0, slum_density_pct: 68.0, green_cover_pct: 8.0, hospital_dist: 4.2 },
        population: 210000,
        uhi_offset: 2.1
      },
      {
        id: "W-05",
        name: "Commercial District",
        zone: "South Zone",
        coords: [28.5600, 77.2100],
        polygon: [
          [28.5780, 77.1920], [28.5780, 77.2280], [28.5420, 77.2280], [28.5420, 77.1920]
        ],
        demographics: { elderly_pct: 12.0, outdoor_worker_pct: 34.0, slum_density_pct: 18.0, green_cover_pct: 18.0, hospital_dist: 1.5 },
        population: 130000,
        uhi_offset: 0.5
      }
    ],
    shelters: [
      { name: "Central Metro Cooling Concourse", coords: [28.6515, 77.2310], type: "cooling_shelter" },
      { name: "LNJP Super-Specialty Heat Stroke Center", coords: [28.6380, 77.2400], type: "hospital" },
      { name: "North Municipal Community Cooling Hall", coords: [28.6820, 77.2210], type: "cooling_shelter" },
      { name: "East District Trauma Center", coords: [28.6300, 77.2820], type: "hospital" }
    ]
  },
  ahmedabad: {
    name: "Ahmedabad AMC",
    center: [23.0225, 72.5714],
    zoom: 12,
    wards: [
      {
        id: "W-01",
        name: "Old Walled City (Kalupur)",
        zone: "Central Zone",
        coords: [23.0300, 72.5950],
        polygon: [
          [23.0400, 72.5850], [23.0400, 72.6050], [23.0200, 72.6050], [23.0200, 72.5850]
        ],
        demographics: { elderly_pct: 15.0, outdoor_worker_pct: 45.0, slum_density_pct: 48.0, green_cover_pct: 3.5, hospital_dist: 1.0 },
        population: 160000,
        uhi_offset: 2.6
      },
      {
        id: "W-02",
        name: "Vatva Industrial Estate",
        zone: "South Zone",
        coords: [22.9600, 72.6300],
        polygon: [
          [22.9750, 72.6150], [22.9750, 72.6450], [22.9450, 72.6450], [22.9450, 72.6150]
        ],
        demographics: { elderly_pct: 7.5, outdoor_worker_pct: 58.0, slum_density_pct: 42.0, green_cover_pct: 5.0, hospital_dist: 3.5 },
        population: 190000,
        uhi_offset: 2.2
      }
    ],
    shelters: [
      { name: "SVP Hospital Emergency Heat Triage", coords: [23.0180, 72.5720], type: "hospital" },
      { name: "Kalupur Air-Cooled Passenger Shelter", coords: [23.0310, 72.5960], type: "cooling_shelter" }
    ]
  },
  nagpur: {
    name: "Nagpur NMC",
    center: [21.1458, 79.0882],
    zoom: 12,
    wards: [
      {
        id: "W-01",
        name: "Sitabuldi Market",
        zone: "Central Zone",
        coords: [21.1480, 79.0850],
        polygon: [
          [21.1600, 79.0700], [21.1600, 79.1000], [21.1350, 79.1000], [21.1350, 79.0700]
        ],
        demographics: { elderly_pct: 13.5, outdoor_worker_pct: 46.0, slum_density_pct: 44.0, green_cover_pct: 7.0, hospital_dist: 1.4 },
        population: 150000,
        uhi_offset: 2.5
      }
    ],
    shelters: [
      { name: "GMC Nagpur Heat Wave Dedicated Ward", coords: [21.1380, 79.0980], type: "hospital" }
    ]
  },
  hyderabad: {
    name: "Hyderabad GHMC",
    center: [17.3850, 78.4867],
    zoom: 11.5,
    wards: [
      {
        id: "W-01",
        name: "Charminar Basti",
        zone: "South Zone",
        coords: [17.3616, 78.4747],
        polygon: [
          [17.3750, 78.4600], [17.3750, 78.4900], [17.3480, 78.4900], [17.3480, 78.4600]
        ],
        demographics: { elderly_pct: 12.8, outdoor_worker_pct: 44.0, slum_density_pct: 54.0, green_cover_pct: 6.0, hospital_dist: 1.6 },
        population: 175000,
        uhi_offset: 2.1
      }
    ],
    shelters: [
      { name: "Osmania General Hospital Triage", coords: [17.3780, 78.4790], type: "hospital" }
    ]
  }
};

// 5-Day Synoptic Progression
const SYNOPTIC_DAYS = [
  { day: "Day 1 (Today)", base_temp: 41.5, humidity: 55, wind: 2.5, solar: 850 },
  { day: "Day 2 (+24h)", base_temp: 43.0, humidity: 58, wind: 2.2, solar: 890 },
  { day: "Day 3 (Peak)", base_temp: 44.8, humidity: 62, wind: 1.7, solar: 940 },
  { day: "Day 4 (+72h)", base_temp: 45.4, humidity: 64, wind: 1.4, solar: 960 },
  { day: "Day 5 (Relief)", base_temp: 43.2, humidity: 59, wind: 2.6, solar: 880 }
];

document.addEventListener("DOMContentLoaded", () => {
  initMap();
  setupEventListeners();
  loadDataAndRender();
});

// Initialize Leaflet Map
function initMap() {
  const city = CITIES_DATA[currentCityKey];
  map = L.map("gis-map-canvas", { zoomControl: true }).setView(city.center, city.zoom);

  L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
    attribution: '&copy; CartoDB | OpenStreetMap',
    maxZoom: 18,
    subdomains: 'abcd'
  }).addTo(map);

  setTimeout(() => map.invalidateSize(), 300);
}

// Thermal & Biometeorological Physics
function calculateThermalMetrics(temp, rh, wind, solar) {
  const tw = temp * Math.atan(0.151977 * Math.pow(rh + 8.313659, 0.5)) +
             Math.atan(temp + rh) -
             Math.atan(rh - 1.676331) +
             0.00391838 * Math.pow(rh, 1.5) * Math.atan(0.023101 * rh) - 4.686035;
  
  const tg = temp + (0.014 * solar) / Math.sqrt(Math.max(0.1, wind));
  const wbgt = 0.7 * tw + 0.2 * tg + 0.1 * temp;
  const utci = temp + (solar / 1000) * 4.5 - 1.8 * (wind - 1.0) + 0.25 * ((rh / 100) * 20);

  return {
    wbgt: parseFloat(wbgt.toFixed(1)),
    utci: parseFloat(utci.toFixed(1)),
    tw: parseFloat(tw.toFixed(1)),
    tg: parseFloat(tg.toFixed(1))
  };
}

function calculateHVI(demographics) {
  const elderly = demographics.elderly_pct / 100.0;
  const workers = demographics.outdoor_worker_pct / 100.0;
  const slums = demographics.slum_density_pct / 100.0;
  const green = demographics.green_cover_pct / 100.0;
  const dist = Math.min(10, demographics.hospital_dist) / 10.0;

  let score = 0.25 * (elderly / 0.2) + 0.25 * (workers / 0.5) + 0.25 * (slums / 0.6) + 0.1 * dist - 0.15 * (green / 0.4);
  score = Math.max(0.1, Math.min(0.98, score));
  return parseFloat(score.toFixed(2));
}

function calculateMortality(wbgt, hvi, population) {
  const threshold = 28.0;
  let rr = 1.0;
  if (wbgt > threshold) {
    const excess = wbgt - threshold;
    rr = Math.exp(0.12 * excess * (1.0 + hvi));
  }
  const excessMortalityPct = Math.round((rr - 1.0) * 100);
  const hospitalSurgePct = Math.round((Math.exp(0.18 * Math.max(0, wbgt - threshold) * (1.0 + hvi)) - 1.0) * 100);
  const mri = Math.min(100, Math.round(excessMortalityPct * 0.6 + hvi * 40));

  const dailyDeaths = Math.max(0, Math.round(((population * 0.007) / 365) * (rr - 1.0)));
  const dailyAdmissions = Math.max(0, Math.round(((population * 0.05) / 365) * ((hospitalSurgePct / 100))));

  return {
    mri: mri,
    excess_mortality_pct: excessMortalityPct,
    hospital_surge_pct: hospitalSurgePct,
    daily_excess_deaths: dailyDeaths,
    daily_excess_admissions: dailyAdmissions,
    pop_at_risk: Math.round(population * hvi)
  };
}

// Load Data & Render Views
function loadDataAndRender() {
  const weather = SYNOPTIC_DAYS[currentDayOffset];
  const city = CITIES_DATA[currentCityKey] || CITIES_DATA.delhi;

  wardsData = city.wards.map(ward => {
    const temp = parseFloat((weather.base_temp + ward.uhi_offset).toFixed(1));
    const thermal = calculateThermalMetrics(temp, weather.humidity, weather.wind, weather.solar);
    const hvi = calculateHVI(ward.demographics);
    const mortality = calculateMortality(thermal.wbgt, hvi, ward.population);

    return {
      ...ward,
      weather: { temp, humidity: weather.humidity, wind: weather.wind, solar: weather.solar },
      thermal,
      hvi,
      mortality
    };
  });

  renderMapLayers();
  updateTopMetrics();
  updateAdvisoryPanel();
  updateWhatIfSimulator();
}

// Render Wards on Map
function renderMapLayers() {
  wardLayers.forEach(l => map.removeLayer(l));
  wardLayers = [];
  shelterMarkers.forEach(m => map.removeLayer(m));
  shelterMarkers = [];

  wardsData.forEach(ward => {
    const fillColor = getLayerColor(ward, currentLayer);

    const polygonLayer = L.polygon(ward.polygon, {
      color: fillColor,
      weight: 2,
      opacity: 0.9,
      fillColor: fillColor,
      fillOpacity: 0.6
    }).addTo(map);

    polygonLayer.bindTooltip(`
      <div style="font-family: Inter, sans-serif; font-size: 12px; color: #fff;">
        <strong>${ward.name}</strong><br/>
        WBGT: <span style="color: #ff5545; font-weight: bold;">${ward.thermal.wbgt}°C</span><br/>
        Hospital Surge: <span style="color: #fe9400;">+${ward.mortality.hospital_surge_pct}%</span>
      </div>
    `, { sticky: true });

    polygonLayer.on('click', () => {
      selectedWardId = ward.id;
      updateAdvisoryPanel();
      wardLayers.forEach(l => l.setStyle({ weight: 2, fillOpacity: 0.6 }));
      polygonLayer.setStyle({ weight: 4, fillOpacity: 0.85 });
      map.panTo(ward.coords);
    });

    wardLayers.push(polygonLayer);
  });

  // Render Shelters
  if (currentLayer === 'shelters') {
    const city = CITIES_DATA[currentCityKey];
    if (city && city.shelters) {
      city.shelters.forEach(s => {
        const isHosp = s.type === 'hospital';
        const iconHtml = isHosp 
          ? `<div style="background: #ff5545; color: #fff; width: 26px; height: 26px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid #fff;"><span class="material-symbols-outlined" style="font-size: 14px;">local_hospital</span></div>`
          : `<div style="background: #00f0ff; color: #000; width: 26px; height: 26px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid #fff;"><span class="material-symbols-outlined" style="font-size: 14px;">ac_unit</span></div>`;
        
        const customIcon = L.divIcon({
          html: iconHtml,
          className: 'custom-map-icon',
          iconSize: [26, 26],
          iconAnchor: [13, 13]
        });

        const marker = L.marker(s.coords, { icon: customIcon }).addTo(map);
        marker.bindPopup(`<strong>${s.name}</strong><br/>${isHosp ? 'Heat Stroke Emergency Triage' : 'Active Public Cooling Shelter'}`);
        shelterMarkers.push(marker);
      });
    }
  }
}

function getLayerColor(ward, layerType) {
  if (layerType === 'wbgt') {
    const v = ward.thermal.wbgt;
    if (v < 26) return '#34c759';
    if (v < 29) return '#ffcc00';
    if (v < 31) return '#ff9500';
    if (v < 33) return '#ff5545';
    return '#93000a';
  } else if (layerType === 'mortality') {
    const m = ward.mortality.mri;
    if (m < 30) return '#34c759';
    if (m < 55) return '#ffcc00';
    if (m < 75) return '#ff9500';
    return '#ff5545';
  }
  return '#ff5545';
}

// Update Top Dashboard Summary Numbers
function updateTopMetrics() {
  if (!wardsData.length) return;
  const maxWbgt = Math.max(...wardsData.map(w => w.thermal.wbgt));
  const maxUtci = Math.max(...wardsData.map(w => w.thermal.utci));
  const totalHospitalSurge = Math.round(wardsData.reduce((acc, w) => acc + w.mortality.hospital_surge_pct, 0) / wardsData.length);
  const totalPopRisk = wardsData.reduce((acc, w) => acc + w.mortality.pop_at_risk, 0);

  document.getElementById('val-wbgt').innerText = `${maxWbgt}°C`;
  document.getElementById('val-utci').innerText = `${maxUtci}°C`;
  document.getElementById('val-hospital-surge').innerText = `+${totalHospitalSurge}%`;
  document.getElementById('val-pop-risk').innerText = totalPopRisk.toLocaleString();
}

// Update Advisory Panel & Transcript
function updateAdvisoryPanel() {
  const ward = wardsData.find(w => w.id === selectedWardId) || wardsData[0];
  if (!ward) return;

  const advisoryConfig = LOCAL_LANGUAGE_ADVISORIES[currentLanguage] || LOCAL_LANGUAGE_ADVISORIES.hi;
  const transcript = advisoryConfig.template(ward.name, ward.thermal.wbgt);

  document.getElementById('adv-lang-title').innerText = `LOCAL VOICE ADVISORY (${advisoryConfig.name.toUpperCase()})`;
  document.getElementById('adv-ward-name').innerText = ward.name;
  document.getElementById('adv-transcript').innerText = `"${transcript}"`;

  // Update Demographic stats in tab
  document.getElementById('val-ward-hvi').innerText = ward.hvi;
  document.getElementById('pct-elderly').innerText = `${ward.demographics.elderly_pct}%`;
  document.getElementById('bar-elderly').style.width = `${Math.min(100, ward.demographics.elderly_pct * 5)}%`;
  document.getElementById('pct-workers').innerText = `${ward.demographics.outdoor_worker_pct}%`;
  document.getElementById('bar-workers').style.width = `${Math.min(100, ward.demographics.outdoor_worker_pct * 2)}%`;
  document.getElementById('pct-slums').innerText = `${ward.demographics.slum_density_pct}%`;
  document.getElementById('bar-slums').style.width = `${Math.min(100, ward.demographics.slum_density_pct * 1.5)}%`;
  document.getElementById('pct-green').innerText = `${ward.demographics.green_cover_pct}%`;
  document.getElementById('bar-green').style.width = `${Math.min(100, ward.demographics.green_cover_pct * 2.5)}%`;

  renderTrendChart(ward);
}

// Play Voice Advisory via Web Speech API
function playSpeechAdvisory() {
  if (!('speechSynthesis' in window)) {
    alert("Speech synthesis is not supported on this browser.");
    return;
  }

  window.speechSynthesis.cancel();

  if (isSpeakingAudio) {
    isSpeakingAudio = false;
    document.getElementById('adv-play-icon').innerText = 'play_arrow';
    document.getElementById('adv-waves').classList.remove('playing');
    return;
  }

  const ward = wardsData.find(w => w.id === selectedWardId) || wardsData[0];
  const advisoryConfig = LOCAL_LANGUAGE_ADVISORIES[currentLanguage] || LOCAL_LANGUAGE_ADVISORIES.hi;
  const textToSpeak = advisoryConfig.template(ward.name, ward.thermal.wbgt);

  const utterance = new SpeechSynthesisUtterance(textToSpeak);
  utterance.lang = advisoryConfig.langCode;
  utterance.rate = 0.95;

  utterance.onstart = () => {
    isSpeakingAudio = true;
    document.getElementById('adv-play-icon').innerText = 'pause';
    document.getElementById('adv-waves').classList.add('playing');
  };

  utterance.onend = () => {
    isSpeakingAudio = false;
    document.getElementById('adv-play-icon').innerText = 'play_arrow';
    document.getElementById('adv-waves').classList.remove('playing');
  };

  utterance.onerror = () => {
    isSpeakingAudio = false;
    document.getElementById('adv-play-icon').innerText = 'play_arrow';
    document.getElementById('adv-waves').classList.remove('playing');
  };

  window.speechSynthesis.speak(utterance);
}

// Render Chart.js Trend
function renderTrendChart(ward) {
  const canvas = document.getElementById('wardTrendChart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const labels = SYNOPTIC_DAYS.map(d => d.day.split(' ')[0]);
  const wbgtValues = SYNOPTIC_DAYS.map(d => calculateThermalMetrics(d.base_temp + ward.uhi_offset, d.humidity, d.wind, d.solar).wbgt);
  const tempValues = SYNOPTIC_DAYS.map(d => d.base_temp + ward.uhi_offset);

  if (trendChart) {
    trendChart.destroy();
  }

  trendChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'WBGT Stress (°C)',
          data: wbgtValues,
          borderColor: '#ff5545',
          backgroundColor: 'rgba(255, 85, 69, 0.15)',
          fill: true,
          tension: 0.35,
          borderWidth: 2,
          pointRadius: 3
        },
        {
          label: 'Dry Air Temp (°C)',
          data: tempValues,
          borderColor: '#fe9400',
          borderDash: [4, 4],
          borderWidth: 1.5,
          pointRadius: 2,
          fill: false
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { labels: { color: '#94a3b8', font: { size: 10 } } }
      },
      scales: {
        x: { ticks: { color: '#94a3b8', font: { size: 10 } }, grid: { display: false } },
        y: { ticks: { color: '#94a3b8', font: { size: 10 } }, grid: { color: 'rgba(255,255,255,0.05)' } }
      }
    }
  });
}

// What-If Simulator
function updateWhatIfSimulator() {
  const mist = document.getElementById('sim-mist')?.checked || false;
  const coolRoof = document.getElementById('sim-cool-roof')?.checked || false;
  const shelters = document.getElementById('sim-shelters')?.checked || false;

  let deltaWbgt = 0;
  if (mist) deltaWbgt += 1.4;
  if (coolRoof) deltaWbgt += 0.8;
  if (shelters) deltaWbgt += 0.5;

  const dropPct = Math.round(deltaWbgt * 12.8);
  document.getElementById('sim-wbgt-drop').innerText = `-${deltaWbgt.toFixed(1)}°C`;
  document.getElementById('sim-surge-drop').innerText = `-${dropPct}%`;
}

// Event Listeners Setup
function setupEventListeners() {
  // Bottom Navbar View Switcher
  const btnNavMonitor = document.getElementById('nav-btn-monitor');
  const btnNavAdvisory = document.getElementById('nav-btn-advisory');
  const btnNavActions = document.getElementById('nav-btn-actions');

  const viewMonitor = document.getElementById('view-monitor');
  const viewAdvisory = document.getElementById('view-advisory');
  const viewActions = document.getElementById('view-actions');

  const switchTab = (activeBtn, activeView) => {
    [btnNavMonitor, btnNavAdvisory, btnNavActions].forEach(b => {
      b.classList.remove('bg-secondary-container', 'text-on-secondary-container');
      b.classList.add('text-on-surface-variant');
    });
    activeBtn.classList.add('bg-secondary-container', 'text-on-secondary-container');
    activeBtn.classList.remove('text-on-surface-variant');

    [viewMonitor, viewAdvisory, viewActions].forEach(v => v.classList.add('hidden'));
    activeView.classList.remove('hidden');

    if (activeView === viewMonitor) {
      setTimeout(() => map.invalidateSize(), 200);
    }
  };

  btnNavMonitor?.addEventListener('click', () => switchTab(btnNavMonitor, viewMonitor));
  btnNavAdvisory?.addEventListener('click', () => switchTab(btnNavAdvisory, viewAdvisory));
  btnNavActions?.addEventListener('click', () => switchTab(btnNavActions, viewActions));

  // Language Dropdown
  document.getElementById('header-lang-select')?.addEventListener('change', (e) => {
    currentLanguage = e.target.value;
    updateAdvisoryPanel();
  });

  // City Dropdown
  document.getElementById('header-city-select')?.addEventListener('change', (e) => {
    currentCityKey = e.target.value;
    const city = CITIES_DATA[currentCityKey] || CITIES_DATA.delhi;
    selectedWardId = city.wards[0].id;
    map.flyTo(city.center, city.zoom, { duration: 1.2 });
    loadDataAndRender();
  });

  // Voice Play Buttons
  document.getElementById('btn-quick-voice')?.addEventListener('click', () => {
    switchTab(btnNavAdvisory, viewAdvisory);
    playSpeechAdvisory();
  });
  document.getElementById('btn-toggle-speech')?.addEventListener('click', playSpeechAdvisory);

  // Forecast Day Buttons
  document.querySelectorAll('.forecast-day-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.forecast-day-btn').forEach(b => {
        b.classList.remove('glass-alert');
        b.classList.add('glass-panel');
      });
      btn.classList.add('glass-alert');
      btn.classList.remove('glass-panel');
      currentDayOffset = parseInt(btn.getAttribute('data-day'));
      loadDataAndRender();
    });
  });

  // Play Timeline Forecast
  document.getElementById('btn-play-timeline-forecast')?.addEventListener('click', () => {
    if (isPlayingForecast) {
      clearInterval(forecastInterval);
      document.getElementById('btn-play-timeline-forecast').innerHTML = '<span class="material-symbols-outlined text-[16px]">play_arrow</span> Play';
      isPlayingForecast = false;
    } else {
      document.getElementById('btn-play-timeline-forecast').innerHTML = '<span class="material-symbols-outlined text-[16px]">pause</span> Pause';
      isPlayingForecast = true;
      forecastInterval = setInterval(() => {
        currentDayOffset = (currentDayOffset + 1) % 5;
        const allBtns = document.querySelectorAll('.forecast-day-btn');
        allBtns.forEach((b, i) => {
          if (i === currentDayOffset) {
            b.classList.add('glass-alert');
            b.classList.remove('glass-panel');
          } else {
            b.classList.remove('glass-alert');
            b.classList.add('glass-panel');
          }
        });
        loadDataAndRender();
      }, 2400);
    }
  });

  // Layer buttons
  ['btn-layer-wbgt', 'btn-layer-mortality', 'btn-layer-shelters'].forEach(id => {
    document.getElementById(id)?.addEventListener('click', (e) => {
      document.querySelectorAll('.layer-pill-btn').forEach(b => {
        b.classList.remove('bg-primary/20', 'text-primary', 'border-primary/40');
        b.classList.add('bg-white/5', 'text-on-surface-variant', 'border-white/10');
      });
      e.target.classList.add('bg-primary/20', 'text-primary', 'border-primary/40');
      e.target.classList.remove('bg-white/5', 'text-on-surface-variant', 'border-white/10');
      currentLayer = id.replace('btn-layer-', '');
      renderMapLayers();
    });
  });

  // Simulator Checkboxes
  ['sim-mist', 'sim-cool-roof', 'sim-shelters'].forEach(id => {
    document.getElementById(id)?.addEventListener('change', updateWhatIfSimulator);
  });

  // Dispatch Alerts
  const triggerToast = () => {
    const toast = document.getElementById('dispatch-toast');
    toast.classList.remove('hidden');
    setTimeout(() => toast.classList.add('hidden'), 4000);
  };
  document.getElementById('btn-dispatch-wa')?.addEventListener('click', triggerToast);
  document.getElementById('btn-dispatch-sms-alert')?.addEventListener('click', triggerToast);
}

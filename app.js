import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

// ==========================================================================
// City & Region Database with Real Geographic Coordinates & Thermal Metrics
// ==========================================================================
const CITIES_DATA = {
  'hyderabad': {
    name: 'Hyderabad, Telangana',
    lat: 17.3850,
    lng: 78.4867,
    temp: 42.1,
    humidity: 68,
    wind: 12.6,
    solar: 620,
    wbgt: 34.8,
    utci: 41.2,
    heatIndex: 53.1,
    discomfort: 'Extreme',
    stressLevel: 'CRITICAL',
    levelBadge: 'Level 5',
    stressNum: 38.7,
    alertTitle: 'EXTREME HEAT ALERT',
    alertBadge: 'Red Alert',
    alertDesc: 'Severe heatwave conditions likely to persist for next 3 days.',
    alertWards: 'Ward 14A-19B',
    elderly: '2.41 Lakh',
    workers: '1.87 Lakh',
    children: '1.32 Lakh',
    illness: '4.65 Lakh',
    confidence: 87,
    peakMort: '+12%',
    peakHosp: '+19%',
    hotspots: [
      { name: 'Charminar Old City (Ward 39)', temp: 43.8, risk: 'Extreme (96)', lat: 17.3616, lng: 78.4747 },
      { name: 'Abids Commercial Zone (Ward 40)', temp: 43.4, risk: 'Extreme (94)', lat: 17.3912, lng: 78.4764 },
      { name: 'Sultan Bazar & Koti (Ward 41)', temp: 43.1, risk: 'Extreme (91)', lat: 17.3833, lng: 78.4867 },
      { name: 'Himayatnagar (Ward 35)', temp: 42.2, risk: 'Very High (78)', lat: 17.4020, lng: 78.4880 },
      { name: 'Musheerabad Market (Ward 33)', temp: 42.0, risk: 'Very High (76)', lat: 17.4180, lng: 78.5020 },
      { name: 'Somajiguda & Punjagutta (Ward 32)', temp: 41.8, risk: 'Very High (72)', lat: 17.4260, lng: 78.4550 }
    ],
    shelters: [
      { name: 'GHMC Community Cooling Shelter', loc: 'Near Charminar Bus Station', distance: '0.8 km' },
      { name: 'Red Cross Hydration & First Aid Post', loc: 'Abids Circle', distance: '1.2 km' },
      { name: 'Govt Maternity Hospital Air Shelter', loc: 'Sultan Bazar', distance: '1.9 km' },
      { name: 'Secunderabad Railway Cooling Hub', loc: 'Station Road Platform 1', distance: '3.4 km' },
      { name: 'KIMS Relief Shelter', loc: 'Minister Road, Begumpet', distance: '4.2 km' },
      { name: 'Hitec City Public AC Transit Centre', loc: 'Cyber Towers Junction', distance: '7.8 km' }
    ]
  },
  'delhi': {
    name: 'New Delhi, Delhi',
    lat: 28.6139,
    lng: 77.2090,
    temp: 45.2,
    humidity: 52,
    wind: 14.8,
    solar: 710,
    wbgt: 36.4,
    utci: 44.1,
    heatIndex: 56.4,
    discomfort: 'Severe',
    stressLevel: 'CRITICAL',
    levelBadge: 'Level 5',
    stressNum: 41.2,
    alertTitle: 'RED HEATWAVE WARNING',
    alertBadge: 'Red Alert',
    alertDesc: 'Severe loo winds and critical daytime thermal radiation.',
    alertWards: 'Najafgarh, Mungeshpur, Narela',
    elderly: '3.85 Lakh',
    workers: '3.10 Lakh',
    children: '2.45 Lakh',
    illness: '6.20 Lakh',
    confidence: 91,
    peakMort: '+16%',
    peakHosp: '+24%',
    hotspots: [
      { name: 'Mungeshpur AWS', temp: 46.8, risk: 'Extreme (99)', lat: 28.8080, lng: 77.0220 },
      { name: 'Najafgarh Rural Belt', temp: 46.2, risk: 'Extreme (98)', lat: 28.6090, lng: 76.9850 },
      { name: 'Chandni Chowk Old Delhi', temp: 45.4, risk: 'Extreme (95)', lat: 28.6506, lng: 77.2303 },
      { name: 'Connaught Place Core', temp: 44.6, risk: 'Very High (82)', lat: 28.6315, lng: 77.2167 }
    ],
    shelters: [
      { name: 'Delhi Disaster Management Cooling Hub', loc: 'Old Delhi Railway Station', distance: '1.1 km' },
      { name: 'AIIMS Heat Triage Shelter', loc: 'Ansari Nagar', distance: '3.2 km' },
      { name: 'ISBT Kashmiri Gate AC Lounge', loc: 'Kashmiri Gate', distance: '2.5 km' }
    ]
  },
  'ahmedabad': {
    name: 'Ahmedabad, Gujarat',
    lat: 23.0225,
    lng: 72.5714,
    temp: 44.1,
    humidity: 58,
    wind: 11.2,
    solar: 680,
    wbgt: 35.6,
    utci: 42.8,
    heatIndex: 54.8,
    discomfort: 'Extreme',
    stressLevel: 'CRITICAL',
    levelBadge: 'Level 5',
    stressNum: 39.8,
    alertTitle: 'HAP RED ALERT',
    alertBadge: 'Red Alert',
    alertDesc: 'Ahmedabad Heat Action Plan Level 3 triggered.',
    alertWards: 'Danilimda, Maninagar, Kalupur',
    elderly: '2.10 Lakh',
    workers: '1.95 Lakh',
    children: '1.15 Lakh',
    illness: '3.90 Lakh',
    confidence: 89,
    peakMort: '+14%',
    peakHosp: '+21%',
    hotspots: [
      { name: 'Kalupur Walled City', temp: 44.9, risk: 'Extreme (95)', lat: 23.0280, lng: 72.5950 },
      { name: 'Naroda Industrial Estate', temp: 44.5, risk: 'Extreme (93)', lat: 23.0650, lng: 72.6580 },
      { name: 'Vastrapur Urban Zone', temp: 43.2, risk: 'High (68)', lat: 23.0350, lng: 72.5280 }
    ],
    shelters: [
      { name: 'AMC Public Cooling Ward', loc: 'Kalupur Relief Road', distance: '0.9 km' },
      { name: 'Civil Hospital Heat Center', loc: 'Asarwa', distance: '2.1 km' }
    ]
  },
  'mumbai': {
    name: 'Mumbai, Maharashtra',
    lat: 19.0760,
    lng: 72.8777,
    temp: 36.8,
    humidity: 84,
    wind: 16.5,
    solar: 540,
    wbgt: 33.2,
    utci: 39.4,
    heatIndex: 49.6,
    discomfort: 'High',
    stressLevel: 'HIGH',
    levelBadge: 'Level 4',
    stressNum: 34.6,
    alertTitle: 'COASTAL HEAT HUMIDITY ADVISORY',
    alertBadge: 'Orange Alert',
    alertDesc: 'High relative humidity (84%) creates elevated thermal distress.',
    alertWards: 'Dharavi, Dadar, Kurla',
    elderly: '3.12 Lakh',
    workers: '2.60 Lakh',
    children: '1.80 Lakh',
    illness: '5.10 Lakh',
    confidence: 85,
    peakMort: '+8%',
    peakHosp: '+13%',
    hotspots: [
      { name: 'Dharavi Slum Cluster', temp: 38.6, risk: 'Very High (79)', lat: 19.0400, lng: 72.8500 },
      { name: 'Kurla Industrial Area', temp: 37.8, risk: 'High (64)', lat: 19.0700, lng: 72.8800 }
    ],
    shelters: [
      { name: 'BMC Disaster Management AC Post', loc: 'Dadar Station Plaza', distance: '1.5 km' },
      { name: 'KEM Hospital Heatwave Unit', loc: 'Parel', distance: '2.3 km' }
    ]
  },
  'bengaluru': {
    name: 'Bengaluru, Karnataka',
    lat: 12.9716,
    lng: 77.5946,
    temp: 34.5,
    humidity: 62,
    wind: 10.5,
    solar: 580,
    wbgt: 29.8,
    utci: 33.5,
    heatIndex: 38.2,
    discomfort: 'Moderate',
    stressLevel: 'MODERATE',
    levelBadge: 'Level 2',
    stressNum: 29.2,
    alertTitle: 'MODERATE HEAT ADVISORY',
    alertBadge: 'Yellow Alert',
    alertDesc: 'Elevated daytime temperatures in urban heat islands.',
    alertWards: 'Peenya, Majestic, Whitefield',
    elderly: '1.90 Lakh',
    workers: '1.40 Lakh',
    children: '1.05 Lakh',
    illness: '3.20 Lakh',
    confidence: 90,
    peakMort: '+3%',
    peakHosp: '+6%',
    hotspots: [
      { name: 'Peenya Industrial Zone', temp: 36.2, risk: 'Moderate (38)', lat: 13.0300, lng: 77.5100 },
      { name: 'Majestic Bus Stand Hub', temp: 35.4, risk: 'Moderate (32)', lat: 12.9750, lng: 77.5700 }
    ],
    shelters: [
      { name: 'BBMP Public Cooling Pavilion', loc: 'Majestic City Railway', distance: '1.0 km' },
      { name: 'Victoria Hospital Triage', loc: 'Fort Road', distance: '1.8 km' }
    ]
  },
  'chennai': {
    name: 'Chennai, Tamil Nadu',
    lat: 13.0827,
    lng: 80.2707,
    temp: 39.4,
    humidity: 78,
    wind: 14.2,
    solar: 630,
    wbgt: 34.2,
    utci: 40.8,
    heatIndex: 52.4,
    discomfort: 'Extreme',
    stressLevel: 'CRITICAL',
    levelBadge: 'Level 5',
    stressNum: 37.8,
    alertTitle: 'SEVERE COASTAL HEATWAVE',
    alertBadge: 'Red Alert',
    alertDesc: 'High ocean moisture and temperatures above 39°C causing extreme heat index.',
    alertWards: 'George Town, Royapuram, T. Nagar',
    elderly: '2.30 Lakh',
    workers: '1.90 Lakh',
    children: '1.25 Lakh',
    illness: '4.20 Lakh',
    confidence: 88,
    peakMort: '+11%',
    peakHosp: '+18%',
    hotspots: [
      { name: 'George Town Harbor', temp: 40.8, risk: 'Extreme (91)', lat: 13.0900, lng: 80.2900 },
      { name: 'T. Nagar Commercial Core', temp: 39.9, risk: 'Very High (77)', lat: 13.0400, lng: 80.2300 }
    ],
    shelters: [
      { name: 'Chennai Central Railway Cooling Shelter', loc: 'Park Town', distance: '0.9 km' },
      { name: 'Rajiv Gandhi GH Heat Wing', loc: 'EVR Periyar Salai', distance: '1.4 km' }
    ]
  }
};

// Global App State
let currentCityKey = 'hyderabad';
let currentUnit = 'C'; // 'C' or 'F'
let userCoords = null;
let dashboardLeafletMap = null;
let fullLeafletMap = null;
let dashboardChartInstance = null;
let hourlyChartInstance = null;
let healthChartInstance = null;
let fullMapHeatLayer = null;
let fullMapMarkerGroup = null;

// ==========================================================================
// Helper Functions: Temperature Unit Conversion
// ==========================================================================
function formatTemp(valInC) {
  if (currentUnit === 'F') {
    const f = (valInC * 9 / 5) + 32;
    return `${f.toFixed(1)} °F`;
  }
  return `${valInC.toFixed(1)} °C`;
}

// ==========================================================================
// SPA Router: Sidebar Navigation & Page Switcher
// ==========================================================================
function initRouter() {
  const navItems = document.querySelectorAll('.sidebar-nav .nav-item, .link-to-view');
  const viewSections = document.querySelectorAll('.view-section');

  function switchView(viewName) {
    if (!viewName) viewName = 'dashboard';

    // Update active nav item
    document.querySelectorAll('.sidebar-nav .nav-item').forEach(item => {
      if (item.getAttribute('data-view') === viewName) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    // Update view sections
    viewSections.forEach(section => {
      if (section.id === `view-${viewName}`) {
        section.classList.add('active-view');
      } else {
        section.classList.remove('active-view');
      }
    });

    // Handle view-specific initializations
    if (viewName === 'heatmap') {
      setTimeout(() => {
        initOrUpdateFullLeafletMap();
      }, 100);
    } else if (viewName === 'forecast') {
      setTimeout(() => {
        renderHourlyForecastChart();
        renderForecastTable();
      }, 100);
    } else if (viewName === 'health-impact') {
      setTimeout(() => {
        renderHealthStrainChart();
      }, 100);
    } else if (viewName === 'action-center') {
      renderCoolingShelters();
    }
  }

  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      const view = item.getAttribute('data-view');
      if (view) {
        window.location.hash = view;
        switchView(view);
      }
    });
  });

  // Handle URL hash changes
  window.addEventListener('hashchange', () => {
    const hash = window.location.hash.replace('#', '');
    if (hash) switchView(hash);
  });

  // Check initial hash
  const initialHash = window.location.hash.replace('#', '');
  if (initialHash) {
    switchView(initialHash);
  }

  // Brand logo click returns to dashboard
  const brandLogo = document.getElementById('logo-home-link');
  if (brandLogo) {
    brandLogo.addEventListener('click', () => {
      window.location.hash = 'dashboard';
      switchView('dashboard');
    });
  }
}

// ==========================================================================
// Dashboard Update Engine (Updates all metrics when location changes)
// ==========================================================================
function updateDashboardData(cityKey) {
  const city = CITIES_DATA[cityKey] || CITIES_DATA['hyderabad'];
  currentCityKey = cityKey;

  // Update Top Location Text
  const locationText = document.getElementById('current-location-text');
  if (locationText) locationText.textContent = city.name;

  const fullmapLabel = document.getElementById('fullmap-location-label');
  if (fullmapLabel) fullmapLabel.textContent = city.name;

  // Update Human Thermal Stress Index
  const stressNum = document.getElementById('val-stress-num');
  const stressLevel = document.getElementById('val-stress-level');
  const levelBadge = document.getElementById('val-level-badge');
  const stressGaugeFill = document.getElementById('stress-gauge-fill');

  if (stressNum) stressNum.textContent = city.stressNum.toFixed(1);
  if (stressLevel) stressLevel.textContent = city.stressLevel;
  if (levelBadge) levelBadge.textContent = city.levelBadge;

  if (stressGaugeFill) {
    // Dynamic circle gauge fill
    const maxStress = 45;
    const pct = Math.min(Math.max((city.stressNum / maxStress), 0.3), 0.95);
    const strokeDash = 301.59;
    stressGaugeFill.style.strokeDashoffset = (strokeDash * (1 - pct)).toString();

    if (city.stressLevel === 'CRITICAL') {
      stressGaugeFill.style.stroke = '#EF4444';
    } else if (city.stressLevel === 'HIGH') {
      stressGaugeFill.style.stroke = '#F97316';
    } else {
      stressGaugeFill.style.stroke = '#EAB308';
    }
  }

  // Update Metrics Row
  const wbgt = document.getElementById('val-wbgt');
  const utci = document.getElementById('val-utci');
  const heatIndex = document.getElementById('val-heat-index');
  const discomfort = document.getElementById('val-discomfort');

  if (wbgt) wbgt.textContent = formatTemp(city.wbgt);
  if (utci) utci.textContent = formatTemp(city.utci);
  if (heatIndex) heatIndex.textContent = formatTemp(city.heatIndex);
  if (discomfort) discomfort.textContent = city.discomfort;

  // Update Key Weather Parameters
  const temp = document.getElementById('val-temp');
  const humidity = document.getElementById('val-humidity');
  const wind = document.getElementById('val-wind');
  const solar = document.getElementById('val-solar');

  if (temp) temp.textContent = formatTemp(city.temp);
  if (humidity) humidity.textContent = `${city.humidity} %`;
  if (wind) wind.textContent = `${city.wind} km/h`;
  if (solar) solar.textContent = `${city.solar} W/m²`;

  // Update Active Alert Card
  const alertTitle = document.getElementById('val-alert-title');
  const alertBadge = document.getElementById('val-alert-badge');
  const alertDesc = document.getElementById('val-alert-desc');
  const alertWards = document.getElementById('val-alert-wards');

  if (alertTitle) alertTitle.textContent = city.alertTitle;
  if (alertBadge) {
    alertBadge.innerHTML = `<span class="red-alert-dot"></span>${city.alertBadge}`;
  }
  if (alertDesc) alertDesc.textContent = city.alertDesc;
  if (alertWards) alertWards.textContent = city.alertWards;

  // Update Population Stats
  const popElderly = document.getElementById('pop-elderly');
  const popWorkers = document.getElementById('pop-workers');
  const popChildren = document.getElementById('pop-children');
  const popIllness = document.getElementById('pop-illness');

  if (popElderly) popElderly.textContent = city.elderly;
  if (popWorkers) popWorkers.textContent = city.workers;
  if (popChildren) popChildren.textContent = city.children;
  if (popIllness) popIllness.textContent = city.illness;

  // Update Model Confidence
  const confText = document.getElementById('val-conf-text');
  const confFill = document.getElementById('conf-donut-fill');
  if (confText) confText.textContent = `${city.confidence}%`;
  if (confFill) {
    const totalCirc = 238.76;
    confFill.style.strokeDashoffset = (totalCirc * (1 - city.confidence / 100)).toString();
  }

  // Update Forecast Peak cards
  const peakMort = document.getElementById('val-peak-mort');
  const peakHosp = document.getElementById('val-peak-hosp');
  if (peakMort) peakMort.textContent = city.peakMort;
  if (peakHosp) peakHosp.textContent = city.peakHosp;

  // Re-render sub components
  renderHotspotsList();
  renderCoolingShelters();

  // Update Leaflet maps
  if (dashboardLeafletMap) {
    dashboardLeafletMap.setView([city.lat, city.lng], 12);
  }
  if (fullLeafletMap) {
    initOrUpdateFullLeafletMap();
  }
}

// ==========================================================================
// Geolocation & Location Modal System
// ==========================================================================
function initGeolocationAndModal() {
  const modal = document.getElementById('location-modal');
  const openBtn = document.getElementById('location-select-btn');
  const closeBtn = document.getElementById('modal-close-btn');
  const gpsBtn = document.getElementById('modal-gps-btn');
  const gpsTopBtn = document.getElementById('btn-gps-detect');
  const cityListContainer = document.getElementById('city-list-container');
  const searchInput = document.getElementById('city-search-input');
  const gpsBanner = document.getElementById('gps-banner');
  const gpsBannerMsg = document.getElementById('gps-banner-msg');
  const gpsBannerClose = document.getElementById('gps-banner-close');

  // Populate City List in Modal
  function populateCityList(filter = '') {
    if (!cityListContainer) return;
    cityListContainer.innerHTML = '';

    Object.keys(CITIES_DATA).forEach(key => {
      const c = CITIES_DATA[key];
      if (c.name.toLowerCase().includes(filter.toLowerCase())) {
        const div = document.createElement('div');
        div.className = `city-card ${key === currentCityKey ? 'active' : ''}`;
        div.innerHTML = `
          <span class="city-card-name">${c.name.split(',')[0]}</span>
          <span class="city-card-state">${c.name.split(',')[1] || ''}</span>
          <span class="city-card-temp">${c.temp}°C • ${c.stressLevel}</span>
        `;
        div.addEventListener('click', () => {
          updateDashboardData(key);
          modal.style.display = 'none';
        });
        cityListContainer.appendChild(div);
      }
    });
  }

  // Open / Close Modal
  if (openBtn) {
    openBtn.addEventListener('click', () => {
      populateCityList();
      modal.style.display = 'flex';
    });
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      modal.style.display = 'none';
    });
  }

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.style.display = 'none';
    });
  }

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      populateCityList(e.target.value);
    });
  }

  // Trigger GPS Detection
  function detectGPS() {
    if (gpsBanner) {
      gpsBanner.style.display = 'flex';
      if (gpsBannerMsg) gpsBannerMsg.textContent = 'Requesting browser GPS location...';
    }

    if (modal) modal.style.display = 'none';

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          userCoords = { lat, lng };

          if (gpsBannerMsg) {
            gpsBannerMsg.innerHTML = `GPS detected: <strong>${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E</strong> (Local Sensor Calibrated)`;
          }

          // Find closest monitored city
          let closestCity = 'hyderabad';
          let minDistance = 99999;

          Object.keys(CITIES_DATA).forEach(key => {
            const city = CITIES_DATA[key];
            const d = Math.hypot(city.lat - lat, city.lng - lng);
            if (d < minDistance) {
              minDistance = d;
              closestCity = key;
            }
          });

          updateDashboardData(closestCity);

          // Update user location pin on full heatmap
          if (fullLeafletMap && window.L) {
            window.L.circleMarker([lat, lng], {
              radius: 9,
              color: '#2563EB',
              fillColor: '#3B82F6',
              fillOpacity: 0.9,
              weight: 3
            }).addTo(fullLeafletMap).bindPopup('<strong>📍 Your Exact GPS Location</strong><br>Ground Sensor Active').openPopup();

            fullLeafletMap.setView([lat, lng], 13);
          }
        },
        (error) => {
          console.warn('Geolocation failed or denied:', error);
          if (gpsBannerMsg) {
            gpsBannerMsg.textContent = 'GPS permission unavailable. Loaded calibrated regional radar for Hyderabad.';
          }
          setTimeout(() => {
            if (gpsBanner) gpsBanner.style.display = 'none';
          }, 4000);
        },
        { timeout: 8000, enableHighAccuracy: true }
      );
    } else {
      if (gpsBannerMsg) gpsBannerMsg.textContent = 'Geolocation not supported by browser.';
    }
  }

  if (gpsBtn) gpsBtn.addEventListener('click', detectGPS);
  if (gpsTopBtn) gpsTopBtn.addEventListener('click', detectGPS);
  if (gpsBannerClose) {
    gpsBannerClose.addEventListener('click', () => {
      if (gpsBanner) gpsBanner.style.display = 'none';
    });
  }
}

// ==========================================================================
// Real Leaflet.js Interactive Heat Map & Hotspots Integration
// ==========================================================================
function initDashboardLeafletToggle() {
  const btnSvg = document.getElementById('btn-show-svg');
  const btnLeaflet = document.getElementById('btn-show-leaflet');
  const svgWrapper = document.getElementById('map-container');
  const leafletWrapper = document.getElementById('dashboard-leaflet-container');

  if (!btnSvg || !btnLeaflet || !svgWrapper || !leafletWrapper) return;

  btnSvg.addEventListener('click', () => {
    btnSvg.classList.add('active');
    btnLeaflet.classList.remove('active');
    svgWrapper.style.display = 'flex';
    leafletWrapper.style.display = 'none';
  });

  btnLeaflet.addEventListener('click', () => {
    btnLeaflet.classList.add('active');
    btnSvg.classList.remove('active');
    svgWrapper.style.display = 'none';
    leafletWrapper.style.display = 'block';

    if (!dashboardLeafletMap && window.L) {
      const city = CITIES_DATA[currentCityKey];
      dashboardLeafletMap = window.L.map('dashboard-leaflet-map', {
        zoomControl: true,
        attributionControl: false
      }).setView([city.lat, city.lng], 12);

      window.L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        maxZoom: 18
      }).addTo(dashboardLeafletMap);

      // Add Hotspots Circles
      city.hotspots.forEach(h => {
        window.L.circle([h.lat, h.lng], {
          color: '#DC2626',
          fillColor: '#EF4444',
          fillOpacity: 0.5,
          radius: 900
        }).addTo(dashboardLeafletMap).bindPopup(`<strong>${h.name}</strong><br>Temp: ${h.temp}°C<br>Risk: ${h.risk}`);
      });
    } else if (dashboardLeafletMap) {
      dashboardLeafletMap.invalidateSize();
    }
  });
}

function initOrUpdateFullLeafletMap() {
  const mapElement = document.getElementById('fullscreen-leaflet-map');
  if (!mapElement || !window.L) return;

  const city = CITIES_DATA[currentCityKey];

  if (!fullLeafletMap) {
    fullLeafletMap = window.L.map('fullscreen-leaflet-map', {
      zoomControl: true,
      attributionControl: false
    }).setView([city.lat, city.lng], 12);

    window.L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      maxZoom: 18
    }).addTo(fullLeafletMap);

    fullMapMarkerGroup = window.L.layerGroup().addTo(fullLeafletMap);
  } else {
    fullLeafletMap.setView([city.lat, city.lng], 12);
    fullLeafletMap.invalidateSize();
  }

  // Clear and re-populate markers & heat layers
  if (fullMapMarkerGroup) {
    fullMapMarkerGroup.clearLayers();

    // Hotspot zones with custom thermal styling
    city.hotspots.forEach(h => {
      const circle = window.L.circle([h.lat, h.lng], {
        color: '#991B1B',
        fillColor: '#EF4444',
        fillOpacity: 0.45,
        radius: 1200
      }).addTo(fullMapMarkerGroup);

      const marker = window.L.circleMarker([h.lat, h.lng], {
        radius: 7,
        color: '#FFFFFF',
        fillColor: '#DC2626',
        fillOpacity: 1,
        weight: 2
      }).addTo(fullMapMarkerGroup);

      const popupContent = `
        <div style="font-family: 'Plus Jakarta Sans', sans-serif; min-width: 160px;">
          <h4 style="margin: 0 0 4px 0; font-size: 13px; color: #0F172A;">${h.name}</h4>
          <div style="font-size: 12px; color: #EF4444; font-weight: 700;">Ground Temp: ${h.temp} °C</div>
          <div style="font-size: 11px; color: #64748B;">Risk Index: ${h.risk}</div>
        </div>
      `;
      marker.bindPopup(popupContent);
      circle.bindPopup(popupContent);
    });

    // Add user marker if GPS is active
    if (userCoords) {
      window.L.circleMarker([userCoords.lat, userCoords.lng], {
        radius: 9,
        color: '#2563EB',
        fillColor: '#3B82F6',
        fillOpacity: 0.9,
        weight: 3
      }).addTo(fullMapMarkerGroup).bindPopup('<strong>📍 Your Location</strong>');
    }
  }
}

// Render Hotspots List on Heatmap page
function renderHotspotsList() {
  const container = document.getElementById('hotspots-list-container');
  if (!container) return;
  const city = CITIES_DATA[currentCityKey];

  container.innerHTML = '';
  city.hotspots.forEach(h => {
    const item = document.createElement('div');
    item.className = 'hotspot-item';
    item.innerHTML = `
      <div class="hotspot-info">
        <span class="hotspot-name">${h.name}</span>
        <span class="hotspot-status">${h.risk}</span>
      </div>
      <span class="hotspot-temp">${formatTemp(h.temp)}</span>
    `;

    item.addEventListener('click', () => {
      if (fullLeafletMap) {
        fullLeafletMap.setView([h.lat, h.lng], 14);
      }
    });
    container.appendChild(item);
  });
}

// Render Cooling Shelters in Action Center
function renderCoolingShelters() {
  const container = document.getElementById('shelters-list-container');
  const countBadge = document.getElementById('cooling-centres-count');
  if (!container) return;
  const city = CITIES_DATA[currentCityKey];

  if (countBadge) countBadge.textContent = `${city.shelters.length} Centers Active`;

  container.innerHTML = '';
  city.shelters.forEach(s => {
    const card = document.createElement('div');
    card.className = 'shelter-card';
    card.innerHTML = `
      <span class="shelter-badge-open">● OPEN NOW</span>
      <h4 class="shelter-name">${s.name}</h4>
      <p class="shelter-loc">${s.loc}</p>
      <span class="shelter-distance">📍 ${s.distance} away</span>
    `;
    container.appendChild(card);
  });
}

// ==========================================================================
// Chart.js Implementations (5-Day, 24-Hour Diurnal, Hospital Strain)
// ==========================================================================
function initForecastChart() {
  const ctx = document.getElementById('forecastChart');
  if (!ctx) return;

  if (dashboardChartInstance) {
    dashboardChartInstance.destroy();
  }

  dashboardChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['Today\n26 Aug', 'Wed\n27 Aug', 'Thu\n28 Aug', 'Fri\n29 Aug', 'Sat\n30 Aug'],
      datasets: [
        {
          label: 'Mortality Risk (%)',
          data: [14, 20, 23, 27, 22],
          borderColor: '#EF4444',
          backgroundColor: '#EF4444',
          borderWidth: 2,
          tension: 0.4,
          pointRadius: 3.5,
          pointHoverRadius: 5.5,
          pointBackgroundColor: '#EF4444',
          pointBorderColor: '#FFFFFF',
          pointBorderWidth: 1.5,
        },
        {
          label: 'Hospitalization Risk (%)',
          data: [7, 11, 12, 19, 16],
          borderColor: '#8B5CF6',
          backgroundColor: '#8B5CF6',
          borderWidth: 2,
          tension: 0.4,
          pointRadius: 3.5,
          pointHoverRadius: 5.5,
          pointBackgroundColor: '#8B5CF6',
          pointBorderColor: '#FFFFFF',
          pointBorderWidth: 1.5,
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(15, 23, 42, 0.9)',
          titleFont: { family: 'Plus Jakarta Sans', size: 11, weight: '700' },
          bodyFont: { family: 'Plus Jakarta Sans', size: 11 },
          padding: 8,
          cornerRadius: 6
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: {
            font: { family: 'Plus Jakarta Sans', size: 9.5, weight: '500' },
            color: '#64748B',
            callback: function(value, index) {
              const labels = [
                ['Today', '26 Aug'],
                ['Wed', '27 Aug'],
                ['Thu', '28 Aug'],
                ['Fri', '29 Aug'],
                ['Sat', '30 Aug']
              ];
              return labels[index];
            }
          }
        },
        y: {
          min: 0,
          max: 30,
          ticks: {
            stepSize: 10,
            font: { family: 'Plus Jakarta Sans', size: 9.5, weight: '500' },
            color: '#64748B',
            callback: (value) => (value === 0 ? '0' : value + '%')
          },
          grid: { color: '#F1F5F9' }
        }
      }
    }
  });
}

function renderHourlyForecastChart() {
  const ctx = document.getElementById('hourlyChart');
  if (!ctx) return;

  if (hourlyChartInstance) {
    hourlyChartInstance.destroy();
  }

  hourlyChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00', '00:00'],
      datasets: [
        {
          label: 'Ground Temperature (°C)',
          data: [29, 33, 38, 42.1, 43.6, 42.8, 38.5, 34.2, 31.8, 30.2],
          borderColor: '#EA580C',
          backgroundColor: 'rgba(234, 88, 12, 0.08)',
          fill: true,
          tension: 0.35,
          borderWidth: 2.5
        },
        {
          label: 'WBGT Thermal Stress (°C)',
          data: [26, 29, 34, 38.7, 39.4, 38.2, 33.1, 29.5, 27.8, 26.5],
          borderColor: '#EF4444',
          borderDash: [5, 5],
          borderWidth: 2,
          tension: 0.35
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          labels: { font: { family: 'Plus Jakarta Sans', size: 11 } }
        }
      },
      scales: {
        y: {
          min: 20,
          max: 48,
          grid: { color: '#F1F5F9' }
        },
        x: {
          grid: { display: false }
        }
      }
    }
  });
}

function renderHealthStrainChart() {
  const ctx = document.getElementById('healthStrainChart');
  if (!ctx) return;

  if (healthChartInstance) {
    healthChartInstance.destroy();
  }

  healthChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['26 Aug', '27 Aug', '28 Aug', '29 Aug (Peak)', '30 Aug'],
      datasets: [
        {
          label: 'ER Heat Cases / Day',
          data: [42, 68, 95, 142, 110],
          backgroundColor: '#EF4444',
          borderRadius: 4
        },
        {
          label: 'ICU Heatstroke Admissions',
          data: [8, 14, 22, 38, 26],
          backgroundColor: '#8B5CF6',
          borderRadius: 4
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: { font: { family: 'Plus Jakarta Sans', size: 11 } }
        }
      },
      scales: {
        x: { grid: { display: false } },
        y: { grid: { color: '#F1F5F9' } }
      }
    }
  });
}

function renderForecastTable() {
  const tbody = document.getElementById('forecast-table-body');
  if (!tbody) return;

  const days = [
    { day: 'Today (26 Aug)', max: '42.1°C', min: '29.4°C', hum: '68%', wbgt: '38.7°C', risk: 'Extreme (Level 5)', adv: 'Avoid direct sunlight 11am-4pm' },
    { day: 'Wed (27 Aug)', max: '42.8°C', min: '30.1°C', hum: '65%', wbgt: '39.1°C', risk: 'Extreme (Level 5)', adv: 'Hydration checkpoints active' },
    { day: 'Thu (28 Aug)', max: '43.2°C', min: '30.5°C', hum: '64%', wbgt: '39.8°C', risk: 'Extreme (Level 5)', adv: 'Outdoor labor restrictions mandatory' },
    { day: 'Fri (29 Aug)', max: '43.8°C', min: '31.0°C', hum: '69%', wbgt: '40.4°C', risk: 'Peak Critical', adv: 'Cooling centers at max capacity' },
    { day: 'Sat (30 Aug)', max: '41.5°C', min: '28.8°C', hum: '72%', wbgt: '36.8°C', risk: 'Very High (Level 4)', adv: 'Gradual thermal relief expected' },
    { day: 'Sun (31 Aug)', max: '39.2°C', min: '27.5°C', hum: '76%', wbgt: '33.5°C', risk: 'High (Level 3)', adv: 'Evening thunderstorm probability 45%' },
    { day: 'Mon (01 Sep)', max: '37.8°C', min: '26.2°C', hum: '80%', wbgt: '31.2°C', risk: 'Moderate (Level 2)', adv: 'Normal civic routines resume' }
  ];

  tbody.innerHTML = '';
  days.forEach(d => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>${d.day}</strong></td>
      <td style="color: #EF4444; font-weight: 700;">${d.max}</td>
      <td>${d.min}</td>
      <td>${d.hum}</td>
      <td style="font-weight: 600;">${d.wbgt}</td>
      <td><span class="${d.risk.includes('Extreme') || d.risk.includes('Peak') ? 'risk-pill-red' : 'risk-pill-orange'}">${d.risk}</span></td>
      <td style="font-size: 11px; color: #475569;">${d.adv}</td>
    `;
    tbody.appendChild(tr);
  });
}

// ==========================================================================
// Settings Unit Switcher (°C / °F)
// ==========================================================================
function initSettings() {
  const btnC = document.getElementById('unit-c');
  const btnF = document.getElementById('unit-f');

  if (btnC && btnF) {
    btnC.addEventListener('click', () => {
      currentUnit = 'C';
      btnC.classList.add('active');
      btnF.classList.remove('active');
      updateDashboardData(currentCityKey);
    });

    btnF.addEventListener('click', () => {
      currentUnit = 'F';
      btnF.classList.add('active');
      btnC.classList.remove('active');
      updateDashboardData(currentCityKey);
    });
  }

  const exportCsv = document.getElementById('btn-export-csv');
  if (exportCsv) {
    exportCsv.addEventListener('click', () => {
      const csvContent = "data:text/csv;charset=utf-8,Ward,Ground_Temp_C,WBGT_C,Risk_Score,Status\nWard 39 - Charminar,43.8,39.4,96,Extreme\nWard 40 - Abids,43.4,39.1,94,Extreme\nWard 35 - Himayatnagar,42.2,38.2,78,Very High\nWard 1 - Patancheru,36.2,32.4,14,Low";
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `ThermoGuard_Ward_Heat_Report_${currentCityKey}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  }

  const exportPdf = document.getElementById('btn-download-pdf');
  if (exportPdf) {
    exportPdf.addEventListener('click', () => {
      window.print();
    });
  }
}

// ==========================================================================
// Interactive Vector Ward Map Tooltips & Controls
// ==========================================================================
function initVectorWardMap() {
  const mapContainer = document.getElementById('map-container');
  const tooltip = document.getElementById('map-tooltip');
  const ttTitle = document.getElementById('tt-title');
  const ttRisk = document.getElementById('tt-risk');
  const ttTemp = document.getElementById('tt-temp');
  const wardPaths = document.querySelectorAll('.ward-poly');
  const svgElement = document.getElementById('ward-svg-element');

  let currentScale = 1;

  wardPaths.forEach(path => {
    path.addEventListener('mouseenter', () => {
      const name = path.getAttribute('data-name');
      const risk = path.getAttribute('data-risk');
      const temp = path.getAttribute('data-temp');
      const status = path.getAttribute('data-status');

      if (ttTitle) ttTitle.textContent = name;
      if (ttRisk) ttRisk.textContent = `${risk} (${status})`;
      if (ttTemp) ttTemp.textContent = `${temp} °C`;
      if (tooltip) tooltip.style.display = 'block';
    });

    path.addEventListener('mousemove', (e) => {
      if (!mapContainer || !tooltip) return;
      const containerRect = mapContainer.getBoundingClientRect();
      const x = e.clientX - containerRect.left;
      const y = e.clientY - containerRect.top;

      tooltip.style.left = `${x}px`;
      tooltip.style.top = `${y}px`;
    });

    path.addEventListener('mouseleave', () => {
      if (tooltip) tooltip.style.display = 'none';
    });
  });

  const btnZoomIn = document.getElementById('map-zoom-in');
  const btnZoomOut = document.getElementById('map-zoom-out');
  const btnReset = document.getElementById('map-fullscreen');

  if (btnZoomIn && svgElement) {
    btnZoomIn.addEventListener('click', () => {
      if (currentScale < 1.8) {
        currentScale += 0.2;
        svgElement.style.transform = `scale(${currentScale})`;
        svgElement.style.transition = 'transform 0.2s ease';
      }
    });
  }

  if (btnZoomOut && svgElement) {
    btnZoomOut.addEventListener('click', () => {
      if (currentScale > 0.8) {
        currentScale -= 0.2;
        svgElement.style.transform = `scale(${currentScale})`;
        svgElement.style.transition = 'transform 0.2s ease';
      }
    });
  }

  if (btnReset && svgElement) {
    btnReset.addEventListener('click', () => {
      currentScale = 1;
      svgElement.style.transform = `scale(1)`;
      svgElement.style.transition = 'transform 0.2s ease';
    });
  }
}

// Refresh Now handler
function initRefreshHandler() {
  const refreshBtn = document.getElementById('refresh-now-btn');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', () => {
      updateDashboardData(currentCityKey);
    });
  }
}

// ==========================================================================
// App Initialization on DOM Ready
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
  initRouter();
  initGeolocationAndModal();
  initDashboardLeafletToggle();
  initVectorWardMap();
  initForecastChart();
  initSettings();
  initRefreshHandler();
  updateDashboardData('hyderabad');
});

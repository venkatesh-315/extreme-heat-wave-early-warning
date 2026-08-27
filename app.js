import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

// Initialize Chart
function initForecastChart() {
  const ctx = document.getElementById('forecastChart');
  if (!ctx) return;

  const data = {
    labels: ['Today\n26 Aug', 'Wed\n27 Aug', 'Thu\n28 Aug', 'Fri\n29 Aug', 'Sat\n30 Aug'],
    datasets: [
      {
        label: 'Mortality Risk (%)',
        data: [14, 20, 23, 27, 22],
        borderColor: '#EF4444',
        backgroundColor: '#EF4444',
        borderWidth: 2,
        tension: 0.4, // Smooth curve
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
        tension: 0.4, // Smooth curve
        pointRadius: 3.5,
        pointHoverRadius: 5.5,
        pointBackgroundColor: '#8B5CF6',
        pointBorderColor: '#FFFFFF',
        pointBorderWidth: 1.5,
      }
    ]
  };

  new Chart(ctx, {
    type: 'line',
    data: data,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false // Using custom top legend
        },
        tooltip: {
          backgroundColor: 'rgba(15, 23, 42, 0.9)',
          titleFont: { family: 'Plus Jakarta Sans', size: 11, weight: '700' },
          bodyFont: { family: 'Plus Jakarta Sans', size: 11 },
          padding: 8,
          cornerRadius: 6,
          displayColors: true,
          boxWidth: 8,
          boxHeight: 8,
          callbacks: {
            label: function(context) {
              return ` ${context.dataset.label}: ${context.parsed.y}%`;
            }
          }
        }
      },
      scales: {
        x: {
          grid: {
            display: false,
            drawBorder: false,
          },
          ticks: {
            font: {
              family: 'Plus Jakarta Sans',
              size: 9.5,
              weight: '500'
            },
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
            font: {
              family: 'Plus Jakarta Sans',
              size: 9.5,
              weight: '500'
            },
            color: '#64748B',
            callback: function(value) {
              return value === 0 ? '0' : value + '%';
            }
          },
          grid: {
            color: '#F1F5F9',
            drawBorder: false,
          }
        }
      },
      interaction: {
        mode: 'index',
        intersect: false,
      }
    }
  });
}

// Interactive Ward Map Setup
function initMapInteractions() {
  const mapContainer = document.getElementById('map-container');
  const tooltip = document.getElementById('map-tooltip');
  const ttTitle = document.getElementById('tt-title');
  const ttRisk = document.getElementById('tt-risk');
  const ttTemp = document.getElementById('tt-temp');
  const wardPaths = document.querySelectorAll('.ward-poly');
  const svgElement = document.getElementById('ward-svg-element');

  let currentScale = 1;

  wardPaths.forEach(path => {
    path.addEventListener('mouseenter', (e) => {
      const name = path.getAttribute('data-name');
      const risk = path.getAttribute('data-risk');
      const temp = path.getAttribute('data-temp');
      const status = path.getAttribute('data-status');

      ttTitle.textContent = name;
      ttRisk.textContent = `${risk} (${status})`;
      ttTemp.textContent = `${temp} °C`;
      tooltip.style.display = 'block';
    });

    path.addEventListener('mousemove', (e) => {
      const containerRect = mapContainer.getBoundingClientRect();
      const x = e.clientX - containerRect.left;
      const y = e.clientY - containerRect.top;

      tooltip.style.left = `${x}px`;
      tooltip.style.top = `${y}px`;
    });

    path.addEventListener('mouseleave', () => {
      tooltip.style.display = 'none';
    });
  });

  // Map Controls
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

// Nav items active state
function initNavigation() {
  const navItems = document.querySelectorAll('.nav-item');
  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      navItems.forEach(i => i.classList.remove('active'));
      item.classList.add('active');
    });
  });
}

// Live Time Simulation
function initClock() {
  const timeElem = document.getElementById('live-time');
  const dateElem = document.getElementById('live-date');

  function update() {
    const now = new Date();
    // Default to the reference time formatting
    const hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = (hours % 12 || 12).toString().padStart(2, '0');

    // Keep the specified display matching reference or dynamic
    if (timeElem) timeElem.textContent = `10:24 AM`;
    if (dateElem) dateElem.textContent = `26 Aug 2025`;
  }
  update();
}

// Button actions
function initButtonHandlers() {
  const btnAlerts = document.getElementById('btn-all-alerts');
  const btnAction = document.getElementById('btn-action-center');
  const notifBtn = document.getElementById('notif-btn');

  if (btnAlerts) {
    btnAlerts.addEventListener('click', () => {
      console.log('Viewing all alerts');
    });
  }

  if (btnAction) {
    btnAction.addEventListener('click', () => {
      console.log('Viewing action center');
    });
  }

  if (notifBtn) {
    notifBtn.addEventListener('click', () => {
      console.log('Notification center clicked');
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initForecastChart();
  initMapInteractions();
  initNavigation();
  initClock();
  initButtonHandlers();
});

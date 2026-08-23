# Extreme Heatwave Early Warning & Human Thermal Stress Index (SIH-26083)
### Project: **THERMA-GUARD (सुरक्षा-ताप)**
**Hyper-Local Thermal Stress (WBGT/UTCI) & Predictive Mortality Risk Command Platform**

---

## 📁 Repository Structure
```
extreme-heat-wave-early-warning/
│
├── api/                         # 🐍 Python Backend (FastAPI - Vercel Serverless Ready)
│   ├── __init__.py
│   ├── index.py                 # Main FastAPI router & API endpoints
│   ├── thermal_engine.py        # WBGT, UTCI, NOAA Heat Index calculation algorithms
│   ├── mortality_model.py       # Demographic HVI & 3-5 day excess mortality prediction model
│   └── requirements.txt         # Backend dependencies
│
├── public/                      # 🌐 Frontend Command Center (HTML/CSS/JS)
│   ├── index.html               # GIS Command Center Dashboard
│   ├── style.css                # Glassmorphic dark-mode styles & alert animations
│   └── app.js                   # Leaflet GIS map, timeline slider, What-If simulator, TTS
│
├── vercel.json                  # Free 1-click deployment configuration for Vercel
└── README.md
```

---

## 🚀 How to Run Locally

### 1. Run Python Backend (Optional for local full-stack test)
```bash
cd api
pip install -r requirements.txt
python -m uvicorn index:app --reload --port 8000
```

### 2. View the Frontend Dashboard
Simply open `public/index.html` in any web browser, or serve it using any local static server:
```bash
# Using Python
python -m http.server 3000 --directory public

# Or using Node / VS Code Live Server
npx serve public
```

*Note: The frontend includes an integrated dual-engine that automatically connects to the Python API if running, or seamlessly runs client-side physics and risk simulations for instant zero-setup demonstration!*
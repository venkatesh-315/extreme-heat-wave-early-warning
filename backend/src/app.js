const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const config = require('./config/env');
const { notFoundHandler, errorHandler } = require('./middleware/errorMiddleware');
const { getDBStatus } = require('./config/db');

// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const weatherRoutes = require('./routes/weatherRoutes');
const forecastRoutes = require('./routes/forecastRoutes');
const thermalStressRoutes = require('./routes/thermalStressRoutes');
const riskRoutes = require('./routes/riskRoutes');
const alertRoutes = require('./routes/alertRoutes');
const locationRoutes = require('./routes/locationRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

const app = express();

// Security Middleware
app.use(helmet({
  crossOriginResourcePolicy: false,
}));

// CORS Configuration
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
    if (!origin) return callback(null, true);
    if (config.corsOrigins.includes('*') || config.corsOrigins.includes(origin) || config.env === 'development') {
      return callback(null, true);
    }
    return callback(null, true); // Permissive in dev/hackathon setup
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-access-token'],
}));

// HTTP Request Logging
if (config.env !== 'test') {
  app.use(morgan('dev'));
}

// Body Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health Check & Root Route
app.get('/', (req, res) => {
  res.json({
    project: 'ThermoGuard — Extreme Heatwave Early Warning and Human Thermal Stress Index',
    version: '1.0.0',
    status: 'ONLINE',
    dbStatus: getDBStatus(),
    docs: '/api/docs',
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'HEALTHY',
    uptimeSeconds: process.uptime(),
    db: getDBStatus(),
    memoryUsageMB: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
    timestamp: new Date().toISOString(),
  });
});

// Mount API Route Modules
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/forecasts', forecastRoutes);
app.use('/api/thermal-stress', thermalStressRoutes);
app.use('/api/risk', riskRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Error Handling Pipeline
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;

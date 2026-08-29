const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, '../../.env') });

const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 5000,
  mongodbUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/thermoguard',
  jwtSecret: process.env.JWT_SECRET || 'thermoguard_jwt_fallback_secret_key_2026',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  corsOrigins: (process.env.CORS_ORIGIN || 'http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173')
    .split(',')
    .map(origin => origin.trim()),
  openMeteoApiUrl: process.env.OPEN_METEO_API_URL || 'https://api.open-meteo.com/v1/forecast',
  meteoTimeoutMs: parseInt(process.env.METEO_TIMEOUT_MS, 10) || 5000,
};

module.exports = config;

const http = require('http');
const app = require('./src/app');
const config = require('./src/config/env');
const { connectDB } = require('./src/config/db');
const logger = require('./src/utils/logger');

const server = http.createServer(app);

const startServer = async () => {
  try {
    // 1. Connect to MongoDB database
    logger.info('Initializing ThermoGuard backend services...');
    await connectDB();

    // 2. Start HTTP server
    server.listen(config.port, () => {
      logger.info(`========================================================`);
      logger.info(`🔥 ThermoGuard API Server running in ${config.env.toUpperCase()} mode`);
      logger.info(`🌐 Listening on: http://localhost:${config.port}`);
      logger.info(`📋 Health Check: http://localhost:${config.port}/api/health`);
      logger.info(`🛡️ API Base URL: http://localhost:${config.port}/api`);
      logger.info(`========================================================`);
    });
  } catch (err) {
    logger.error('Failed to start server:', err.message);
    process.exit(1);
  }
};

// Handle process termination gracefully
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    logger.info('Process terminated');
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received. Shutting down gracefully...');
  server.close(() => {
    logger.info('Process terminated');
  });
});

startServer();

module.exports = server;

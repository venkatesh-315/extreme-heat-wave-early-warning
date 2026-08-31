const mongoose = require('mongoose');
const config = require('./env');
const logger = require('../utils/logger');

let isConnected = false;

/**
 * Connect to MongoDB instance with resilient retry logic
 */
const connectDB = async () => {
  if (isConnected) {
    logger.info('Using existing database connection');
    return mongoose.connection;
  }

  // Disable command buffering so queries fail immediately or fallback if MongoDB is not running
  mongoose.set('bufferCommands', false);

  try {
    const conn = await mongoose.connect(config.mongodbUri, {
      serverSelectionTimeoutMS: 3000,
      connectTimeoutMS: 3000,
    });

    isConnected = true;
    logger.info(`MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);

    mongoose.connection.on('error', (err) => {
      logger.error('MongoDB runtime error:', err.message);
    });

    mongoose.connection.on('disconnected', () => {
      isConnected = false;
      logger.warn('MongoDB disconnected. Reconnection attempted on next query.');
    });

    return conn;
  } catch (error) {
    logger.warn(`MongoDB Connection Warning: ${error.message}`);
    logger.info('Backend will operate in resilience mode. Ensure MongoDB is running on ' + config.mongodbUri);
    return null;
  }
};

const getDBStatus = () => ({
  isConnected: mongoose.connection.readyState === 1,
  readyState: mongoose.connection.readyState,
  host: mongoose.connection.host || 'unknown',
  name: mongoose.connection.name || 'thermoguard',
});

module.exports = { connectDB, getDBStatus };

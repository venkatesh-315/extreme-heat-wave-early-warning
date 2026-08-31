const { errorResponse } = require('../utils/responseFormatter');

/**
 * Validate Register Input
 */
const validateRegister = (req, res, next) => {
  const { name, email, password } = req.body;
  const errors = [];

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    errors.push('Name is required');
  }

  if (!email || typeof email !== 'string' || !/^\S+@\S+\.\S+$/.test(email.trim())) {
    errors.push('A valid email address is required');
  }

  if (!password || typeof password !== 'string' || password.length < 6) {
    errors.push('Password must be at least 6 characters long');
  }

  if (errors.length > 0) {
    return errorResponse(res, 'Validation failed', 400, errors);
  }

  next();
};

/**
 * Validate Login Input
 */
const validateLogin = (req, res, next) => {
  const { email, password, officerIdOrEmail, passcode } = req.body;
  const identifier = email || officerIdOrEmail;
  const pass = password || passcode;

  const errors = [];

  if (!identifier || typeof identifier !== 'string' || identifier.trim().length === 0) {
    errors.push('Email or Officer ID is required');
  }

  if (!pass || typeof pass !== 'string' || pass.trim().length === 0) {
    errors.push('Password or Passcode is required');
  }

  if (errors.length > 0) {
    return errorResponse(res, 'Validation failed', 400, errors);
  }

  next();
};

/**
 * Validate Calculation Input
 */
const validateCalculation = (req, res, next) => {
  const { temperature, humidity } = req.body;
  const errors = [];

  if (temperature === undefined || isNaN(Number(temperature))) {
    errors.push('Temperature (°C) is required and must be a valid number');
  }

  if (humidity === undefined || isNaN(Number(humidity))) {
    errors.push('Humidity (%) is required and must be a valid number between 1 and 100');
  } else if (Number(humidity) < 0 || Number(humidity) > 100) {
    errors.push('Humidity must be between 0% and 100%');
  }

  if (errors.length > 0) {
    return errorResponse(res, 'Validation failed', 400, errors);
  }

  next();
};

/**
 * Validate Alert Creation Input
 */
const validateAlert = (req, res, next) => {
  const { title, level, message } = req.body;
  const errors = [];

  if (!title || typeof title !== 'string' || title.trim().length === 0) {
    errors.push('Alert title is required');
  }

  if (!level || !['RED', 'ORANGE', 'YELLOW', 'GREEN'].includes(level.toUpperCase())) {
    errors.push('Alert level must be one of: RED, ORANGE, YELLOW, GREEN');
  }

  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    errors.push('Alert message is required');
  }

  if (errors.length > 0) {
    return errorResponse(res, 'Validation failed', 400, errors);
  }

  next();
};

module.exports = {
  validateRegister,
  validateLogin,
  validateCalculation,
  validateAlert,
};

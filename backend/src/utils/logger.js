/**
 * Structured Logger utility for ThermoGuard backend
 */
const logger = {
  info: (msg, meta = '') => {
    const ts = new Date().toISOString();
    console.log(`[${ts}] [INFO]  ${msg}`, meta ? meta : '');
  },
  warn: (msg, meta = '') => {
    const ts = new Date().toISOString();
    console.warn(`[${ts}] [WARN]  ${msg}`, meta ? meta : '');
  },
  error: (msg, err = '') => {
    const ts = new Date().toISOString();
    console.error(`[${ts}] [ERROR] ${msg}`, err ? err : '');
  },
  debug: (msg, meta = '') => {
    if (process.env.NODE_ENV === 'development') {
      const ts = new Date().toISOString();
      console.debug(`[${ts}] [DEBUG] ${msg}`, meta ? meta : '');
    }
  }
};

module.exports = logger;

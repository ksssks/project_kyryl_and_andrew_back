import pino from "pino";

const logger = pino({
  timestamp: () => `,"timestamp":"${new Date().toISOString()}"`,
  formatters: {
    level: (label) => ({ level: label.toUpperCase() })
  }
});

export default logger;
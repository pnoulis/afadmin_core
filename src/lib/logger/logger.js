import pino from "pino";

let logger;
function Logger() {
  if (logger == null) {
    logger = new pino({
      level: `${import.meta.env.VITE_LOG_LEVEL}`,
      timestamp: pino.stdTimeFunctions.isoTime,
      formatters: {
        bindings: () => ({}),
        level: (label) => ({level: label.toUpperCase()})
      },
    });
  }
  return logger;
}

export { Logger };

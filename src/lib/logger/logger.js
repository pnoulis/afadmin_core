import Pino from "pino";

let logger;
function Logger() {
  if (logger == null) {
    logger = new Pino({
      level: `${import.meta.env.VITE_LOG_LEVEL}`,
      timestamp: Pino.stdTimeFunctions.isoTime,
      formatters: {
        bindings: () => ({}),
        level: (label) => ({ level: label.toUpperCase() }),
      },
    });
  }
  return logger;
}

export { Logger };

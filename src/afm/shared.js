class AFMError extends Error {
  constructor(message, cause) {
    super(message, { cause });
    this.name = this.constructor.name;
  }
}

let log = {
  debug: (...args) => console.log(...args),
  info: (...args) => console.log(...args),
  error: (...args) => console.log(...args),
};
function LOGGER(logger) {
  if (logger) {
    log = logger;
  }
  return log;
}

function mixinErr(msg, err, cb) {
  err.message = msg;
  log.error(err);
  cb(err);
}

export { AFMError, LOGGER, mixinErr };

class AFMError extends Error {
  constructor(message, cause) {
    super(message, { cause });
    this.name = this.constructor.name;
  }
}

const LOGGER = {
  debug: (...args) => console.log(...args),
  error: (...args) => console.log(...args),
};

export { AFMError, LOGGER };

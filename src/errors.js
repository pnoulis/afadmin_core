class ValidationError extends Error {
  constructor({ validationErrors }) {
    super("Input validation", {
      cause: {
        validationErrors,
      },
    });
    this.name = this.constructor.name;
    this.statusCode = 400;
    this.statusLabel = "Bad request";
  }
}

class ModelError extends Error {
  constructor(message, cause) {
    super(message, { cause });
    this.name = this.constructor.name;
    this.statusCode = 409;
    this.statusLabel = "Conflict";
  }
}

class TimeoutError extends Error {
  constructor(cause) {
    super("Backend client request timeout", { cause });
    this.name = this.constructor.name;
    this.statusCode = 408;
    this.statusLabel = "Request timeout";
  }
}

export { TimeoutError, ModelError, ValidationError };

function detectRuntime() {
  if (typeof process !== "undefined") {
    return "node";
  } else {
    return "browser";
  }
}

function isRuntime(runtime) {
  return runtime === detectRuntime();
}

function detectMode() {
  const runtime = detectRuntime();
  let mode;

  switch (runtime) {
    case "node":
      mode = process.env.MODE;
      break;
    case "browser":
      mode = import.meta.env.MODE;
      break;
    default:
      throw new Error(`Unknown runtime:${runtime}`);
  }

  if (!mode) {
    throw new Error("Could not detect mode");
  }
  return mode;
}

function isMode(mode) {
  return mode === detectMode();
}

function getEnvar(envar, required = true, defaultValue = "") {
  let value;
  if (isMode("prod")) {
    throw new Error("getEnvar does not work in production mode for now");
  }
  if (isRuntime("node")) {
    value = process.env[envar] || defaultValue;
  } else {
    value = import.meta.env[envar] || defaultValue;
  }

  if (required && !value) {
    throw new Error(`Missing environment variable:${envar}`);
  }
  return value;
}

export { detectRuntime, isRuntime, detectMode, isMode, getEnvar };

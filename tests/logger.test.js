import { describe, it, expect } from "vitest";
import { Logger } from "/src/lib/logger/index.js";


describe("pino logger", () => {
  it("Should inherit the log level from the environment", () => {
    const logger = new Logger();
    expect(logger.level).toBe(import.meta.env.VITE_LOG_LEVEL);
  });
});

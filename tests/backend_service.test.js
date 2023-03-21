import { describe, it, expect, vi } from "vitest";
import { AgentFactoryMachine } from "/src/afm/index.js";
import { backend } from "/src/services/index.js";

describe("backend service", () => {
  it("Should initialize", () => {
    const afm = new AgentFactoryMachine({ backend });
  });
});

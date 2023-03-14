import { describe, it, expect } from "vitest";
import { TaskRunner } from "/src/task_runners/index.js";

describe("task runner", () => {
  it("Should build a default configuration", () => {
    const expectedDefaultConfig = {
      timeout: 3000,
      state: {
        name: "idle",
      },
    };
    const tr = new TaskRunner();
    expect(tr).toMatchObject(expectedDefaultConfig);
  });

  it("Should build a custom configuration", () => {
    const expectedCustomConfig = {
      timeout: 6000,
      state: {
        name: "idle",
      },
    };
    const tr = new TaskRunner({
      timeout: 6000,
    });
    expect(tr).toMatchObject(expectedCustomConfig);
  });
});

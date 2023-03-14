import { describe, it, expect, vi } from "vitest";
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
  it("Should transition from idle to pending when tasks are provided and service is offline", () => {
    const tr = new TaskRunner();
    tr.run(() => console.log("task #1"));
    expect(tr.jobQueue.length).toEqual(1);
    expect(tr.inState("pending")).toBe(true);
  });

  it("Should transition from pending to idle when all tasks have been flushed due to timeout", () => {
    vi.useFakeTimers();
    const tr = new TaskRunner();
    const task = () =>
      new Promise((resolve, reject) => {
        resolve("task 1");
      });

    tr.run(task).catch((err) => console.log(err));
    vi.advanceTimersToNextTimer();
    vi.advanceTimersToNextTimer();
    vi.advanceTimersToNextTimer();
    vi.advanceTimersToNextTimer();
    expect(tr.inState("idle")).toBe(true);
    vi.useRealTimers();
  });
});

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

  it.only("Should transition from pending to idle when all tasks have been flushed due to timeout", async () => {
    vi.useFakeTimers();
    const tr = new TaskRunner();
    const task = () =>
      new Promise((resolve, reject) => {
        resolve("yolo");
      });

    const atask = () =>
      new Promise((resolve, reject) => {
        setTimeout(() => reject(new Error("Task timeout")), 1000);
      });

    // const pr = tr.run(task).then((res) => console.log("yolo"));
    const pr = atask();
    await vi.runAllTimersAsync();
    await expect(() => pr).rejects.toThrow("Task timeout");
    vi.useRealTimers();
  });
  it.only("Shoudl work fine after test", () => {
    console.log("another test");
  });
});

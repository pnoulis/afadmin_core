import { describe, it, expect, vi } from "vitest";
import { TaskRunner } from "/src/task_runners/index.js";

describe("task runner", () => {
  it("Should build a default configuration", () => {
    const expectedDefaultConfig = {
      timeout: 3000,
      pollFrequency: 1000,
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
  it("Should have a queue of _N_ jobs to run when _N_ tasks are scheduled", () => {
    const tr = new TaskRunner();
    const N = 3;
    tr.run(() => console.log("task #1"));
    tr.run(() => console.log("task #2"));
    tr.run(() => console.log("task #3"));
    expect(tr.jobQueue.length).toEqual(N);
  });
  it("Should transition from idle to pending when the jobQueue.length > 0 and service is offline", () => {
    const tr = new TaskRunner();
    tr.run(() => console.log("task #1"));
    expect(tr.inState("pending")).toBe(true);
  });

  it("Should throw a task timeout error for each scheduled task if the service does not connect", async () => {
    vi.useFakeTimers();
    let service = false;
    const isConnected = () => service;
    const tr = new TaskRunner({ isConnected });
    const task1 = () => new Promise((resolve, reject) => resolve("task#1"));
    const task2 = () => new Promise((resolve, reject) => resolve("task#2"));
    expect(tr.run(task1)).rejects.toThrow("Task timeout");
    expect(tr.run(task2)).rejects.toThrow("Task timeout");
    await vi.runAllTimersAsync();
    vi.useRealTimers();
  });

  it("Should successfully run all tasks if the service becomes online", async () => {
    vi.useFakeTimers();
    let service = false;
    const isConnected = () => service;
    const tr = new TaskRunner({ isConnected });
    const task1 = () => new Promise((resolve, reject) => resolve("task#1"));
    const task2 = () => new Promise((resolve, reject) => resolve("task#2"));
    expect(tr.run(task1)).resolves.toEqual("task#1");
    expect(tr.run(task2)).resolves.toEqual("task#2");
    await vi.advanceTimersToNextTimerAsync();
    service = true;
    await vi.runAllTimersAsync();
    vi.useRealTimers();
  });

  it("Should poll for N seconds if the scheduled tasks timeout is N", async () => {
    vi.useFakeTimers();
    const N = 10000;
    let service = false;
    const isConnected = () => service;
    const tr = new TaskRunner({ isConnected });
    const task1 = () => new Promise((resolve, reject) => resolve("task#1"));
    expect(tr.run(task1, { timeout: N })).rejects.toThrow("Task timeout");
    await vi.advanceTimersByTimeAsync(N - 1000);
    expect(tr.inState("pending")).toBe(true);
    await vi.runAllTimersAsync();
    expect(tr.inState("idle")).toBe(true);
    vi.useRealTimers();
  });
});

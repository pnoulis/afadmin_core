/*
  ------------------------------ TaskRunner ------------------------------

  This program is an implementation of the lazy initialization pattern.

  The lazy initialization pattern is intended to make developing asynchronous
  applications easier by a sort of fire and forget method.

  Example not utilizing the lazy initialization pattern:
  Say that a web server has to fetch some data from a database.

  const db = {
  get();
  }

  The developer must initialize the connection usually like this:

  db.connect();

  Only when the database is connected can the developer fetch the desired data.

  Usually:

  db.connect().then(() => db.get(all_users));

  or:

  db.on('connect', () => db.get(all_users));

  This way the fetching of data must be chained. It leads to complex and weak
  code.

  Example using the TaskRunner:

  const db = { get() };
  db.connect();

  const tr = new TaskRunner({
  isConnected: () => db.connected
  })

  tr.run(() => db.get(all_users)).then((res) => console.log(res))
  .catch(err => console.log(timeout error));

  ERRORS:
  TaskRunnerError -> msg: Task timeout
  TaskRunnerError -> msg: Task not a promise
  TaskRunnerError -> msg: Unrecognized state ${state}

  LOGGING:
  logger.debug(...args);

  CONFIGURATION:
  {
  // The amount of time to wait before the scheduled task is considered expired
  timeout: 3000,

  // The frequency by which to poll the service of its connection status
  pollFrequency: 1000,

  // The function that checks the service's connection status
  isConnected: () => false,

  // logger
  logger: { debug(...args) }
  }
 */

let LOGGER = {
  debug: (...args) => console.log(...args),
  trace: (...args) => console.log(...args),
};

class TaskRunnerError extends Error {
  constructor(message, cause) {
    super(message, { cause });
    this.name = this.constructor.name;
  }
}

class TaskRunnerTimeout extends Error {
  constructor() {
    super("task timeout");
    this.name = this.constructor.name;
  }
}

const States = {};
States.Idle = function Idle(taskRunner) {
  this.name = "idle";
  this.taskRunner = taskRunner;
  this.getState = () => this;
};

States.Idle.prototype.run = function run(job) {
  return job(() =>
    this.taskRunner.setState(
      this.taskRunner.isConnected() ? "connected" : "pending"
    )
  );
};

States.Pending = function Pending(taskRunner) {
  this.name = "pending";
  this.taskRunner = taskRunner;
  this.getState = () => this;
};

States.Pending.prototype.init = function init() {
  this.poll();
};

States.Pending.prototype.poll = function poll() {
  const intervalId = setInterval(() => {
    this.taskRunner.logger.trace("polling");
    if (this.taskRunner.isConnected()) {
      clearInterval(intervalId);
      return this.taskRunner.setState("connected");
    }

    this.taskRunner.flush();
    if (this.taskRunner.jobQueue.length === 0) {
      clearInterval(intervalId);
      this.taskRunner.setState("idle");
    }
  }, this.taskRunner.pollFrequency);
};

States.Pending.prototype.run = function run(job) {
  return job();
};

States.Connected = function Connected(taskRunner) {
  this.name = "connected";
  this.taskRunner = taskRunner;
  this.getState = () => this;
};

States.Connected.prototype.init = function init() {
  this.taskRunner.logger.trace("task runner service connected");
  this.taskRunner.flush();
  this.runJobs();
};

States.Connected.prototype.runJobs = function runJobs() {
  this.taskRunner.logger.trace(
    `Jobs to run: ${this.taskRunner.jobQueue.length}`
  );
  if (this.taskRunner.jobQueue.length === 0) {
    this.taskRunner.setState("idle");
  } else if (!this.taskRunner.isConnected()) {
    this.taskRunner.setState("pending");
  } else {
    this.taskRunner.jobQueue.shift().exec();
    this.runJobs();
  }
};

States.Connected.prototype.run = function run(job) {
  return job(() => this.runJobs());
};

function TaskRunner(userConf = {}) {
  const conf = this.parseConf(userConf);
  this.timeout = conf.timeout;
  this.logger = conf.logger;
  this.isConnected = conf.isConnected;
  this.pollFrequency = conf.pollFrequency;
  this.jobQueue = [];
  this.state = null;
  this.states = {
    idle: new States.Idle(this),
    pending: new States.Pending(this),
    connected: new States.Connected(this),
  };
  this.setState("idle");
}

TaskRunner.prototype.parseConf = function parseConf(userConf) {
  const conf = {};
  conf.logger = userConf.logger || LOGGER;
  conf.timeout = userConf.timeout || 3000;
  conf.pollFrequency = userConf.pollFrequency || 1000;
  conf.isConnected = userConf.isConnected ? userConf.isConnected : () => false;
  return conf;
};

TaskRunner.prototype.setState = function (state) {
  const oldState = `[TRANSITION]:taskRunner ${this.state?.name}`;
  this.state = this.states[state];
  this.logger.debug(`${oldState} -> ${this.state.name}`);
  if (!this.state) {
    throw new TaskRunnerError(`Unrecognized state: ${state}`);
  }

  if ("init" in this.state) {
    this.state.init();
  }
};

TaskRunner.prototype.queue = function (job) {
  return this.jobQueue.push(job);
};

TaskRunner.prototype.flush = function () {
  const now = Date.now();
  this.jobQueue = this.jobQueue.filter((job) => {
    if (now >= job.timeout) {
      job.exec(true); // job expired
    }
    return now < job.timeout;
  });
};

TaskRunner.prototype.newJob = function (task, options) {
  return (cb) =>
    new Promise((resolve, reject) => {
      if (options.cb) {
        this.queue({
          timeout: Date.now() + (options.timeout || this.timeout),
          exec: (expired) => {
            if (expired) {
              task(new TaskRunnerTimeout());
            } else {
              try {
                task();
              } catch (err) {
                task(new TaskRunnerError("Synchronous error", err));
              }
            }
          },
        });
      } else {
        this.queue({
          timeout: Date.now() + (options.timeout || this.timeout),
          exec: (expired) => {
            if (expired) {
              reject(new TaskRunnerTimeout());
            } else {
              try {
                task().then(resolve, reject);
              } catch (err) {
                reject(new TaskRunnerError("Synchronous error", err));
              }
            }
          },
        });
      }
      this.logger.trace(`new job scheduled: ${this.jobQueue.length}`);
      cb && cb();
    });
};

TaskRunner.prototype.inState = function (state) {
  return state === this.state.name;
};

TaskRunner.prototype.run = function (options, task) {
  if (typeof options === "function") {
    task = options;
    options = {};
  }
  return this.state.run(this.newJob(task, options));
};

export { TaskRunner };

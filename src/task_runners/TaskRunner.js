class TaskRunnerError extends Error {
  constructor(message) {
    super(message);
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
      this.taskRunner.connected() ? "connected" : "pending"
    )
  );
};

States.Pending = function Pending(taskRunner) {
  this.name = "pending";
  this.taskRunner = taskRunner;
  this.getState = () => this;
};

States.Pending.prototype.init = function init() {
  console.log("pending state init");
  this.poll();
};

States.Pending.prototype.poll = function poll() {
  const intervalId = setInterval(() => {
    console.log("polling");
    if (this.taskRunner.connected()) {
      clearInterval(intervalId);
      return this.taskRunner.setState("connected");
    }

    this.taskRunner.flush();
    if (this.taskRunner.jobQueue.length === 0) {
      clearInterval(intervalId);
      this.taskRunner.setState("idle");
    }
  }, 1000);
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
  this.taskRunner.flush();
  this.runJobs();
};

States.Connected.prototype.runJobs = function runJobs() {
  if (this.taskRunner.jobQueue.length === 0) {
    this.taskRunner.setState("idle");
  } else if (!this.taskRunner.connected()) {
    this.taskRunner.setState("pending");
  } else {
    this.taskRunner.jobQueue.shift()();
    this.runJobs();
  }
};

States.Connected.prototype.run = function run(job) {
  return job(() => this.runJobs());
};

function TaskRunner(userConf = {}) {
  const conf = this.parseConf(userConf);
  this.timeout = conf.timeout;
  this.connected = conf.connected;
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
  const defaultConf = {
    timeout: 3000,
    connected: () => false,
  };

  return {
    ...defaultConf,
    ...userConf,
  };
};

TaskRunner.prototype.setState = function (state) {
  const oldState = `[TRANSITION]:taskRunner ${this.state?.name}`;
  this.state = this.states[state];
  console.log(`${oldState} -> ${this.state.name}`);
  if (!this.state) {
    throw new TaskRunnerError(`Unrecognized state ${state}`);
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
      this.queue({
        timeout: Date.now() + (options.timeout || this.timeout),
        exec: (expired) => {
          if (expired) {
            reject(new TaskRunnerError("Task timeout"));
          } else {
            try {
              task().then(resolve, reject);
            } catch (err) {
              reject(new TaskRunnerError("Task not a promise"));
            }
          }
        },
      });
      cb();
    });
};

TaskRunner.prototype.inState = function (state) {
  return state === this.state.name;
};

TaskRunner.prototype.run = function (task, options = {}) {
  return this.state.run(this.newJob(task, options));
};

export { TaskRunner };

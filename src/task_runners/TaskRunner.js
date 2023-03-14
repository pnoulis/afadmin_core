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
  return job(() => this.taskRunner.setState("pending"));
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
  this.intervalID = setInterval(() => {
    console.log("polling");
    if (this.taskRunner.inState("online")) {
      return clearInterval(this.intervalID);
    }

    this.taskRunner.flush();
    if (this.taskRunner.jobQueue.length === 0) {
      clearInterval(this.intervalID);
      this.taskRunner.setState("idle");
    }
  }, 1000);
};

States.Pending.prototype.run = function run(job) {
  return job();
};

States.Online = function Online(taskRunner) {
  this.name = "online";
  this.taskRunner = taskRunner;
  this.getState = () => this;
};

States.Online.prototype.init = function init() {
  this.runJobs();
};

States.Online.prototype.runJobs = async function runJobs() {
  this.taskRunner.flush();
  if (this.taskRunner.jobQueue.length === 0) {
    return this.taskRunner.setState(this.taskRunner.states.idle.getState());
  }

  if (!this.taskRunner.inState("online")) {
    return this.taskRunner.setState("pending");
  }

  for (const job of this.taskRunner.jobQueue) {
    if (!this.taskRunner.inState("online")) {
      break;
    }
    await job.exec().then(() => {
      job.done = true;
    });
  }

  this.runJobs();
};

States.Online.prototype.run = function run(job) {
  return job();
};

function TaskRunner(config = {}) {
  const conf = this.parseConfig(config);
  this.timeout = conf.timeout;
  this.jobQueue = [];
  this.state = null;
  this.states = {
    idle: new States.Idle(this),
    pending: new States.Pending(this),
    online: new States.Online(this),
  };
  this.setState("idle");
}

TaskRunner.prototype.parseConfig = function parseConfig(config) {
  return {
    timeout: config.timeout || 3000,
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
    if (now > job.timeout) {
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
            return reject(new TaskRunnerError("Task timeout"));
          }
          try {
            task().then(resolve, reject);
          } catch (err) {
            reject(new TaskRunnerError("Task not a promise"));
          }
        },
      });
      cb();
    });
};

TaskRunner.prototype.inState = function (state) {
  return this.state.name === state;
};

TaskRunner.prototype.run = function (task, options = {}) {
  return this.state.run(this.newJob(task, options));
};

export { TaskRunner };

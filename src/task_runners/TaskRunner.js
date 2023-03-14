const States = {};
States.Idle = function Idle(taskRunner) {
  this.name = "idle";
  this.taskRunner = taskRunner;
  this.getState = () => this;
};

States.Idle.prototype.run = function run(task, timeout) {
  return new Promise((resolve, reject) => {
    const job = {
      timeout,
      done: false,
      exec: () => task().then(resolve, reject),
    };
    this.taskRunner.queue(job);
    this.taskRunner.setState(this.taskRunner.states.pending.getState());
  });
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
  this.intervalID = setInterval(() => {
    if (this.state === "online") {
      return clearInterval(this.intervalID);
    }

    this.taskRunner.flush();
    if (this.taskRunner.jobQueue.length === 0) {
      clearInterval(this.intervalID);
      this.taskRunner.setState(this.taskRunner.states.idle.getState());
    }
  }, 1000);
};

States.Pending.prototype.run = function run(task, timeout) {
  return new Promise((reslove, reject) => {
    const job = {
      timeout,
      done: false,
      exec: () => task().then(resolve, reject),
    };

    this.taskRunner.queue(job);
  });
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

  if (this.taskRunner.state !== "online") {
    return this.taskRunner.setState(this.taskRunner.states.pending.getState());
  }

  for (const job of this.taskRunner.jobQueue) {
    if (this.taskRunner.state !== "online") {
      break;
    }
    await job.exec().then(() => (job.done = true));
  }

  this.runJobs();
};

States.Online.prototype.run = function run(task, timeout) {
  return new Promise((resolve, reject) => {
    const job = {
      timeout,
      done: false,
      exec: () => task().then(resolve, reject),
    };
    this.taskRunner.queue(job);
    this.runJobs();
  });
};

function TaskRunner(config = {}) {
  const conf = this.parseConfig(config);
  this.timeout = conf.timeout;
  this.jobQueue = [];
  this.state = "";
  this.states = {
    idle: new States.Idle(this),
    pending: new States.Pending(this),
    online: new States.Online(this),
  };
  this.setState(this.states.idle.getState());
}

TaskRunner.prototype.parseConfig = function parseConfig(config) {
  return {
    timeout: config.timeout || 3000,
  };
};

TaskRunner.prototype.setState = function (state) {
  const oldState = `[TRANSITION]:taskRunner ${this.state?.name}`;
  this.state = state;
  console.log(`${oldState} -> ${this.state.name}`);
  if (Object.hasOwn(state.init)) {
    state.init();
  }
};

TaskRunner.prototype.queue = function (job) {
  this.jobQueue.push(job);
};

TaskRunner.prototype.flush = function () {
  const now = Date.now();
  this.jobQueue = this.jobQueue.filter((job) => {
    if (now > job.timeout) {
      job.done = true;
      job.execute();
    }
    return !job.done;
  });
};

TaskRunner.prototype.run = function (task, options = {}) {
  const timeout = Date.now() + (options.timeout || this.timeout);
  return this.state.run(task, timeout);
};

export { TaskRunner };

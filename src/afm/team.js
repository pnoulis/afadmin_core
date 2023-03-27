import { generateRandomName } from "../lib/index.js";
function teamsFactory(afm) {
  // static initialization
  Team.afm ||= afm;
  Team.teams ||= new Map();
  return Team;
}

class Team {
  static afm;
  static teams;
  constructor(team = {}) {
    const conf = Team.parseConf(team);
    this.id = conf.id;
    this.name = conf.name;
    this.roster = conf.roster;
    this.packages = conf.packages;
    this.state = null;
    this.states = {
      initialized: new Initialized(this),
      cached: new Cached(this),
      registered: new Registered(this),
      playing: new Playing(this),
      paused: new Paused(this),
    };
    this.setState(conf.state);
  }

  static create(team = {}) {
    const newTeam = new Team(team);
    this.teams.set(newTeam.id, newTeam);
    return newTeam;
  }
  static set() {
    console.log("shall set");
  }
  static get() {}
  static has() {}
  static parseConf(userConf) {
    const conf = {};
    conf.id = userConf.id || Math.random().toString(16).slice(2, 8);
    conf.name = userConf.name || generateRandomName();
    conf.roster = userConf.roster || [];
    conf.packages = userConf.packges || [];
    conf.state = "initialized";
    return conf;
  }
}

Team.prototype.setState = function setState(state, cb) {
  if (typeof state === "string") {
    this.state = this.states[state];
  } else {
    this.state = state;
  }
  cb && cb(this.state);
};

Team.prototype.rm = function rm() {
  return "deleted team";
};

class State {
  constructor(team) {
    this.team = team;
  }

  getState() {
    return this;
  }
}

class Initialized extends State {
  constructor(team) {
    super(team);
  }
  static get name() {
    return Initialized.name.toLowerCase();
  }
}

class Cached extends State {
  constructor(team) {
    super(team);
  }
  static get name() {
    return Cached.name.toLowerCase();
  }
}

class Registered extends State {
  constructor(team) {
    super(team);
  }
  static get name() {
    return Registered.name.toLowerCase();
  }
}

class Playing extends State {
  constructor(team) {
    super(team);
  }
  static get name() {
    return Playing.name.toLowerCase();
  }
}

class Paused extends State {
  constructor(team) {
    super(team);
  }
  static get name() {
    return Paused.name.toLowerCase();
  }
}

export { teamsFactory };

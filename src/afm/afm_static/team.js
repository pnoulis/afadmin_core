import { generateRandomName } from "../../lib/index.js";
function teamsFactory(afm) {
  // static initialization
  Team.afm ||= afm;
  Team.teams ||= new Map();
  return Team;
}

class Team {
  static afm;
  static teams;
  constructor(team) {
    const conf = this.parseConf(team);
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
}

Team.prototype.parseConf = function parseConf(team) {
  const conf = {};
  conf.id = team.id || Math.random().toString(16).slice(2, 8);
  conf.name = team.name || generateRandomName();
  conf.roster = team.roster || [];
  conf.packages = team.packges || [];
  conf.state = this.states[team.state || "initialized"];
  return conf;
};

Team.prototype.setState = function (state, cb) {
  this.state = state;
  cb && cb(this.state);
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
    return this.constructor.name.toLowerCase();
  }
}

class Cached extends State {
  constructor(team) {
    super(team);
  }
  static get name() {
    return this.constructor.name.toLowerCase();
  }
}

class Registered extends State {
  constructor(team) {
    super(team);
  }
  static get name() {
    return this.constructor.name.toLowerCase();
  }
}

class Playing extends State {
  constructor(team) {
    super(team);
  }
  static get name() {
    return this.constructor.name.toLowerCase();
  }
}

class Paused extends State {
  constructor(team) {
    super(team);
  }
  static get name() {
    return this.constructor.name.toLowerCase();
  }
}

export { teamsFactory };

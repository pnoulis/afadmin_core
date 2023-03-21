import { generateRandomName } from "../lib/index.js";
import { LOGGER, AFMError } from "./shared.js";

const States = {};
States.Initialized = function Initialized(team) {
  this.name = "initialized";
  this.team = team;
  this.getState = () => this;
};
States.Initialized.prototype.rm = function rm(cb) {
  cb();
};

States.Cached = function Cached(team) {
  this.name = "cached";
  this.team = team;
  this.getState = () => this;
};
States.Cached.prototype.rm = function rm(cb) {
  cb();
};
States.Registered = function Registered(team) {
  this.name = "registered";
  this.team = team;
  this.getState = () => this;
};
States.Registered.prototype.rm = function rm(cb) {
  cb();
};
States.Playing = function Playing(team) {
  this.name = "playing";
  this.team = team;
  this.getState = () => this;
};
States.Playing.prototype.rm = function rm(cb) {
  cb(new AFMError(`Cannot remove a playing team:${this.team.id}`));
};

States.Paused = function Paused(team) {
  this.name = "paused";
  this.team = team;
  this.getState = () => this;
};
States.Paused.prototype.rm = function rm(cb) {
  cb(new AFMError(`Cannot remove a playing team:${this.team.id}`));
};

class Team {
  constructor(team, afm) {
    const conf = this.parseConf(team);
    this.afm = afm;
    this.id = conf.id;
    this.isGroup = conf.isGroup;
    this.name = conf.name;
    this.roster = conf.roster;
    this.packages = conf.packages;
    this.state = null;
    this.states = {
      initialized: new States.Initialized(this),
      cached: new States.Cached(this),
      registered: new States.Registered(this),
      playing: new States.Playing(this),
      paused: new States.Paused(this),
    };
    this.setState("initialized");
  }
}

Team.prototype.parseConf = function parseConf(team) {
  const conf = {};
  conf.id = Math.random().toString(16).slice(2, 8);
  conf.name = generateRandomName();
  conf.roster = [];
  conf.packages = [];
  conf.isGroup = team.isGroup ?? false;
  return conf;
};

Team.prototype.setState = function (state) {
  const oldState = `[TRANSITION]:taskRunner ${this.state?.name}`;
  this.state = this.states[state];
  LOGGER.debug(`${oldState} -> ${this.state.name}`);
  if (!this.state) {
    throw new AFMError(`Unrecognized state: ${state}`);
  }

  if ("init" in this.state) {
    this.state.init();
  }
};

Team.prototype.rm = function rm(cb) {
  return this.state.rm(cb);
};

class GroupTeam extends Team {
  constructor(team, afm) {
    super({ ...team, isGroup: true }, afm);
  }
}

class TeamsManager {
  constructor(afm) {
    this.afm = afm;
    this.teams = new Map();
    this.activeTeam = null;
  }
}

TeamsManager.prototype.create = function create(team) {
  const newTeam = team.isGroup
    ? new GroupTeam(team, this.afm)
    : new Team(team, this.afm);
  this.teams.set(newTeam.id, newTeam);
  LOGGER.debug(`Created team: ${newTeam.id}`);
  return this.teams.get(newTeam.id);
};

TeamsManager.prototype.get = function get(teamId) {
  return this.teams.get(teamId);
};

TeamsManager.prototype.has = function has(teamId) {
  return this.teams.has(teamId);
};

TeamsManager.prototype.rm = function rm(teamId) {
  if (this.has(teamId)) {
    this.get(teamId).rm((err) => {
      if (err) {
        throw err;
      }
      this.teams.delete(teamId);
      LOGGER.debug(`Deleted team: ${teamId}`);
    });
  }
};

export { Team, GroupTeam, TeamsManager };

import { TeamsManager } from "./team.js";

class AgentFactoryMachine {
  constructor(services) {
    this.teams = new TeamsManager(this);
    this.services = services;
  }
}

export { AgentFactoryMachine };

import { TeamsManager } from "./team.js";
import { backend } from "./backend.js";

class AgentFactoryMachine {
  constructor() {
    this.teams = new TeamsManager(this);
  }
}

export { AgentFactoryMachine };

import { TeamsManager } from "./team.js";
import { AFMError, LOGGER } from "./shared.js";

class AgentFactoryMachine {
  constructor(userConf) {
    const conf = this.parseConf(userConf);
    this.services = conf.services;
    this.teams = new TeamsManager(this);
  }
}

AgentFactoryMachine.prototype.parseConf = function parseConf(userConf) {
  const conf = {
    services: {
      backend: userConf?.services?.backend || null,
    },
  };

  if (!conf.services.backend) {
    throw new AFMError("Missing backend service");
  }

  return conf;
};

export { AgentFactoryMachine };

import { teamsFactory } from "./team.js";
import { AfMError, LOGGER } from "../shared.js";

class AgentFactoryMachine {
  constructor(userConf) {
    const conf = this.parseConf(userConf);
    this.state = conf.state;
    this.backend = conf.services.backend;
    this.teams = teamsFactory(this);
  }
}

AgentFactoryMachine.prototype.parseConf = function parseConf(userConf) {
  const conf = {
    services: {
      backend: userConf?.services?.backend || null,
      logger: LOGGER(userConf?.services?.logger),
    },
    state: userConf.state || {},
  };

  if (!conf.services.backend) {
    throw new AFMError("Missing backend service");
  }

  return conf;
};

import { teamsFactory } from "./team.js";
import { playersFactory } from "./player.js";
import { AFMError, LOGGER } from "./shared.js";

let log;
class AgentFactoryMachine {
  constructor(userConf = {}) {
    const conf = AgentFactoryMachine.parseConf(userConf);
    log = conf.services.logger;
    this.state = conf.state;
    this.backend = conf.services.backend;
    this.teams = teamsFactory(this);
    this.players = playersFactory(this);
  }

  static parseConf(userConf) {
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
  }
}

export { AgentFactoryMachine };

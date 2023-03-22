import { LOGGER, AFMError } from "./shared.js";

class PlayersManager {
  constructor(afm) {
    this.afm = afm;
  }
}

PlayersManager.prototoype.login = async function login(player) {};

PlayersManager.prototype.register = function register(player) {};

PlayersManager.prototype.has = function has(player) {};

export { PlayersManager };

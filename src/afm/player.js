import { validatePlayer } from "./validate.js";
import { LOGGER, AFMError, mixinErr } from "./shared.js";
import { Wristband } from "./wristband.js";
import * as Errors from "../errors.js";

let log;
function playersFactory(afm) {
  Player.afm ||= afm;
  Player.players ||= new Map();
  return Player;
}

class Player {
  static afm;
  static players;
  constructor(player = {}) {
    const conf = Player.parseConf(player);
    this.wristband = conf.wristband;
    log = LOGGER();
  }

  static parseConf(userConf) {
    const conf = {};
    conf.wristband = new Wristband();
    return userConf;
  }

  /**
   * Login a player
   *
   * @async
   * @param {object} player
   * @param {string} player.username
   * @param {string} player.password
   * @returns {object} player - Logged in player
   * @returns {string} player.username
   * @returns {string} player.email
   * @returns {null} player.name
   * @returns {null} player.surname
   * @throws {(TimeoutError|ValidationError|ModelError|Error)} The validation
   * errors are stored in: ValidationError.cause.validationErrors
   **/
  static async login(player) {
    return new Promise((resolve, reject) => {
      validatePlayer.login(player, (validationErrors) =>
        reject(new Errors.ValidationError(validationErrors))
      );

      Player.afm.backend
        .publish("/player/login", player)
        .then((res) => resolve(res))
        .catch((err) => mixinErr("Failed player login", err, reject));
    });
  }

  /**
   * Register a player
   *
   * @async
   * @param {object} player
   * @param {string} player.username
   * @param {string} player.name
   * @param {string} player.surname
   * @param {string} [player.password]
   * @returns {object} player - Registered player
   * @returns {string} player.username
   * @returns {string} player.email
   * @returns {null} player.name
   * @returns {null} player.surname
   * @throws {(TimeoutError|ValidationError|ModelError|Error)} The validation
   * errors are stored in: ValidationError.cause.validationErrors
   **/
  static async register(player) {
    return new Promise((resolve, reject) => {
      validatePlayer.registration(player, (validationErrors) =>
        reject(new Errors.ValidationError(validationErrors))
      );

      this.afm.backend
        .publish("/player/register", player)
        .then((res) => resolve(res))
        .catch((err) => mixinErr("Failed player registration", err, reject));
    });
  }

  /**
   * Search a player
   *
   * @async
   * @param {string} searchTerm
   **/
  static async search(player) {
    return new Promise((resolve, reject) => {
      this.afm.backend
        .publish("/player/search", {
          searchTerm: player,
        })
        .then((res) => resolve(res))
        .catch((err) => mixinErr("Failed player search", err, reject));
    });
  }

  /**
   * List all registered players
   *
   * @async
   * @returns {array<object>} players
   * @returns {string} player.username
   **/
  static async list() {
    return new Promise((resolve, reject) => {
      this.afm.backend
        .publish("/players/list")
        .then((res) => resolve(res))
        .catch((err) => mixinErr("Failed to list players", err, reject));
    });
  }
}

export { playersFactory };

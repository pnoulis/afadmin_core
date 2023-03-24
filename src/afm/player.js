import { validatePlayer } from "./validate.js";
import { LOGGER, AFMError, mixinErr } from "./shared.js";
import * as Errors from "../errors.js";

let log;

class Player {
  static afm;
  constructor(afm) {}

  static register() {}

  static login() {}

  static create() {}

  static {
    var a = "yolo";
  }
}

class PlayersManager {
  constructor(afm) {
    this.afm = afm;
    this.players = new Map();
    log = LOGGER();
  }
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
PlayersManager.prototype.login = async function login(player) {
  return new Promise((resolve, reject) => {
    validatePlayer.login(player, (validationErrors) =>
      reject(new Errors.ValidationError(validationErrors))
    );

    this.afm.backend
      .publish("/player/login", player)
      .then((res) => resolve(res))
      .catch((err) => mixinErr("Failed player login", err, reject));
  });
};

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
PlayersManager.prototype.register = async function register(player) {
  return new Promise((resolve, reject) => {
    validatePlayer.registration(player, (validationErrors) =>
      reject(new Errors.ValidationError(validationErrors))
    );

    this.afm.backend
      .publish("/player/register", player)
      .then((res) => resolve(res))
      .catch((err) => mixinErr("Failed player registration", err, reject));
  });
};

PlayersManager.prototype.pairWristband = async function pairWristband(player) {
  return new Promise((resolve, reject) => {
    this.afm.backend.subscribe(
      "/wristband/scan",
      { mode: "response" },
      (err, res) => {
        if (err) {
          return mixinErr(
            "Failed subscription to /wristband/scan",
            err,
            reject
          );
        }
        resolve(res);
      }
    );
  });
};

// PlayersManager.prototype.load = function create(player) {};

// PlayersManager.prototype.has = function has(player) {};

// PlayersManager.prototype.rm = function rm(player) {};

export { PlayersManager };

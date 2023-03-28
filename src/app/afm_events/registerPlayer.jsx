import * as Errors from "/src/errors.js";
import { FlashMessage } from "/src/flash_messages/index.js";

function success(res, resolve, reject) {
  FlashMessage.success(`Successfully registered player ${res.player.username}`);
  resolve(res.player);
}

function modelError(err) {
  if (err instanceof Errors.ModelError) {
    FlashMessage.error(err.cause);
  }
  throw err;
}

function timeoutError(err) {
  if (err instanceof Errors.TimeoutError) {
    FlashMessage.error("400 - Request timeout, try again later...");
  }
  throw err;
}

function anyError(err, reject) {
  if (err instanceof Errors.ValidationError) {
    return reject(err.cause.validationErrors);
  }

  reject();
}

function getRegisterPlayer(afm, fms, modals) {
  return async function registerPlayer(player) {
    return new Promise((resolve, reject) => {
      afm.players
        .register(player)
        .then((res) => success(res, resolve, reject))
        .catch(modelError)
        .catch(timeoutError)
        .catch((err) => anyError(err, reject));
    });
  };
}

export { getRegisterPlayer };

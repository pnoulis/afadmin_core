import * as Errors from "/src/errors.js";

function success(res, resolve, reject) {
  resolve(res.players);
}

function timeoutError(err) {
  if (err instanceof Errors.TimeoutError) {
    FlashMessage.error("400 - Request timeout, try again later...");
  }
  throw err;
}

function getSearchPlayer(afm, fms, modals) {
  return async function searchPlayer(player) {
    return new Promise((resolve, reject) => {
      afm.players
        .search(player)
        .then((res) => success(res, resolve, reject))
        .catch(timeoutError)
        .catch((err) => {
          resolve([]);
        });
    });
  };
}

export { getSearchPlayer };

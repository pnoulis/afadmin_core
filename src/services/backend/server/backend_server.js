import { TaskRunner } from "../../../task_runners/index.js";

function BackendServer(server, mockState, logger) {
  const state = mockState;
  let booted = false;
  const tr = new TaskRunner({
    logger,
    timeout: 50000,
    isConnected: () => server.server.connected && booted,
  });

  server.server.on("connect", function notify() {
    server.logger.info("Mock Backend server service connected");
    server.server.removeListener("connect", notify);
  });

  /**
   * ROUTE: BOOTUP
   * req: /themaze/booted
   * res: /themaze/booted/${clientId}
   **/
  server.subscribe("/boot", (err, msg) => {
    if (err) throw err;
    server.registry.setParam("clientId", msg.deviceId);
    booted = true;
  });

  /**
   * ROUTE: LOGIN PLAYER
   * req: /themaze/${clientId}/gui/player/login
   * res: /themaze/${clientId}/gui/player/login/response
   *
   * @param {Object} msg - request
   * @param {string} msg.username
   * @param {string} msg.password
   * @param {string} msg.confirmPassword
   **/
  tr.run(
    () =>
      new Promise((resolve, reject) => {
        server.subscribe("/player/login", (err, msg) => {
          if (err) throw err;
          const payload = {};
          if (msg.emulateNOK) {
          } else {
          }

          server.publish("/player/login", {
            ...msg,
          });
        });
      })
  );

  /**
   * ROUTE: REGISTER PLAYER
   * req: /themaze/${clientId}/gui/player/registration
   * res: /themaze/${clientId}/gui/player/registration/response
   * @param {object} req - request
   * @param {string} req.username
   * @param {string} req.firstName
   * @param {string} req.lastName
   * @param {string} req.email
   * @param {string} req.password
   * @param {string} req.confirmPassword
   **/
  tr.run(
    () =>
      new Promise((resolve, reject) => {
        server.subscribe("/player/register", (err, req) => {
          let payload;
          if (err) {
            payload = {
              result: "NOK",
            };
          } else if (req.emulateNOK) {
            payload = {
              result: "NOK",
            };
          } else {
            payload = {
              result: "OK",
              ...req,
            };
          }
          server.publish("/player/register", payload);
        });
      })
  );

  tr.run(
    () =>
      new Promise((resolve, reject) => {
        server.publish("/boot", {
          booted,
        });
      })
  );

  /**
   * ROUTE: GET ALL PACKAGES
   * alias: /packages/list
   * req: /themaze/${clientId}/gui/packages/all
   * res: /themaze/${clientId}/gui/packages/all/response
   **/
  tr.run(
    () =>
      new Promise((resolve, reject) => {
        server.subscribe("/packages/list", (err) => {
          if (err) throw err;
          server.publish("/packages/list", state.packages);
        });
      })
  );

  /**
   * ROUTE: GET ALL TEAMS
   * alias: /teams/list
   * req: /themaze/${clientId}/gui/teams/all
   * res: /themaze/${clientId}/gui/teams/all/response
   **/
  tr.run(
    () =>
      new Promise((resolve, reject) => {
        server.subscribe("/teams/list", (err) => {
          if (err) throw err;
          server.publish("/teams/list", state.teams);
        });
      })
  );

  tr.run(
    () =>
      new Promise((resolve, reject) => {
        server.subscribe("/player/search", (err) => {
          if (err) throw err;
          server.publish("/player/search", {
            result: "OK",
            players: state.players,
          });
        });
      })
  );
}

export { BackendServer };

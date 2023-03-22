import { TaskRunner } from "../../../task_runners/index.js";

function BackendServer(server, mockState, mockPackages) {
  let booted = false;
  const tr = new TaskRunner({
    timeout: 50000,
    isConnected: () => server.server.connected && booted,
  });

  server.server.on("connect", () => {
    console.log("Mock Backend server service connected");
  });

  /**
   * ROUTE: BOOTUP
   * req: /themaze/booted
   * res: /themaze/booted/${clientId}
   **/
  server.subscribe("/boot", (err, msg) => {
    if (err) throw err;
    server.registry.setParam("clientId", msg.deviceId);
    console.log("Successfuly booted");
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
          server.publish("/packages/list", BACKEND_PACKAGES);
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
          server.publish("/teams/list", BACKEND_MOCK_STATE.teams);
        });
      })
  );
}

export { BackendServer };

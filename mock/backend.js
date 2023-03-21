import { Proxy } from "../src/mqtt/index.js";
import {
  BACKEND_TOPICS,
  BACKEND_PACKAGES,
  BACKEND_MOCK_STATE,
} from "../data/index.js";
import { TaskRunner } from "../src/task_runners/index.js";
import mqtt from "mqtt";

const HOST = "ws://test.mosquitto.org:8080";
let booted = false;

const makeBackendTopics = (backendTopics) => {
  return backendTopics.map((topic) => ({
    alias: topic.alias,
    pub: topic.sub,
    sub: topic.pub,
  }));
};

const backendTopics = makeBackendTopics(BACKEND_TOPICS);
const mqttBroker = new mqtt.connect(HOST);
const tr = new TaskRunner({
  timeout: 50000,
  isConnected: () => booted,
});
const backend = new Proxy({
  transactionMode: {
    publish: "ff",
    subscribe: "persistent",
  },
  registry: {
    params: {
      clientId: "temp",
    },
    routes: backendTopics,
    strict: false,
  },
  server: mqttBroker,
});
mqttBroker.on("connect", () => {
  console.log("Mock backend connected");
});

/**
 * ROUTE: BOOTUP
 * req: /themaze/booted
 * res: /themaze/booted/${clientId}
 **/
backend.subscribe("/boot", (err, msg) => {
  if (err) throw err;
  backend.registry.setParam("clientId", msg.deviceId);
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
      backend.subscribe("/player/login", (err, msg) => {
        if (err) throw err;
        const payload = {};
        if (msg.emulateNOK) {
        } else {
        }

        backend.publish("/player/login", {
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
      backend.subscribe("/player/register", (err, req) => {
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
        backend.publish("/player/register", payload);
      });
    })
);

tr.run(
  () =>
    new Promise((resolve, reject) => {
      backend.publish("/boot", {
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
      backend.subscribe("/packages/list", (err) => {
        if (err) throw err;
        backend.publish("/packages/list", BACKEND_PACKAGES);
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
      backend.subscribe("/teams/list", (err) => {
        if (err) throw err;
        backend.publish("/teams/list", BACKEND_MOCK_STATE.teams);
      });
    })
);

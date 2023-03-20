import { Proxy } from "../src/mqtt/index.js";
import { BACKEND_TOPICS } from "../data/backend_topics.js";
import mqtt from "mqtt";
import { TaskRunner } from "../src/task_runners/index.js";

const HOST = "ws://test.mosquitto.org:8080";
const CLIENT_ID = "ccid";
let booted = false;

const mqttBroker = new mqtt.connect(HOST);
const tr = new TaskRunner({
  timeout: 50000,
  isConnected: () => booted,
});
const client = new Proxy({
  registry: {
    params: { clientId: CLIENT_ID },
    routes: BACKEND_TOPICS,
    strict: false,
  },
  server: mqttBroker,
});

mqttBroker.on("connect", () => {
  console.log("Mock client connected!");
});

client
  .publish("/boot", {
    deviceId: CLIENT_ID,
    roomName: "registration5",
    deviceType: "REGISTRATION_SCREEN",
  })
  .then((msg) => {
    console.log(msg);
    booted = msg.booted;
  })
  .catch((err) => {
    console.log(err);
  });

// /**
//  * ROUTE: GET ALL PACKAGES
//  **/
// tr.run(() => client.publish("/packages/list"))
//   .then((packages) => {
//     console.log(packages);
//   })
//   .catch((err) => console.log(err));

// /**
//  * ROUTE: GET ALL TEAMS
//  **/

// tr.run(() => client.publish("/teams/list"))
//   .then((teams) => console.log(teams))
//   .catch((err) => console.log(err));

/**
 * ROUTE: REGISTER PLAYER
 **/

tr.run(() => client.publish("/player/register", {}))
  .then((res) => console.log(res))
  .catch((err) => console.log(err));

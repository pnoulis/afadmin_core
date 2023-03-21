import { LOGGER, AFMError } from "./shared.js";
import { Proxy } from "../mqtt/index.js";
import { BACKEND_TOPICS } from "../../data/backend_topics.js";
import mqtt from "mqtt";
import { TaskRunner } from "../task_runners/index.js";

const HOST = "ws://test.mosquitto.org:8080";
const CLIENT_ID = "ccid";
let booted = false;

const mqttBroker = new mqtt.connect(HOST);
const tr = new TaskRunner({
  timeout: 30000,
  isConnected: () => booted,
});
const client = new Proxy({
  registry: {
    params: { clientId: CLIENT_ID },
    routes: BACKEND_TOPICS,
    strict: true,
  },
  server: mqttBroker,
});

mqttBroker.on("connect", () => {
  LOGGER.debug("afm connected to backend!");
});

client
  .publish("/boot", {
    deviceId: CLIENT_ID,
    roomName: "registration5",
    deviceType: "REGISTRATION_SCREEN",
  })
  .then((msg) => {
    booted = msg.booted;
    LOGGER.debug(`afm boot sequence complete: ${CLIENT_ID}`);
  })
  .catch((err) => {
    LOGGER.error(new AFMError("AFM failed to bootstrap", err));
  });

const publish = client.publish.bind(client);
const subscribe = client.subscribe.bind(client);
client.publish = (route, payload, options) =>
  tr.run(() => publish(route, payload, options));
client.subscribe = (route, options, cb) =>
  tr.run(() => new Promise((resolve, reject) => subscribe(route, options, cb)));

export { client as backend };

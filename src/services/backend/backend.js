import { TaskRunner } from "../../task_runners/index.js";
import { Proxy } from "../../mqtt/index.js";
import { BACKEND_TOPICS } from "../../../data/index.js";

const HOST = import.meta.env.VITE_BACKEND_URL;
const BACKEND_CLIENT_ID =
  import.meta.env.VITE_BACKEND_CLIENT_ID ||
  `${import.meta.env.MODE}:${Math.random().toString(16).slice(2, 8)}`;
const LOGLEVEL =
  import.meta.env.VITE_BACKEND_LOGLEVEL || import.meta.env.VITE_LOGLEVEL;

let mqtt;
if (typeof window === "object") {
  mqtt = await import("precompiled-mqtt");
} else {
  mqtt = await import("mqtt");
}
const mqttBroker = new mqtt.connect(HOST, { clientId: BACKEND_CLIENT_ID });
const client = new Proxy({
  id: BACKEND_CLIENT_ID,
  server: mqttBroker,
  registry: {
    params: { clientId: BACKEND_CLIENT_ID },
    routes: BACKEND_TOPICS,
    strict: true,
  },
});

let isBooted = false;
const tr = new TaskRunner({
  timeout: 30000,
  isConnected: () => isBooted,
});

client
  .publish("/boot", {
    deviceId: BACKEND_CLIENT_ID,
    roomName: "registration5",
    deviceType: "REGISTRATION_SCREEN",
  })
  .then((msg) => {
    isBooted = msg.booted;
    console.log(`${BACKEND_CLIENT_ID} bootup sequence complete`);
  })
  .catch((err) => {
    throw err;
  });

const publish = client.publish.bind(client);
const subscribe = client.subscribe.bind(client);
client.publish = (route, payload, options) =>
  tr.run(() => publish(route, payload, options));
client.subscribe = (route, options, cb) =>
  tr.run({ cb: true }, (err) =>
    err ? cb(err) : subscribe(route, options, cb)
  );

export { client as backend };

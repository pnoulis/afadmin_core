import { TaskRunner } from "../../../task_runners/index.js";

function BackendClient(client) {
  let isBooted = false;
  const tr = new TaskRunner({
    timeout: 30000,
    isConnected: () => client.server.connected && isBooted,
  });

  client.server.on("connect", () => {
    console.log("Backend client service connected");
  });

  client
    .publish("/boot", {
      deviceId: client.id,
      roomName: "registration5",
      deviceType: "REGISTRATION_SCREEN",
    })
    .then((msg) => {
      isBooted = msg.booted;
      console.log(`${client.id} bootup sequence complete`);
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
  return client;
}

export { BackendClient };

import { TaskRunner } from "../../../task_runners/index.js";
import * as Errors from "../../../errors.js";

function BackendClient(client, logger) {
  let isBooted = false;
  const tr = new TaskRunner({
    logger,
    timeout: 30000,
    isConnected: () => client.server.connected && isBooted,
  });

  const parseRes = (res) => {
    if (res.result === "NOK") {
      if (res.validationErrors) {
        throw new Errors.ValidationError({
          validationErrors: res.validationErrors,
        });
      } else {
        throw new Errors.ModelError({ message: res.message });
      }
    }
    return res;
  };

  const parseErr = (err) => {
    if (/timeout/.test(err.message)) {
      throw new Errors.TimeoutError(err);
    } else {
      throw err;
    }
  };

  const logRes = (res) => {
    client.logger.info({ response: res }, "backend response");
    return res;
  };

  client.server.on("connect", function notify() {
    client.logger.info("Backend client service connected");
    client.server.removeListener("connect", notify);
  });

  client
    .publish("/boot", {
      deviceId: client.id,
      roomName: "registration5",
      deviceType: "REGISTRATION_SCREEN",
    })
    .then(logRes)
    .then(parseRes)
    .then(() => (isBooted = true))
    .catch(parseErr);

  const publish = client.publish.bind(client);
  const subscribe = client.subscribe.bind(client);
  client.publish = (route, payload, options) =>
    tr
      .run(() => publish(route, payload, options))
      .then(logRes)
      .then(parseRes)
      .catch(parseErr);

  client.subscribe = (route, options, cb) =>
    tr.run({ cb: true }, (err) => {
      try {
        if (err) {
          parseErr(err);
        }
        subscribe(route, options, (err, res) => {
          if (err) {
            parseErr(err);
          }
          logRes(res);
          parseRes(res);

          cb(null, res);
        });
      } catch (err) {
        cb(err);
      }
    });
  return client;
}

export { BackendClient };

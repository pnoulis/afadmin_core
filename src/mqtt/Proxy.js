import { Registry } from "./Registry.js";

let LOGGER = {
  debug: (...args) => console.log(...args),
  warn: (...args) => console.log(...args),
};

class MqttProxyError extends Error {
  constructor(message, cause) {
    super(message, { cause });
    this.name = this.constructor.name;
  }
}

function Proxy(userConf = {}) {
  const conf = this.parseConf(userConf);
  this.name = conf.name;
  this.id = conf.id;
  this.server = conf.server;
  this.transactionMode = conf.transactionMode;
  this.registry = new Registry(conf.registry);
  this.subscriptions = new Map();
  this.server.on("message", this.notifyClients.bind(this));
}

Proxy.prototype.parseConf = function parseConf(userConf) {
  if (userConf.logger) {
    LOGGER = userConf.logger;
  }
  const conf = {};
  conf.name = userConf.proxy?.name || "mqtt_proxy";
  conf.id = `${conf.name}_${Math.random().toString(16).slice(2, 8)}`;
  conf.registry = userConf.registry || {};
  conf.registry.logger = LOGGER;
  /*
    Available modes:
    ff -> fire and forget
        Used for publising one way messages. Does not subscribe the client
        to the response topics
    response -> Used to emulate a req-res cycle.
        Used mostly for publishing, but also useful at times for subscriptions.
        It unregisters the client after one req-res cycle.
    persistent -> receive all messages until instructed otherwise.
   */
  conf.transactionMode = {
    publish: "response",
    subscribe: "persistent",
    ...userConf.transactionMode,
  };
  conf.server = userConf.server ? userConf.server : { on(...args) {} };
  return conf;
};

/**
 * @param {Buffer} msg - message as received from the server
 * @returns {Object}
 * @throws {MqttProxyError} - Failed to decode message
 **/
Proxy.prototype.decode = function decode(msg = "") {
  try {
    return JSON.parse(msg.toString()) || {};
  } catch (err) {
    throw new MqttProxyError("Failed to decode message", msg.toString());
  }
};

/**
 * @param {Object | string} msg
 * @returns {string} - stringified JSON
 * @throws {MqttProxyError}
 **/
Proxy.prototype.encode = function encode(msg = "") {
  try {
    return JSON.stringify(msg);
  } catch (err) {
    throw new MqttProxyError("Failed to encode message", msg);
  }
};

/**
 * @param {string} sub - Registered subscription
 * @param {Object} options
 * @param {string} options.mode - a value of [ 'ff' || 'response' || 'persistent' ]
 * @param {callback(err, msg)} cb - A listener, if the server publishes
 * to the subscirption topic the client is notified through this registered callback
 * @returns {Object} client
 * @returns {string} client.id
 * @returns {function} client.cb
 * @returns {string} client.mode
 **/
Proxy.prototype.registerClient = function registerClient(sub, options, cb) {
  const clients = this.subscriptions.get(sub) || this._subscribe(sub);
  const client = {
    id: `${new Date().getTime()}_${clients.length}`,
    cb,
    sub,
    mode: options.mode,
  };
  clients.push(client);
  LOGGER.debug("Registered new client", clients);
  return client;
};

/**
 * @param {string} sub - Registered subscription
 * @param {string} clientId - The client to remove from the subscription list
 **/
Proxy.prototype.unregisterClient = function unregisterClient(sub, clientId) {
  const clients = this.subscriptions.get(sub);
  if (!clients.length) {
    LOGGER.warn("Trying to unregister client from empty subscription list");
  }
  const client = clients.findIndex((client) => client.id === clientId);
  if (clientId === -1) {
    LOGGER.warn(`Client: ${clientId} missing from subscription list`);
  } else {
    clients.splice(client, 1);
    LOGGER.debug(`Successfully unregistered client: ${clientId}`, clients);
  }
};

/**
 * Subscribe a callback function to the requested topic
 *
 * @param {string} alias - A topic, either registered or unregistered
 * @param {Object} options
 * @param {string} options.mode - a value of [ 'ff' || 'response' || 'persistent' ]
 * @param {function(err, msg)} cb - A client that is to be provided
 * with the message when and if one is available
 */
Proxy.prototype.subscribe = function subscribe(route, options, cb) {
  if (typeof options === "function") {
    cb = options;
    options = {};
  }
  options.mode ||= this.transactionMode.subscribe;

  try {
    var { sub } = this.registry.resolve(route);
    if (!(options.mode !== "persistent" || options.mode !== "response")) {
      throw new MqttProxyError(
        `Transaction mode:${options.mode} not supported by subscribe()`
      );
    }
  } catch (err) {
    return cb(err);
  }

  const client = this.registerClient(sub, options, cb);
  return () => this.unregisterClient(sub, client.id);
};

/**
 * @param {string} sub - Topic to subscribe to
 **/
Proxy.prototype._subscribe = function _subscribe(sub) {
  if (!this.subscriptions.has(sub)) {
    this.subscriptions.set(sub, []);
    this.server.subscribe(sub, (err) => {
      if (err) {
        LOGGER.debug(`Failed to subscribe to topic: ${sub}`);
        this.notifyClients(
          sub,
          new MqttProxyError(`Failed to subscribe to topic: ${sub}`, err)
        );
      } else {
        LOGGER.debug(`Successfully subscribed to topic: ${sub}`);
      }
    });
  }
  return this.subscriptions.get(sub);
};

/**
 * @param {string} route - A registered route alias
 * @param {Object} payload - Data to send
 * @param {Object} options
 * @param {string} options.mode - a value of [ 'ff' || 'response' || 'persistent' ]
 * @returns {Promise}
 **/
Proxy.prototype.publish = async function publish(
  route,
  payload = {},
  options = {}
) {
  options.mode ||= this.transactionMode.publish;
  return new Promise((resolve, reject) => {
    try {
      var { pub, sub } = this.registry.resolve(route);
      var encoded = this.encode(payload);
      switch (options.mode) {
        case "ff":
          this._publish(pub, encoded, (err) => {
            if (err) {
              reject(err);
            } else {
              resolve();
            }
          });
          break;
        case "response":
          const client = this.registerClient(sub, options, (err, msg) => {
            if (err) {
              reject(err);
            } else {
              resolve(msg);
            }
          });

          this._publish(pub, encoded, (err) => {
            if (err) {
              this.unregisterClient(sub, client.id);
              reject(err);
            }
          });
          break;
        default:
          throw new MqttProxyError(
            `Transaction mode:${options.mode} not supported by subscribe()`
          );
      }
    } catch (err) {
      return reject(err);
    }
  });
};

/**
 * @param {string} pub - The topic to publish to
 * @param {string} payload - The encoded data to send
 * @param {Object} client - The client to deliver the response to, if any
 **/
Proxy.prototype._publish = function _publish(pub, payload, cb) {
  this.server.publish(pub, payload, (err) => {
    if (err) {
      LOGGER.debug(`Failed to publish to topic: ${pub}`, err);
      cb(new MqttProxyError("Mqtt Broker error", err));
    } else {
      LOGGER.debug(`Successfully published to topic: ${pub}`);
      cb();
    }
  });
};

/**
 * @param {string} sub - The subscription topic
 * @param {buffer | error} message - Either a buffer represting the undecoded payload
 * as transmitted by the server or an error which signals the subscription could
 * not be established
 **/
Proxy.prototype.notifyClients = function notifyClients(sub, msg) {
  const clients = this.subscriptions.get(sub);
  if (clients.length === 0) {
    return;
  }

  let error = null;
  let decoded = null;
  if (msg instanceof Error) {
    error = msg;
  } else {
    try {
      decoded = this.decode(msg);
    } catch (err) {
      error = err;
    }
  }
  this.subscriptions.set(
    sub,
    clients.filter((client) => {
      client.cb(error, decoded);
      return client.mode !== "persistent";
    })
  );
};

export { Proxy };

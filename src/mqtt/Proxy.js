import { Registry } from "./Registry.js";

const ERR_NAME = "ERR_MQTT_PROXY";

function Proxy(config = {}) {
  const conf = this.parseConfig(config);

  // sub components
  this.server = conf.server;
  this.registry = new Registry(config.registry);

  // own properties
  this.name = conf.proxy.name;
  this.id = conf.proxy.id;
  this.subscriptions = new Map();
}

Proxy.prototype.parseConfig = function parseConfig(config) {
  const name = config.proxy?.name || "mqtt_proxy";
  const id =
    config.proxy?.id ||
    name.concat("_", Math.random().toString(16).slice(2, 8));
  const host = config.server?.host;

  if (!host) {
    const err = new Error("Missing mqtt server host");
    err.name = ERR_NAME;
    throw err;
  }

  return {
    proxy: {
      name,
      id,
    },
    server: {
      host,
      options: {
        keepAlive: 30,
        protocolId: "MQTT",
        protocolVersion: 4,
        clean: false,
        reconnectPeriod: 5000,
        connectTimeout: 30 * 1000,
        clientId: id,
        ...config.server?.options,
      },
    },
  };
};

Proxy.prototype.start = function() {
}

/**
 * Parse received payload from JSON to JS object
 *
 * @param {JSON} payload
 * @throws {err}
 * @returns {Object}
 */
Proxy.prototype.decode = function (payload) {
  return JSON.parse(payload);
};

/**
 * Encode outgoing message from JS object into stringified JSON.
 *
 * @param {Object} message
 *
 * @returns {string}
 *
 */
Proxy.prototype.encode = function (message) {
  if (typeof message !== "object") {
    const err = new Error("wrong message format");
    err.name = ERR_NAME;
  }

  try {
    const encoded = JSON.stringify(message);
    return encoded;
  } catch (err) {
    err.name = ERR_NAME;
    throw err;
  }
};

Proxy.prototype.registerClient = function (sub, options, cb) {
  if (!this.subscriptions.has(sub)) {
    this.subscriptions.set(sub, []);
  }
  const clients = this.subscriptions.get(sub);
  const client = {
    id: new Date().getTime(),
    cb,
    transient: options.transient,
  };
  clients.push(client);
  return client;
};

/**
 * Subscribe a callback function to the requested topic
 *
 * @param {string} alias - A topic, either registered or unregistered
 * @param {Object} options
 * @param {Boolean} options.transient - A transient client is to be
 * removed after one transaction.
 * @param {function(message)} cb - A client that is to be provided
 * with the message when and if one is available
 */
Proxy.prototype.subscribe = function (alias, options, cb) {
  if (typeof options === "function") {
    cb = options;
    options = {};
  }
  const [topic, pub, sub] = this.registry.resolve(alias);

  if (!this.subscriptions.has(sub)) {
    this.subscriptions.set(sub, []);
    this._subscribe(sub);
  }

  const client = this.registerClient(sub, options, cb);

  return () => this.unregisterClient(sub, client.id);
};

Proxy.prototype._subscribe = function (sub) {
  this.server.subscribe(sub, (err) => {
    if (err) this.notifyClients(sub, err);
  });
};

Proxy.prototype.fakeSub = function () {
  this.server.on("message", (topic, message) => {
    const sub = Array.from(this.registry.values()).find(
      (entry) => entry.sub === topic
    );
    if (topic === sub) {
      this.notifyClients(sub, message);
    }
  });
};

Proxy.prototype.notifyClients = function (sub, message) {
  let err = null;
  let decoded = null;

  if (message instanceof Error) {
    err = message;
  } else {
    try {
      decoded = this.decode(message);
    } catch (error) {
      error.name = ERR_NAME;
      err = error;
    }
  }

  const clients = this.subscriptions.get(sub).reduce((car, cdr) => {
    cdr.cb(err, decoded);
    if (!cdr.transient) {
      car.push(cdr);
    }
    return car;
  }, []);

  this.subscriptions.set(sub, clients);
};

export { Proxy };

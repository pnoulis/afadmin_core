import { Registry } from "./Registry.js";

let LOGGER = {
  debug: (...args) => console.log(...args),
};

class MqttProxyError extends Error {
  constructor(message, cause) {
    super(message, { cause });
    this.name = this.constructor.name;
  }
}

const ERR_NAME = "ERR_MQTT_PROXY";

function Proxy(userConf = {}) {
  const conf = this.parseConf(userConf);
  this.name = conf.name;
  this.id = conf.id;
  this.server = conf.server;
  this.registry = new Registry(conf.registry);
  this.subscriptions = new Map();

  this.server.on("message", (topic, message) => {
    const sub = Array.from(this.registry.values()).find(
      (entry) => entry.sub === topic
    );
    if (topic === sub) {
      this.notifyClients(sub, message);
    }
  });
}

Proxy.prototype.parseConf = function parseConf(userConf) {
  if (userConf.logger) {
    LOGGER = userConf.logger;
  }
  conf.name = userConf.proxy?.name || "mqtt_proxy";
  conf.id = `${conf.name}_${Math.random().toString(16).slice(2, 8)}`;
  conf.registry = userConf.registry || {};
  conf.registry.logger = LOGGER;
  conf.server = userConf.server ? userConf.server : (cb) => undefined;
  return conf;
};

Proxy.prototype.start = function () {};

Proxy.prototype.decode = (message) => JSON.parse(message);
Proxy.prototype.encode = (message) => JSON.stringify(message);

Proxy.prototype.registerClient = function (sub, options, cb) {
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
    this._subscribe(sub);
  }

  const client = this.registerClient(sub, options, cb);

  return () => this.unregisterClient(sub, client.id);
};

Proxy.prototype._subscribe = function (sub) {
  this.subscriptions.set(sub, []);
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
  let error = null;

  if (message instanceof Error) {
    error = message;
  } else {
    try {
      message = this.decode(message);
    } catch (err) {
      error = error;
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

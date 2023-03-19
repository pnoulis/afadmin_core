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
  this.registry = new Registry(conf.registry);
  this.subscriptions = new Map();

  this.server.on("message", (topic, message) => {
    if (!this.subscriptions.has(topic)) {
      return;
    }
    this.notifyClients(topic, message);
  });
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
  conf.server = userConf.server ? userConf.server : { on(...args) {} };
  return conf;
};

/**
 * @param {Buffer} msg - message as received from the server
 * @returns {Object}
 * @throws {MqttProxyError} - Failed to decode message
 **/
Proxy.prototype.decode = function decode(msg) {
  try {
    return JSON.parse(msg.toString());
  } catch (err) {
    throw new MqttProxyError("Failed to decode message", msg.toString());
  }
};

/**
 * @param {Object | string} msg
 * @returns {string} - stringified JSON
 * @throws {MqttProxyError}
 **/
Proxy.prototype.encode = function encode(msg) {
  try {
    return JSON.stringify(msg);
  } catch (err) {
    throw new MqttProxyError("Failed to encode message", msg);
  }
};

/**
 * @param {string} sub - Registered subscription
 * @param {Object} options
 * @param {Boolean} options.transient - A transient client is to be removed after it is the
 * recipient of just one message
 * @param {function} cb - A listener, if the server publishes to the subscirption topic
 * the client is notified through this registered callback
 * @returns {Object} client
 * @returns {string} client.id
 * @returns {function} client.cb
 * @returns {Boolean} client.transient
 **/
Proxy.prototype.registerClient = function registerClient(sub, options, cb) {
  const clients = this.subscriptions.get(sub);
  const client = {
    id: `${new Date().getTime()}_${clients.length}`,
    cb,
    transient: options.transient ?? false,
  };
  clients.push(client);
  LOGGER.debug("Registred new client", clients);
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
 * @param {Boolean} options.transient - A transient client is to be
 * removed after one transaction.
 * @param {function(message)} cb - A client that is to be provided
 * with the message when and if one is available
 */
Proxy.prototype.subscribe = function (route, options, cb) {
  if (typeof options === "function") {
    cb = options;
    options = {};
  }
  const [alias, pub, sub] = this.registry.resolve(route);

  if (!this.subscriptions.has(sub)) {
    this._subscribe(sub); // async
  }

  const { id } = this.registerClient(sub, options, cb);
  return () => this.unregisterClient(sub, id);
};

/**
 * @param {string} sub - Topic to subscribe to
 **/
Proxy.prototype._subscribe = function (sub) {
  this.subscriptions.set(sub, []);
  this.server.subscribe(sub, (err) => {
    if (err) {
      LOGGER.debug(`Failed to subscribe to topic: ${sub}`);
      this.notifyClients(
        sub,
        new MqttProxyError(`Failed to subscribe to topic: ${sub}`, err)
      );
    } else {
      LOGGER.debug(`Subscribed to topic: ${sub}`);
    }
  });
};

/**
 * @param {string} route - A registered route alias
 * @param {Object} payload - Data to send
 * @returns {Promise}
 **/
Proxy.prototype.publish = async function (route, payload) {
  return new Promise((resolve, reject) => {
    let alias, pub, sub;
    let client;
    try {
      [alias, pub, sub] = this.registry.resolve(route);
      if (!this.subscriptions.has(sub)) {
        this._subscribe(sub);
      }
      client = this.registerClient(sub, { transient: true }, (err, msg) => {
        if (err) {
          reject(err);
        } else {
          resolve(msg);
        }
      });
      const encoded = this.encode(payload);
      this._publish(pub, encoded, client);
    } catch (err) {
      let error = err;
      if (!(err instanceof MqttProxyError)) {
        error = new MqttProxyError('Unknown error', err);
      }
      LOGGER.debug(error);
      reject(error);
      this.unregisterClient(sub, client.id);
    }
  });
};

/**
 * @param {string} pub - The topic to publish to
 * @param {string} payload - The encoded data to send
 * @param {Object} client - The client to deliver the response to, if any
 **/
Proxy.prototype._publish = function _publish(pub, payload, client) {
  this.server.publish(pub, payload, (err) => {
    if (err) {
      LOGGER.debug('Unknown error', err);
      client.cb(new MqttProxyError("Unknown error", err));
    } else {
      LOGGER.debug(`Successfully published at topic: ${pub}`);
    }
  });
};

/**
 * @param {string} sub - The subscription topic
 * @param {buffer | error} message - Either a buffer represting the undecoded payload
 * as transmitted by the server or an error which signals the subscription could
 * not be established
 **/
Proxy.prototype.notifyClients = function (sub, message) {
  let error = null;
  let decoded;

  if (message instanceof Error) {
    error = message;
  } else {
    try {
      decoded = this.decode(message);
    } catch (err) {
      error = err;
    }
  }

  LOGGER.debug(`message arrived for subscription: ${sub}`);
  if (error) {
    LOGGER.debug(error);
  }
  const clients = this.subscriptions.get(sub).filter((client) => {
    client.cb(error, decoded);
    return !client.transient;
  });
  this.subscriptions.set(sub, clients);
};

export { Proxy };

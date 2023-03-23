/*
  ------------------------------ Mqtt Registry ------------------------------

  This program is a component part of the Mqtt Proxy. It is used as a registry
  of routes.

  A route is not strictly a topic. Each route corresponds to 1 or 2 topics. Both of these
  topics represent a transaction between a backend server and a client.
  Why use the concept of a route and not topics?
  Because a route allows the server to send its response to a different topic that then one
  it received the messages. Therefore a route is an abstraction over topics. The route
  represents a complete response-request cycle.

  Each route is made up of 3 parts.

  1. Alias
  2. Publishing topic
  3. Subscription topic

  Alias:
  Aliases make it easier to refer to the route's topics which may be long.
  Not only that but aliases allow us to refer to 2 topics as one.
 */

let LOGGER = {
  debug: (...args) => console.log(...args),
};

class MqttRegistryError extends Error {
  constructor(message, cause) {
    super(message, { cause });
    this.name = this.constructor.name;
  }
}

function Registry(userConf = {}) {
  const conf = this.parseConf(userConf);
  this.strict = conf.strict;
  this.paramSyntax = conf.paramSyntax;
  this.params = conf.params;
  this.routes = new Map();
  conf.routes.forEach((route) => this.setRoute(route));
}

Registry.prototype.parseConf = function parseConf(userConf) {
  if (userConf.logger) {
    LOGGER = userConf.logger;
  }
  const conf = {};
  conf.strict = userConf.strict ?? true;
  conf.params = new Map(Object.entries(userConf.params || {}));
  conf.paramSyntax = new RegExp(userConf.paramSyntax || "\\${([a-zA-Z]+)}");
  conf.routes = userConf.routes || [];
  return conf;
};

/**
 * @param {Object} route
 * @param {String} route.alias - The key to the route's pub and sub topics
 * @param {String} route.pub - The route's publishing topic
 * @param {String} route.sub - The route's subscription topic
 * @returns {Map} route - The route
 * @throws {MqttRegistryError} Invalid route alias: <route.alias>
 **/
Registry.prototype.setRoute = function setRoute(route) {
  if (typeof route.alias !== "string" || route.alias.length < 1) {
    throw new MqttRegistryError(`Invalid route alias: ${route.alias}`);
  }
  const [alias, pub, sub] = this.canonicalizeTopics(
    route.alias,
    route.pub,
    route.sub
  );
  return this.routes.set(alias, { pub, sub });
};

/**
 * @returns {Object | undefined} route
 * Where the return object is: { alias, pub, sub }
 **/
Registry.prototype.getRoute = function getRoute(alias) {
  // this performs no alias resultion and does not
  // throw any error if if ther route does not exist
  const route = this.routes.get(alias);
  return route
    ? {
        alias,
        ...route,
      }
    : undefined;
};

/**
 * @param {string} key - Should confrom to Registry.paramSyntax
 * @param {string} value
 * @returns {string} value
 **/
Registry.prototype.setParam = function setParam(key, value) {
  if (typeof value !== "string") {
    throw new MqttRegistryError(`Parameter value: ${value} must be a string`);
  }
  return this.params.set(key, value);
};

/**
 * @param {string} key - Paremeter key
 * @returns {Object | undefined} param
 **/
Registry.prototype.getParam = function getParam(key) {
  return this.params.get(key);
};

/**
 * Translate a malformed topic to conform to the syntax
 *
 * @param {string[]} topics
 * @returns {string|string[]}
 */
Registry.prototype.canonicalizeTopics = function canonicalizeTopics(...topics) {
  return topics.map((topic, i) => {
    if (topic == null) {
      return topic;
    }
    topic = topic.replace(/\/{2,}/g, "/");
    if (!topic.startsWith("/")) topic = "/" + topic;
    if (topic.endsWith("/")) topic = topic.slice(0, -1);
    topic = topic.replace(/\s/g, "");
    return topic;
  });
};

/**
 * Replace possible parameters within a topic if any match
 * with those registered.
 *
 * A topic parameter of the form ${[a-z]*} part of a topic:
 * /mytopic/${param}/go/on
 * is to be replaced by the registered parameter value if any.
 *
 * @param {string[]} topics
 *
 * @throws {Error} Missing parameter
 * @returns {string|string[]}
 */
Registry.prototype.replaceParams = function replaceParams(...topics) {
  return topics.map((topic, i) => {
    if (topic === null) {
      return topic;
    }
    return topic.replace(/\${([a-z]+)}/gi, (match, param) => {
      const value = this.getParam(param);
      if (!value) {
        throw new MqttRegistryError(
          `Missing parameter: ${param} for topic: ${topic}`
        );
      }
      return value;
    });
  });
};

/**
 * Resolve a topic alias. A topic alias is 'resolved' to
 * produce:
 *
 * [0] - the topic alias after canonicalization.
 * [1] - the topic to publish to. named pub
 * [2] - the topic to subscribe to. named sub
 *
 * In case of an unregistered topic alias:
 * If in strict mode -> throw an error
 * If not in strict mode each member of the return array
 * is equal to the alias provided after canonicalization.
 * [0, 1, 2] - canonicalized alias
 *
 * @param {string} alias
 * @throws {Error} Unregistered topic alias
 * @returns {string[]}
 */
Registry.prototype.resolve = function resolve(route) {
  const [alias] = this.canonicalizeTopics(route);
  if (!this.routes.has(alias) && this.strict) {
    throw new MqttRegistryError(`Unregistered route alias: ${alias}`);
  }
  let { pub, sub } = this.routes.get(alias) || { pub: alias, sub: alias };
  [pub, sub] = this.replaceParams(pub, sub);
  return {
    alias,
    pub,
    sub,
  };
};

export { Registry };

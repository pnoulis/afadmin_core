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
  this.routes = conf.routes;
}

Registry.prototype.parseConf = function parseConf(userConf) {
  return {
    strict: userConf.strict ?? true,
    params: new Map(Object.entries(userConf.params || {})),
    paramSyntax: userConf.paramSyntax || "${[a-zA-Z]+}",
    routes: new Map(
      userConf.routes
        ? userConf.routes.map((route) => {
            const [alias, pub, sub] = this.canonicalizeTopics(
              route.alias,
              route.pub,
              route.sub
            );
            return [alias, { pub, sub }];
          })
        : []
    ),
  };
};

Registry.prototype.setRoute = function (route) {
  if (
    !Object.values(route).every((v) => typeof v === "string" && v.length > 1)
  ) {
    throw new MqttRegistryError(`Invalid input: ${route}`);
  }
  const [alias, pub, sub] = this.canonicalizeTopics(
    route.alias,
    route.pub,
    route.sub
  );
  return this.routes.set(alias, { pub, sub });
};

Registry.prototype.getRoute = function (alias) {
  return this.routes.get(alias);
};

Registry.prototype.setParam = function ({ key, value }) {
  // TODO perform input validation
  return this.params.set(key, value);
};

Registry.prototype.getParam = function (key) {
  return this.params.get(key);
};

Registry.prototype.getTopic = function (topic) {
  const alias = Array.from(this.registry.keys()).find(
    (el) => el === this.canonicalizeTopics(topic)
  );
  if (!alias) return null;
  return {
    alias,
    ...this.registry.get(alias),
  };
};

Registry.prototype.addParam = function (key, value) {
  this.params[key] = value;
};

/**
 * Translate a malformed topic to conform to the syntax
 *
 * @param {string[]} topics
 * @returns {string|string[]}
 */
Registry.prototype.canonicalizeTopics = (...topics) =>
  topics.map((topic, i) => {
    topic = topic.replace(/\/{2,}/g, "/");
    if (!topic.startsWith("/")) topic = "/" + topic;
    if (topic.endsWith("/")) topic = topic.slice(0, -1);
    topic = topic.replace(/\s/g, "");
    return topic;
  });

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
Registry.prototype.replaceParams = (...topics) =>
  topics.map((topic, i) =>
    topic.replace(/\${([a-z]*)}/gi, (match, param) => {
      const value = this.getParam(param);
      if (!value) {
        throw new MqttRegistryError(
          `Missing parameter: ${param} for topic: ${topic}`
        );
        return value;
      }
    })
  );
// Registry.prototype.replaceParams = function (...topics) {
//   const replaced = topics.map((topic, i) => topic.replace(/\${([a-z]*)}/gi, (match, param) => {
//     param = this.getParam(param);
//     if (!param) {
//       throw new MqttRegistryError(
//         `Missing parameter: ${match} for topic: ${topic}`
//       );
//     }
//     return param;
//   }))
//   // topics = topics.map((topic, i) => {
//   //   if (topic == null) {
//   //     return null;
//   //   }
//   //   topic = topic.replace(/\${([a-z]*)}/gi, (match, param) => {
//   //     param = this.params[param];
//   //     if (!param) {
//   //       throw new MqttRegistryError(
//   //         `Missing parameter: ${match} for topic: ${topic}`
//   //       );
//   //     }
//   //     return param;
//   //   });
//   //   return topic;
//   // });
//   return replaced.length > 1 ? replaced : replaced.pop();
// };

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
Registry.prototype.resolve = function resolve(alias) {
  const topic = this.canonicalizeTopics(alias);
  if (!this.registry.has(topic) && this.strict) {
    throw new MqttRegistryErorr(`Unregistered topic alias: ${topic}`);
  }
  const { pub, sub } = this.registry.get(topic) || { pub: topic, sub: topic };
  return [topic, ...this.replaceParams(pub, sub)];
};

export { Registry };

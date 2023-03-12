const ERR_NAME = "ERR_MQTT_REGISTRY";
function Registry(config = {}) {
  const conf = this.parseConfig(config);
  this.strict = conf.strict;
  this.params = conf.params;
  conf.topics = conf.topics.map((topic) => {
    const [alias, pub, sub] = this.canonicalizeTopics(
      topic.alias,
      topic.pub,
      topic.sub
    );
    return [alias, { pub, sub }];
  });
  this.registry = new Map(conf.topics);
}

Registry.prototype.parseConfig = function (config) {
  return {
    strict: config.strict ?? true,
    topics: config.topics || [],
    params: config.params || {},
  };
};

Registry.prototype.addTopic = function (topic) {
  const [alias, pub, sub] = this.canonicalizeTopics(
    topic.alias,
    topic.pub,
    topic.sub
  );
  this.registry.set(alias, { pub, sub });
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
 * Translate a malformed topic to canonical form.
 *
 * @param {string[]} topics
 * @returns {string|string[]}
 */
Registry.prototype.canonicalizeTopics = function (...topics) {
  topics = topics.map((topic, i) => {
    if (topic == null) {
      return null;
    }
    topic = topic.replace(/\/{2,}/g, "/");
    if (!topic.startsWith("/")) topic = "/" + topic;
    if (topic.endsWith("/")) topic = topic.slice(0, -1);
    topic = topic.replace(/\s/g, "");
    return topic;
  });

  return topics.length > 1 ? topics : topics.pop();
};

/**
 * Replace possible parameters within a topic if any match
 * with those registered.
 *
 * A topic parameter of the form ${[a-z]*} part of a topic:
 * /mytopic/${param}/go/on
 * is to be replaced by the registered parameter value if any.
 *
 * @param {...string|Array.<...string, object>} topics
 * @returns {string|string[]}
 */
Registry.prototype.replaceParams = function (...topics) {
  topics = topics.map((topic, i) => {
    if (topic == null) {
      return null;
    }
    topic = topic.replace(/\${([a-z]*)}/gi, (match, param) => {
      param = this.params[param];
      if (!param) {
        const err = new Error(
          `Missing parameter: '${match}' for topic: ${topic}`
        );
        err.name = ERR_NAME;
        throw err;
      }
      return param;
    });
    return topic;
  });
  return topics.length > 1 ? topics : topics.pop();
};

/**
 * Resolve a topic alias. A topic alias is 'resolved' to
 * produce:
 *
 * [0] - the topic alias after canonicalization.
 * [1] - the topic to publish to. named pub
 * [2] - the topic to subscribe to. named sub
 *
 * In case of an unregistered topic alias each member of the return array
 * is equal to the topic alias after canonicalization.
 *
 * [0] - the topic alias after canonicalization.
 * [1] - the topic alias after canonicalization.
 * [2] - the topic alias after canonicalization.
 *
 * If the registry is operating in strict mode an unregistered topic
 * alias throws an Error.
 *
 * @param {string} alias
 *
 * @throws {Error} Unregistered topic alias
 * @returns {string[]}
 */
Registry.prototype.resolve = function resolve(alias) {
  const topic = this.canonicalizeTopics(alias);
  if (!this.registry.has(topic) && this.strict) {
    const err = new Error(`Unregistered topic: ${topic}`);
    err.name = ERR_NAME;
    throw err;
  }
  const { pub, sub } = this.registry.get(topic) || { pub: topic, sub: topic };
  return [topic, ...this.replaceParams(pub, sub)];
};

export { Registry };

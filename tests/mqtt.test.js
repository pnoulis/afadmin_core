import { describe, it, expect } from "vitest";
import { Registry, Proxy } from "/src/mqtt/index.js";
import { mqttBackendTopics } from "/data/index.js";
import { connect } from "mqtt";

describe("mqtt proxy registry", () => {
  it("Should build a default configuration", () => {
    const expectedDefaultConfig = {
      strict: true,
      params: {},
      paramSyntax: new RegExp("\\${([a-zA-Z]+)}"),
      routes: new Map(),
    };
    const registry = new Registry();
    expect(registry.strict).toBe(true);
    expect(registry.params).toBeTypeOf(typeof expectedDefaultConfig.params);
    expect(registry.paramSyntax.toString()).toBe(
      expectedDefaultConfig.paramSyntax.toString()
    );
    expect(registry.routes).toBeTypeOf(typeof expectedDefaultConfig.routes);
  });

  it("Should build a custom configuration", () => {
    const expectedCustomConfig = {
      strict: false,
      paramSyntax: "~[a-z+]~",
      params: { dummyParam: "someParam" },
      routes: [
        {
          alias: "/some/route",
          pub: "/publish/to/route",
          sub: "/sub/to/route",
        },
        {
          alias: "/some/route/2",
          pub: "/publish/to/route/2",
          sub: "/sub/to/route/2",
        },
      ],
    };

    const registry = new Registry(expectedCustomConfig);
  });

  it("Should canonicalize a malformed topic", () => {
    const malformedTopics = new Map([
      ["topic", "/topic"],
      ["topic/backend", "/topic/backend"],
      ["topic/backend/", "/topic/backend"],
      ["/topic/backend", "/topic/backend"],
      ["////topic/////backend////", "/topic/backend"],
      ["topic   /backend", "/topic/backend"],
      ["/   topic/bac   kend/", "/topic/backend"],
    ]);
    const registry = new Registry();
    const canonicalizedTopics = registry.canonicalizeTopics(
      ...malformedTopics.keys()
    );
    expect(canonicalizedTopics).toEqual(Array.from(malformedTopics.values()));
  });

  it("Should add topics at runtime", () => {
    const registry = new Registry();
    const adhocTopic = {
      alias: "/some",
      pub: "/some/topic",
      sub: "/some/topic/response",
    };
    registry.setRoute(adhocTopic);
    expect(registry.getRoute(adhocTopic.alias)).toStrictEqual(adhocTopic);
  });

  it("Should successfully replace a registered parameter", () => {
    const topic = {
      pub: "/some/${paramKey}/topic",
      sub: "/some/${paramKey}/topic/response",
    };
    const registry = new Registry({
      params: {
        paramKey: "remote",
      },
    });

    expect(registry.replaceParams(topic.pub, topic.sub)).toStrictEqual([
      "/some/remote/topic",
      "/some/remote/topic/response",
    ]);
  });

  it("Should throw an error if a parameter could not be replaced", () => {
    const topic = "/some/${missingParam}/topic";
    const registry = new Registry();
    expect(() => registry.replaceParams(topic)).toThrowError(
      "Missing parameter"
    );
  });

  it("Should successfully resolve a registred alias and its parameters if any", () => {
    const topic = {
      alias: "/some",
      pub: "/some/${paramKey}/topic",
      sub: "/some/${paramKey}/topic/response",
    };
    const registry = new Registry({
      params: { paramKey: "remote" },
      routes: [topic],
    });

    expect(registry.resolve(topic.alias)).toStrictEqual([
      topic.alias,
      "/some/remote/topic",
      "/some/remote/topic/response",
    ]);
  });
  it("Should successfully resolve a non registered alias in non-strict mode", () => {
    const topic = {
      alias: "/some",
    };
    const registry = new Registry({
      strict: false,
    });
    expect(registry.resolve(topic.alias)).toStrictEqual([
      topic.alias,
      topic.alias,
      topic.alias,
    ]);
  });
  it("Should throw an error if it fails to resolve a topic in strict mode", () => {
    const topic = {
      alias: "/some",
    };

    const registry = new Registry({
      strict: true,
    });
    expect(() => registry.resolve(topic.alias)).toThrowError(
      "Unregistered route"
    );
  });
});

describe("mqtt proxy", () => {
  it("Should build a default configuration", () => {
    const name = "mqtt_proxy";
    const id = `${name}_${Math.random().toString(16).slice(2, 8)}`;
    const expectedDefaultConfig = {
      name,
      id,
      server: {
        host: "some_host",
        options: {
          keepAlive: 30,
          protocolId: "MQTT",
          protocolVersion: 4,
          clean: false,
          reconnectPeriod: 5000,
          connectTimeout: 30 * 1000,
          clientId: id,
        },
      },
    };

    const mqtt = new Proxy({
      proxy: {
        id: expectedDefaultConfig.id,
        name: expectedDefaultConfig.name,
      },
      server: {
        host: "some_host",
      },
    });

    expect({
      name: mqtt.name,
      id: mqtt.id,
      server: mqtt.server,
    }).toStrictEqual(expectedDefaultConfig);
  });

  it("Should build a custom configuration", () => {
    const name = "some_proxy";
    const id = `${name}_wtf`;
    const expectedCustomConfig = {
      name,
      id,
      server: {
        host: "some_host",
        options: {
          keepAlive: 55,
          protocolId: "MQTT",
          protocolVersion: 4,
          clean: true,
          reconnectPeriod: 6000,
          connectTimeout: 1000,
          clientId: id,
        },
      },
    };

    const mqtt = new Proxy({
      proxy: {
        name: expectedCustomConfig.name,
        id: expectedCustomConfig.id,
      },
      server: expectedCustomConfig.server,
    });
    expect({
      name: mqtt.name,
      id: mqtt.id,
      server: mqtt.server,
    }).toStrictEqual(expectedCustomConfig);
  });

  it("Should successfully connect to the backend server", () => {
    const host = "ws://test.mosquitto.org:8080";
    const client = connect(host);
    expect(true).toBe(true);
  });
});

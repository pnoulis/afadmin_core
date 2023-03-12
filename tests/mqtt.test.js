import { describe, it, expect } from "vitest";
import { Registry } from "/src/mqtt";
import { mqttBackendTopics } from "/data/index.js";

describe("mqtt proxy registry", () => {
  it("Should build a default configuration", () => {
    const expectedDefaultConfig = {
      strict: true,
      params: {},
      registry: new Map(),
    };
    const registry = new Registry();
    expect({
      strict: registry.strict,
      params: registry.params,
      registry: registry.registry,
    }).toEqual(expectedDefaultConfig);
  });

  it("Should build a custom configuration", () => {
    const expectedCustomConfig = {
      strict: false,
      params: { dummyParam: "someParam" },
      registry: new Map([
        [
          "/fakeTopicAlias",
          { pub: "/backend/some/topic", sub: "/backend/some/topic/response" },
        ],
      ]),
    };

    const registry = new Registry({
      strict: false,
      params: { dummyParam: "someParam" },
      topics: [
        {
          alias: "/fakeTopicAlias",
          pub: "/backend/some/topic",
          sub: "/backend/some/topic/response",
        },
      ],
    });

    expect({
      strict: registry.strict,
      params: registry.params,
      registry: registry.registry,
    }).toEqual(expectedCustomConfig);
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
    registry.addTopic(adhocTopic);
    expect(registry.getTopic(adhocTopic.alias)).toStrictEqual(adhocTopic);
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
      "Missing parameter: '${missingParam}' for topic: /some/${missingParam}/topic"
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
      topics: [topic],
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
      "Unregistered topic: /some"
    );
  });
});

describe("mqtt proxy", () => {
  it("Should run", () => {
    expect(true).toBe(true);
  });
});

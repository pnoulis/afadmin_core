import Pino from "pino";
import { detectRuntime, detectMode, getEnvar } from "./src/lib/index.js";
import { AgentFactoryMachine } from "./src/afm/index.js";
import {
  BackendClientService,
  BackendServerService,
} from "./src/services/index.js";

const RUNTIME = detectRuntime();
const MODE = detectMode();
const LOGLEVEL = getEnvar("VITE_LOGLEVEL", false, "debug");
const CONFIG = {};

if (/dev.*/.test(MODE)) {
  console.log("Configuration running in development mode");

  const { BACKEND_TOPICS, BACKEND_PACKAGES, BACKEND_MOCK_STATE } = await import(
    "./config/data/index.js"
  );
  const { Proxy } = await import("./src/mqtt/index.js");
  if (RUNTIME === "node") {
    var MqttBroker = await import("mqtt");
  } else {
    var MqttBroker = await import("precompiled-mqtt");
  }
  const HOST = getEnvar("VITE_BACKEND_URL");
  const BACKEND_CLIENT_ID = getEnvar(
    "VITE_BACKEND_CLIENT_ID",
    true,
    `${MODE}:${Math.random().toString(16).slice(2, 8)}`
  );
  const BACKEND_LOGLEVEL = getEnvar("VITE_BACKEND_LOGLEVEL", true, LOGLEVEL);
  const AFM_LOGLEVEL = getEnvar('VITE_AFM_LOGLEVEL', true, LOGLEVEL);
  const mqttBroker = new MqttBroker.connect(HOST, {
    clientId: BACKEND_CLIENT_ID,
  });

  /*
    Configure Loggers
   */

  const Logger = new Pino({
    level: LOGLEVEL,
    name: "afadmin",
    timestamp: Pino.stdTimeFunctions.isoTime,
    formatters: {
      level: (label) => ({ level: label }),
    },
    base: {
      mode: MODE,
      runtime: RUNTIME,
    },
    browser: RUNTIME === "browser" ? { asObject: true } : undefined,
  });

  const backendLogger = Logger.child(
    {},
    { msgPrefix: "[BACKEND] ", level: BACKEND_LOGLEVEL }
  );

  const backendClientLogger = backendLogger.child(
    {},
    { msgPrefix: "[CLIENT] "}
  );

  const backendServerLogger = backendLogger.child(
    {},
    { msgPrefix: "[SERVER] " }
  );

  const afmLogger = Logger.child(
    {},
    { msgPrefix: "[AFM] ", level: AFM_LOGLEVEL }
  );

  /*
    Configure mock backend server service
    needs: proxy, Logger
  */
  const makeBackendTopics = (backendTopics) => {
    return backendTopics.map((topic) => ({
      alias: topic.alias,
      pub: topic.sub,
      sub: topic.pub,
    }));
  };

  const backendServer = new Proxy({
    id: BACKEND_CLIENT_ID,
    server: mqttBroker,
    logger: backendServerLogger,
    transactionMode: {
      publish: "ff",
      subscribe: "persistent",
    },
    registry: {
      params: {
        clientId: BACKEND_CLIENT_ID,
      },
      routes: makeBackendTopics(BACKEND_TOPICS),
      strict: true,
    },
  });

  const backendServerService = BackendServerService(MODE)({
    proxy: backendServer,
    mockState: BACKEND_MOCK_STATE,
    mockPackages: BACKEND_PACKAGES,
    logger: backendServerLogger,
  });

  /*
    Configure backend client service
    needs: proxy
   */
  const backendClient = new Proxy({
    id: BACKEND_CLIENT_ID,
    server: mqttBroker,
    logger: backendClientLogger,
    registry: {
      params: { clientId: BACKEND_CLIENT_ID },
      routes: BACKEND_TOPICS,
      strict: true,
    },
  });

  const backendClientService = new BackendClientService(MODE)({
    proxy: backendClient,
    logger: backendClientLogger,
  });

  /*
    Configure Agent Factory Machine
   */
  const afmServices = {
    backend: backendClientService,
    logger: afmLogger,
  };

  CONFIG.afm = new AgentFactoryMachine({ services: afmServices });
} else if (/stag.*/.test(MODE)) {
  console.log("Configuration running in staging mode");
} else if (/prod.*/.test(MODE)) {
  console.log("Configuration running in production mode");
} else {
  throw new Error(`Unknown mode:${MODE}`);
}

export { CONFIG };

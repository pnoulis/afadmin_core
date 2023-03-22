import { BackendClient } from "./backend_client.js";
/*
  The backend client service is dependent on src/mqtt/proxy and an mqtt broker.
  In development mode both of these are expected to be provided to the service
  already configured.

  HOST - The address of the backend server specified as a URL
         https://en.wikipedia.org/wiki/URL
  BACKEND_CLIENT_ID
       - ID string that creates a unique communication channel between
         backend client and server
  BACKEND_ROUTES
       - The addressable backend resources specified as a MQTT topic
  ROUTE_PARAMS
       -
  MqttBroker
 */

function BackendClientService(mode) {
  if (!/prod.*/.test(mode)) {
    return service_dev;
  } else {
    return service_prod;
  }
}

function service_dev({ proxy }) {
  return BackendClient(proxy);
}

function service_prod() {
  console.log("service production");
}

export { BackendClientService };

import { BackendServer } from "./backend_server.js";

function BackendServerService(mode) {
  if (!/prod.*/.test(mode)) {
    return service_dev;
  } else {
    return service_prod;
  }
}

function service_dev({ proxy, mockState, mockPackages }) {
  return BackendServer(proxy, mockState, mockPackages);
}

function service_prod() {
  console.log("server production");
}

export { BackendServerService };

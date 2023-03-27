import { App } from "./App.jsx";
import { routeHome } from "./route_home/index.js";
import { routeRegistration } from "./route_registration/index.js";

const routesApp = [
  {
    path: "/",
    element: <App />,
    children: [routeHome, routeRegistration],
  },
];

export { routesApp };

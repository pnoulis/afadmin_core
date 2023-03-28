import { App } from "./App.jsx";
import { RouteHome } from "./route_home/index.js";
import { RouteRegistration } from "./route_registration/index.js";

const routesApp = [
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "/",
        element: <RouteHome />,
      },
      {
        path: "/registration",
        element: <RouteRegistration />,
      },
    ],
  },
];

export { routesApp };

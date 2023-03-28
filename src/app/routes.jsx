import { App } from "./App.jsx";
import { RouteHome } from "./route_home/index.js";
import {
  RouteRegistration,
  RoutePlayer,
  RouteWristband,
  RouteHistory,
} from "./route_registration/index.js";

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
        path: "/registration/player",
        element: <RouteRegistration />,
        children: [
          {
            path: "/registration/player",
            element: <RoutePlayer />,
          },
          {
            path: "/registration/player/wristband",
            element: <RouteWristband />,
          },
          {
            path: "/registration/player/history",
            element: <RouteHistory />,
          },
        ],
      },
    ],
  },
];

export { routesApp };

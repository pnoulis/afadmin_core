import * as React from "react";
import ReactDOM from "react-dom/client";
import { routesApp } from "./app/index.js";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { FlashMessagesRoot } from "./flash_messages";
import { ModalsRoot } from "./modals";

const router = createBrowserRouter([
  {
    path: "/",
    children: routesApp,
  },
]);

ReactDOM.createRoot(
  document.getElementById("flash-messages-react-root")
).render(
  <React.StrictMode>
    <FlashMessagesRoot />
  </React.StrictMode>
);

const modalsRoot = ReactDOM.createRoot(
  document.getElementById("modals-react-root")
);
modalsRoot.render(
  <React.StrictMode>
    <ModalsRoot root={modalsRoot} />
  </React.StrictMode>
);

ReactDOM.createRoot(document.getElementById("app-react-root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);

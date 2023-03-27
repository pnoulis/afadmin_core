import * as React from "react";
import { Outlet } from "react-router-dom";
import {
  AppLayout,
  AppLayoutHeader,
  AppLayoutMain,
  AppLayoutSidebar,
  Header,
  Sidebar,
} from "./site_wide/index.js";

function App() {
  return (
    <AppLayout>
      <AppLayoutHeader>
        <Header />
      </AppLayoutHeader>
      <AppLayoutSidebar>
        <Sidebar />
      </AppLayoutSidebar>
      <AppLayoutMain>
        <Outlet />
      </AppLayoutMain>
    </AppLayout>
  );
}

export { App };

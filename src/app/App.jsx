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
import { useAfm, AfmProvider } from "/src/hooks/index.js";

function App() {
  const afm = useAfm();
  return (
    <AfmProvider value={afm}>
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
    </AfmProvider>
  );
}

export { App };

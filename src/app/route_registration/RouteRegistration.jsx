import {
  AppLayoutMainPanel,
  AppLayoutPanelHeader,
  AppLayoutPanelMain,
} from "/src/app/site_wide/index.js";
import { Outlet } from "react-router-dom";
import { Header } from "./Header.jsx";

function RouteRegistration() {
  return (
    <AppLayoutMainPanel>
      <AppLayoutPanelHeader>
        <Header />
      </AppLayoutPanelHeader>
      <AppLayoutPanelMain>
        <Outlet />
      </AppLayoutPanelMain>
    </AppLayoutMainPanel>
  );
}

export { RouteRegistration };

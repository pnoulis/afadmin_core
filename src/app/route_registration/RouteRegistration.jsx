import {
  AppLayoutMainPanel,
  AppLayoutPanelHeader,
  AppLayoutPanelMain,
} from "/src/app/site_wide/index.js";
import { Header } from "./Header.jsx";

function RouteRegistration() {
  return (
    <AppLayoutMainPanel>
      <AppLayoutPanelHeader>
        <Header />
      </AppLayoutPanelHeader>
      <AppLayoutPanelMain>route registration</AppLayoutPanelMain>
    </AppLayoutMainPanel>
  );
}

export { RouteRegistration };

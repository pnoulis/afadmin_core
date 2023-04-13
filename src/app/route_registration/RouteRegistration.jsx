import * as React from 'react';
import {
  AppLayoutMainPanel,
  AppLayoutPanelHeader,
  AppLayoutPanelMain,
} from "/src/app/site_wide/index.js";
import { Outlet } from "react-router-dom";
import { Header } from "./Header.jsx";
import { WristbandRegisterProvider } from './Context.jsx';

function RouteRegistration() {
  const [players, setPlayers] = React.useState([]);
  return (
    <WristbandRegisterProvider value={{players, setPlayers}}>
      <AppLayoutMainPanel>
        <AppLayoutPanelHeader>
          <Header />
        </AppLayoutPanelHeader>
        <AppLayoutPanelMain>
          <Outlet />
        </AppLayoutPanelMain>
      </AppLayoutMainPanel>
    </WristbandRegisterProvider>
  );
}

export { RouteRegistration };

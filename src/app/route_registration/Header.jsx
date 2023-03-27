import { PanelNavbar } from "/src/app/site_wide/index.js";
import {
  getRegistrationPlayerLink,
  getRegistrationWristbandLink,
  getRegistrationHistoryLink,
} from "/src/app/links.jsx";
import { ReactComponent as AddPlayerIcon } from "/assets/icons/add_player.svg";
import { ReactComponent as WristbandIcon } from "/assets/icons/wristband.svg";
import { ReactComponent as SummaryIcon } from "/assets/icons/summary.svg";

const panelLinks = [
  {
    ...getRegistrationPlayerLink(),
    Icon: <AddPlayerIcon />,
  },

  {
    ...getRegistrationWristbandLink(),
    Icon: <WristbandIcon />,
  },
  {
    ...getRegistrationHistoryLink(),
    Icon: <SummaryIcon />,
  },
];

function Header() {
  return <PanelNavbar items={panelLinks} />;
}

export { Header };

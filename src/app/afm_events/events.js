import { FlashMessage } from "/src/flash_messages";
import { Modal } from "/src/modals";
import { getRegisterPlayer } from "./registerPlayer.jsx";
import { getSearchPlayer } from "./searchPlayer.jsx";

const eventsMap = {
  registerPlayer: getRegisterPlayer,
  searchPlayer: getSearchPlayer,
};

const getEvents = (afm, ...events) => {
  const e = {};
  events.forEach((event) => {
    e[event] = Object.hasOwn(eventsMap, event)
      ? eventsMap[event](afm, FlashMessage, Modal)
      : null;
  });
  return e;
};

export { getEvents };
